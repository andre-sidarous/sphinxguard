'use Client'

import { useCallback, useEffect, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import axios from 'axios'

interface Props {
    onSuccess: () => void
}

export default function PlaidLink({ onSuccess }: Props) {
    const [linkToken, setLinkToken] = useState<string | null>(null)

    useEffect(() => {
        const fetchLinkToken = async () => {
            try {
                const token = localStorage.getItem('access_token')
                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/plaid/create-link-token`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                setLinkToken(res.data.link_token)
            } catch (err) {
                console.error('Failed to get link token', err)
            }
        }
        fetchLinkToken()
    }, [])

    const onPlaidSuccess = useCallback(async (publicToken: string) => {
        try {
            const token = localStorage.getItem('access_token')
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/plaid/exchange-token`,
                { public_token: publicToken },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/sync/transactions`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            onSuccess()
        } catch(err) {
            console.error('Failed to link account', err)
        }
    }, [onSuccess])

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: (public_token) => onPlaidSuccess(public_token),
    })

    return (
        <button
            onClick={() => open()}
            disabled={!ready}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
            Connect Bank Account
        </button>
    )
}