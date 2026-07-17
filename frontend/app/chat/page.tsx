'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { ShieldCheck, Send, LogOut } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function ChatPage() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I\'m your SphinxGuard financial assistant. Ask me anything about your transactions or fraud alerts.' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (!token) {
            router.push('/login')
            return
        }
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim()) return
        const userMessage = input
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setInput('')
        setLoading(true)
        try {
            const token = localStorage.getItem('access_token')
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/chat/message`,
                { message: userMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
        } catch (err) {
            toast.error('Failed to get response')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
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
                        onClick={() => {
                            localStorage.removeItem('access_token')
                            localStorage.removeItem('user_id')
                            router.push('/login')
                        }}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </nav>

            <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-6 flex flex-col gap-4 overflow-y-auto">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                            msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-900 border border-gray-800 text-gray-100'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-900 border border-gray-800 px-4 py-3 rounded-2xl text-sm text-gray-400">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-800 px-6 py-4">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your transactions..."
                        className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}