'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { ShieldCheck, AlertTriangle, LogOut } from 'lucide-react'

interface Transaction {
    id: string
    merchant_name: string
    amount: number
    date: string
    category: string
    currency: string
}

interface FraudScore {
    transaction_id: string
    score: number
    is_flagged: boolean
    reasons: string[]
}

export default function AlertsPage() {
    const router = useRouter()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [fraudScores, setFraudScores] = useState<FraudScore[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchTransactions(token)
    }, [])

    const fetchTransactions = async (token: string) => {
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/transactions`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setTransactions(res.data.transactions || [])
            setFraudScores(res.data.fraud_scores || [])
        } catch (err) {
            toast.error('Failed to load transactions')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_id')
        router.push('/login')
    }

    const flaggedScores = fraudScores.filter(f => f.is_flagged)
    const flaggedTransactions = transactions.filter(transaction => 
        flaggedScores.some(f => f.transaction_id === transaction.id)
    )

    const getFraudScore = (transactionId: string) => {
        return fraudScores.find(f => f.transaction_id === transactionId)
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Toaster />

            <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="text-blue-400" size={24} />
                    <span className="text-xl font-bold">SphinxGuard</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">

                <div className="flex items-center gap-3 mb-8">
                    <AlertTriangle className="text-yellow-400" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold">Fraud Alerts</h1>
                        <p className="text-gray-400 text-sm">
                            {flaggedTransactions.length} flagged transaction{flaggedTransactions.length !== 1 ? 's' : ''} detected
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-12">
                        Loading alerts...
                    </div>
                ) : flaggedTransactions.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-12 text-center">
                        <ShieldCheck className="text-green-400 mx-auto mb-3" size={40} />
                        <p className="text-lg font-medium">No flagged transactions</p>
                        <p className="text-gray-400 text-sm mt-1">All your transactions look safe</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {flaggedTransactions.map(tx => {
                            const fraud = getFraudScore(tx.id)
                            return (
                                <div key={tx.id} className="bg-gray-900 border border-red-500/30 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="font-semibold text-lg">{tx.merchant_name || 'Unknown Merchant'}</p>
                                            <p className="text-gray-400 text-sm">{tx.category} - {tx.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{tx.currency} {tx.amount.toFixed(2)}</p>
                                            {fraud && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 font-medium">
                                                    {(fraud.score * 100).toFixed(1)}% fraud risk
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {fraud && fraud.reasons && fraud.reasons.length > 0 && (
                                        <div className="border-t border-gray-800 pt-4">
                                            <p className="text-sm text-gray-400 mb-2">Why this was flagged:</p>
                                            <div className="space-y-1">
                                                {fraud.reasons.map((reason: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm">
                                                        <span className="text-red-400">•</span>
                                                        <span className="text-gray-300">
                                                            {reason.feature}: {reason.impact > 0 ? '+' : ''}{reason.impact.toFixed(3)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}