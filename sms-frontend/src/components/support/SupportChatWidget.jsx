import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, Ticket as TicketIcon, Plus, ChevronRight, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { sendAiChatMessage, createTicket, getUserTickets, getTicketDetails, replyTicket } from '../../api/tickets'
import { toast } from 'sonner'

export default function SupportChatWidget() {
  const { isAuthenticated, user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('ai') // 'ai' | 'tickets'

  // AI Chat state
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! 👋 I'm Ping SMS AI Support Assistant. How can I help you today? Ask me about number activation, pricing, deposits, or any issues you're facing!`,
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [sendingAi, setSendingAi] = useState(false)
  const messagesEndRef = useRef(null)

  // Tickets state
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  // New Ticket Form state
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newCategory, setNewCategory] = useState('general')
  const [newMessageText, setNewMessageText] = useState('')
  const [creatingTicket, setCreatingTicket] = useState(false)

  // Scroll to bottom of AI chat
  useEffect(() => {
    if (activeTab === 'ai') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiMessages, activeTab, isOpen])

  // Fetch tickets when tickets tab is opened
  useEffect(() => {
    if (isOpen && activeTab === 'tickets' && isAuthenticated) {
      fetchTickets()
    }
  }, [isOpen, activeTab, isAuthenticated])

  const fetchTickets = async () => {
    setLoadingTickets(true)
    try {
      const res = await getUserTickets({ page: 1, limit: 20 })
      setTickets(res.data?.data?.tickets || [])
    } catch {
      toast.error('Failed to load support tickets.')
    } finally {
      setLoadingTickets(false)
    }
  }

  const handleSendAiMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || sendingAi) return

    const userMsg = { role: 'user', content: inputMessage.trim() }
    const updatedMsgs = [...aiMessages, userMsg]
    setAiMessages(updatedMsgs)
    setInputMessage('')
    setSendingAi(true)

    try {
      const res = await sendAiChatMessage(updatedMsgs)
      const replyContent = res.data?.data?.message?.content || 'I have recorded your request.'
      setAiMessages((prev) => [...prev, { role: 'assistant', content: replyContent }])
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered an error responding. Please try again or submit a support ticket in the "My Tickets" tab.',
        },
      ])
    } finally {
      setSendingAi(false)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!newSubject.trim() || !newMessageText.trim() || creatingTicket) return

    setCreatingTicket(true)
    try {
      const res = await createTicket({
        subject: newSubject.trim(),
        category: newCategory,
        message: newMessageText.trim(),
      })
      toast.success(`Ticket ${res.data?.data?.ticketId} created successfully!`)
      setShowNewTicketForm(false)
      setNewSubject('')
      setNewMessageText('')
      fetchTickets()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket.')
    } finally {
      setCreatingTicket(false)
    }
  }

  const handleSendTicketReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedTicket || sendingReply) return

    setSendingReply(true)
    try {
      const res = await replyTicket(selectedTicket.ticketId, { text: replyText.trim() })
      setSelectedTicket(res.data?.data)
      setReplyText('')
      toast.success('Reply sent!')
      fetchTickets()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply.')
    } finally {
      setSendingReply(false)
    }
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center font-bold"
          aria-label="Support AI & Tickets"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
          </span>
        </button>
      </div>

      {/* Support Chat / Ticket Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 sm:bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[80vh] h-[600px] bg-[#111116] border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#181820] border-b border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base leading-tight">Ping Support Assistant</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> DeepSeek AI Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-800 bg-[#14141a]">
              <button
                onClick={() => {
                  setActiveTab('ai')
                  setSelectedTicket(null)
                }}
                className={`flex-1 py-3 text-xs font-bold font-display flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'ai'
                    ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" /> AI Support Chat
              </button>
              <button
                onClick={() => {
                  setActiveTab('tickets')
                  setSelectedTicket(null)
                }}
                className={`flex-1 py-3 text-xs font-bold font-display flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'tickets'
                    ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <TicketIcon className="w-4 h-4" /> My Tickets
              </button>
            </div>

            {/* Tab 1: AI Support Chat */}
            {activeTab === 'ai' && (
              <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c10]">
                {/* Chat Message Scroll Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                  {aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role !== 'user' && (
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                          AI
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-amber-500 text-black font-medium rounded-br-none'
                            : 'bg-[#1a1a24] text-gray-200 border border-gray-800 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {sendingAi && (
                    <div className="flex gap-3 justify-start items-center text-xs text-gray-400 italic">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 animate-spin" />
                      </div>
                      AI is typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendAiMessage} className="p-3 bg-[#14141a] border-t border-gray-800 flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask AI support anything..."
                    className="flex-1 bg-[#1a1a24] border border-gray-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400/50"
                  />
                  <button
                    type="submit"
                    disabled={sendingAi || !inputMessage.trim()}
                    className="p-2.5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-bold transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: My Tickets */}
            {activeTab === 'tickets' && (
              <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c10]">
                {!isAuthenticated ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <TicketIcon className="w-10 h-10 text-gray-600" />
                    <p className="text-xs text-gray-400">Please log in to view and create support tickets.</p>
                  </div>
                ) : selectedTicket ? (
                  /* Single Ticket Detail View */
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="p-3 bg-[#14141a] border-b border-gray-800 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="text-xs text-amber-400 font-bold flex items-center gap-1 hover:underline"
                      >
                        ← Back to Tickets
                      </button>
                      <span className="text-xs font-mono text-gray-400">{selectedTicket.ticketId}</span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                      <div className="border-b border-gray-800 pb-3">
                        <h4 className="font-bold text-white text-sm">{selectedTicket.subject}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 font-mono">
                          <span>Category: {selectedTicket.category}</span>
                          <span>•</span>
                          <span className="capitalize text-amber-400 font-bold">Status: {selectedTicket.status}</span>
                        </div>
                      </div>

                      {selectedTicket.messages?.map((m, idx) => (
                        <div key={idx} className="bg-[#181822] border border-gray-800 rounded-xl p-3 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span className="font-bold text-white">{m.senderName || m.sender}</span>
                            <span className="font-mono text-[10px]">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Ticket Reply Form */}
                    <form onSubmit={handleSendTicketReply} className="p-3 bg-[#14141a] border-t border-gray-800 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Reply to ticket..."
                        className="flex-1 bg-[#1a1a24] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50"
                      />
                      <button
                        type="submit"
                        disabled={sendingReply || !replyText.trim()}
                        className="p-2 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 text-xs"
                      >
                        Reply
                      </button>
                    </form>
                  </div>
                ) : showNewTicketForm ? (
                  /* Create Ticket Form View */
                  <form onSubmit={handleCreateTicket} className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <h4 className="font-bold text-white text-sm">Open Support Ticket</h4>
                      <button
                        type="button"
                        onClick={() => setShowNewTicketForm(false)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-medium">Subject</label>
                      <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Brief title of your issue"
                        className="w-full bg-[#1a1a24] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-medium">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-[#1a1a24] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="sms_issue">SMS Code Issue</option>
                        <option value="billing">Billing & Refunds</option>
                        <option value="technical">Technical Support</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-medium">Description</label>
                      <textarea
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder="Explain your problem in detail..."
                        rows={4}
                        className="w-full bg-[#1a1a24] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingTicket}
                      className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all"
                    >
                      {creatingTicket ? 'Submitting...' : 'Submit Support Ticket'}
                    </button>
                  </form>
                ) : (
                  /* Ticket List View */
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="p-3 bg-[#14141a] border-b border-gray-800 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-bold">Your Tickets</span>
                      <button
                        onClick={() => setShowNewTicketForm(true)}
                        className="btn btn-primary py-1 px-3 text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> New Ticket
                      </button>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
                      {loadingTickets ? (
                        <div className="text-center text-xs text-gray-500 py-8">Loading tickets...</div>
                      ) : tickets.length > 0 ? (
                        tickets.map((t) => (
                          <div
                            key={t.ticketId}
                            onClick={() => setSelectedTicket(t)}
                            className="bg-[#181822] hover:bg-[#20202c] border border-gray-800/80 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                          >
                            <div className="space-y-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] text-amber-400 font-bold">{t.ticketId}</span>
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                                  {t.status}
                                </span>
                              </div>
                              <p className="text-xs text-white font-semibold truncate">{t.subject}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-gray-500 py-8 space-y-2">
                          <p>No support tickets opened yet.</p>
                          <button
                            onClick={() => setShowNewTicketForm(true)}
                            className="text-amber-400 underline font-bold"
                          >
                            Create one now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
