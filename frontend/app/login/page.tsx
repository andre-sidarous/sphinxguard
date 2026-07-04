'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignup, setIsSignup] = useState(false)
    const [fullName, setFullName] = useState('')

    const handleSubmit = async () => {
        setLoading(true)
        try {
           if (isSignup) {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
                email,
                password,
                full_name: fullName,
            })
            toast.success('Account created! Please log in.')
            setIsSignup(false)
           }
           else {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                email,
                password,
            })
            localStorage.setItem('access_token', res.data.access_token)
            localStorage.setItem('user_id', res.data.user_id)
            toast.success('Welcome to SphinxGuard!')
            router.push('/dashboard')
           }
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <Toaster />
            <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border-gray-800">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">SphinxGuard</h1>
                    <p className="text-gray-400 mt-1">
                        {isSignup ? 'Create your account' : 'Sign in to your account'}
                    </p>
                </div>

                <div className="space-y-4">
                    {isSignup && (
                        <div>
                            <label className="text-sm text-gray-400">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full mt-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full mt-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400">Password</label>
                        <input
                            type="text"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full mt-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                    >
                        {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
                    </button>

                    <p className="text-center text-gray-400 text-sm">
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            className="text-blue-400 hover:text-blue-300"
                        >
                            {isSignup ? 'Sign in' : 'Sign up'}
                        </button>
                    </p>

                </div>
            </div>
        </div>
    )
}