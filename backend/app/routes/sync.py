from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from supabase import create_client
from plaid.api.plaid_api import PlaidApi
from plaid.api_client import ApiClient
from plaid.configuration import Configuration
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
import pandas as pd
import joblib
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
model = joblib.load(BASE_DIR / "ml" / "models" / "fraud_model.pkl")
explainer = joblib.load(BASE_DIR / "ml" / "models" / "shap_explainer.pkl")

router = APIRouter(prefix="/sync", tags=["sync"])
security = HTTPBearer()

def get_supabase():
    return create_client(settings.supabase_url, settings.supabase_key)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    supabase = get_supabase()
    try:
        user = supabase.auth.get_user(token)
        return user.user
    except:
        raise HTTPException(status_code=401, detail="Invalid/expired token")

def get_plaid_client():
    configuration = Configuration(
        host = "https://sandbox.plaid.com" if settings.plaid_env == "sandbox" else "https://production.plaid.com",
        api_key = {
            "clientId": settings.plaid_client_id,
            "secret": settings.plaid_secret
        }
    )
    return PlaidApi(ApiClient(configuration))

@router.post("/transactions")
def user_transactions(user = Depends(get_current_user)):
    supabase = get_supabase()
    plaid = get_plaid_client()

    account = supabase.table("accounts")\
        .select("*")\
        .eq("user_id", str(user.id))\
        .execute()
    access_token = account.data[0]["plaid_access_token"]

    start_date = (datetime.now() - timedelta(days=30)).date()
    end_date = datetime.now().date()
    request = TransactionsGetRequest(
        access_token=access_token,
        start_date=start_date,
        end_date=end_date
    )
    response = plaid.transactions_get(request)
    transactions = response["transactions"]