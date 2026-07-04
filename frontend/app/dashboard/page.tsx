'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { ShieldCheck, AlertTriangle, CreditCard, LogOut } from 'lucide-react'

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

export default function DashboardPage() {
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
        } catch(err) {
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

    const getFraudScore = (transactionId: string) => {
        return fraudScores.find(f => f.transaction_id === transactionId)
    }

    const flaggedCount = fraudScores.filter(f => f.is_flagged).length

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Toaster />

            {/* Navbar */}
        </div>
    )
}