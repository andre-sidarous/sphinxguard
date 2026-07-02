from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.config import settings
from supabase import create_client, Client

router = APIRouter(prefix="/auth", tags=["auth"])

def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_key)

# Validate requests for sign ups
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

# Validate requests for logins
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Create signup post request
@router.post("/signup")
def signup(body: SignUpRequest):
    try:
        supabase = get_supabase()
        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
        })
        user = response.user
        if not user:
            raise HTTPException(status_code=400, detail="SignUp Failed")
        
        # Create profile rows
        supabase.table("profiles").insert({
            "id": user.id,
            "email": body.email,
            "full_name": body.full_name,
        }).execute()

        return {"message": "Account created successfully", "user_id": user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Create login post request
@router.post("/login")
def login(body: LoginRequest):
    try:
        supabase = get_supabase()
        response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
        session = response.session
        if not session:
            raise HTTPException(status_code=401, detail="Invalid Credentials")
        
        return {
            "access_token": session.access_token,
            "token_type": "bearer",
            "user_id": response.user.id
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# Create logout post request
@router.post("/logout")
def logout():
    try:
        supabase = get_supabase()
        supabase.auth.sign_out()
        return {"message": "Logged Out Successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))