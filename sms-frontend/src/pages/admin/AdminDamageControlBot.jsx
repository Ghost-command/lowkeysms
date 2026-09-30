import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, User, ShieldAlert, Wrench, RefreshCw, Sparkles, CheckCircle2, UserX, Search } from 'lucide-react'
import { toast } from 'sonner'
import client from '../../api/client'

export default function AdminDamageControlBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello Admin! I am your DeepSeek Damage Control Bot. I can inspect user accounts, verify wallet balances, check active orders, and immediately revoke active user sessions or ban abusive accounts. How can I assist you today?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickEmail, setQuickEmail] = useState('')

  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (overridePrompt) => {
    const textToSend = overridePrompt || input
    if (!textToSend.trim() || loading) return

    const newMessages = [...messages, { role: 'user', content: textToSend }]
    setMessages(newMessages)
    if (!overridePrompt) setInput('')
    setLoading(true)

    try {
      // Format payload for API
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await client.post('/admin/ai/chat', { messages: apiMessages })

      if (res.data?.success) {
        const assistantMsg = res.data.data.message
        const toolResults = res.data.data.toolResults || []

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: assistantMsg.content || 'Action executed successfully.',
            toolResults,
          },
        ])
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'DeepSeek AI service error.'
      toast.error(msg)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error communicating with DeepSeek AI: ${msg}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handlePromptShortcut = (type) => {
    const target = quickEmail.trim() || 'user@example.com'
    if (type === 'check') {
      handleSend(`Check account status, wallet balance, and recent orders for ${target}`)
    } else if (type === 'revoke') {
      handleSend(`Revoke all active sessions and ban account for ${target} due to suspicious activity`)
    }
  }

  return (
    <div className="space-y-space-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight flex items-center gap-2">
            <Bot className="w-8 h-8 text-amber-400" /> DeepSeek Damage Control Bot
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Autonomous AI assistant equipped with backend tools to inspect accounts, audit wallets, and revoke sessions.
          </p>
        </div>

        {/* Target Email Quick Input */}
        <div className="flex items-center gap-2 bg-surface-container-low border border-white/10 p-1.5 rounded-xl">
          <Search className="w-4 h-4 text-outline ml-2" />
          <input
            type="email"
            placeholder="Target email..."
            value={quickEmail}
            onChange={(e) => setQuickEmail(e.target.value)}
            className="bg-transparent border-none text-xs text-on-surface focus:outline-none w-44 font-mono"
          />
          <button
            onClick={() => handlePromptShortcut('check')}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg transition"
          >
            Check Status
          </button>
          <button
            onClick={() => handlePromptShortcut('revoke')}
            className="px-3 py-1.5 text-xs font-semibold bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition"
          >
            Revoke Session
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p- space-y-4 p-4 sm:p-6 custom-scrollbar">
          {messages.map((m, idx) => {
            const isAssistant = m.role === 'assistant'
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isAssistant
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-primary/10 border-primary/30 text-primary'
                  }`}
                >
                  {isAssistant ? <Bot size={20} /> : <User size={20} />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  <div
                    className={`p-4 rounded-2xl text-[14px] leading-relaxed ${
                      isAssistant
                        ? 'bg-surface-container-low border border-white/10 text-on-surface rounded-tl-none'
                        : 'bg-primary text-on-primary rounded-tr-none font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>

                  {/* Executed Tools Breakdown Card */}
                  {m.toolResults && m.toolResults.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {m.toolResults.map((t, tIdx) => (
                        <div
                          key={tIdx}
                          className="bg-black/60 border border-amber-500/30 rounded-xl p-3 text-xs font-mono space-y-1.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between text-amber-400 font-bold border-b border-amber-500/20 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <Wrench size={14} /> Tool Executed: {t.toolName}
                            </span>
                            <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                              Backend Success
                            </span>
                          </div>

                          <div className="text-gray-300 text-[11px] pt-1 space-y-1">
                            <div>
                              <span className="text-gray-500">Params:</span> {JSON.stringify(t.args)}
                            </div>
                            <div className="text-amber-200/90 whitespace-pre-wrap">
                              <span className="text-gray-500">Result:</span> {JSON.stringify(t.result, null, 2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}

          {loading && (
            <div className="flex items-center gap-3 text-amber-400 text-xs font-mono bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl w-fit">
              <RefreshCw className="w-4 h-4 animate-spin" /> DeepSeek model reasoning & calling backend tools...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-surface-container-low border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask DeepSeek to inspect user status, check wallet, or revoke sessions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-surface-container-lowest border border-white/10 rounded-xl px-4 h-12 text-sm text-on-surface focus:outline-none focus:border-amber-400/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-12 px-6 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              <Send size={18} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
