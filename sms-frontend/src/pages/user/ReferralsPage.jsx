import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-toastify'
import { FaCopy, FaMoneyBillWave, FaUsers, FaChartLine } from 'react-line-icons'

export default function ReferralsPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/affiliate/me')
        setStats(res.data.data)
      } catch (err) {
        toast.error('Failed to load affiliate stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleWithdraw = async () => {
    try {
      const res = await axios.post('/api/affiliate/withdraw')
      toast.success(res.data.message)
      setStats(prev => ({ ...prev, affiliateBalance: 0, affiliateEarned: prev.affiliateEarned }))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to withdraw')
    }
  }

  const copyLink = () => {
    const link = `${window.location.origin}/register?ref=${stats?.referralCode}`
    navigator.clipboard.writeText(link)
    toast.success('Referral link copied!')
  }

  if (loading) return <div className="p-8 text-white">Loading...</div>

  return (
    <div className="p-6 max-w-6xl mx-auto text-white space-y-6">
      <h1 className="text-3xl font-bold mb-8">Affiliate Program</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div className="bg-gray-900 p-6 rounded-2xl border border-gray-800" whileHover={{ scale: 1.02 }}>
          <p className="text-gray-400">Total Referrals</p>
          <p className="text-2xl font-semibold mt-2">{stats?.referralCount || 0}</p>
        </motion.div>
        <motion.div className="bg-gray-900 p-6 rounded-2xl border border-gray-800" whileHover={{ scale: 1.02 }}>
          <p className="text-gray-400">Current Rate</p>
          <p className="text-2xl font-semibold mt-2">{stats?.effectiveRate || 0}%</p>
        </motion.div>
        <motion.div className="bg-gray-900 p-6 rounded-2xl border border-gray-800" whileHover={{ scale: 1.02 }}>
          <p className="text-gray-400">Total Earned</p>
          <p className="text-2xl font-semibold mt-2 text-yellow-400">₦{stats?.affiliateEarned || 0}</p>
        </motion.div>
        <motion.div className="bg-gray-900 p-6 rounded-2xl border border-gray-800" whileHover={{ scale: 1.02 }}>
          <p className="text-gray-400">Available Balance</p>
          <p className="text-2xl font-semibold mt-2 text-green-400">₦{stats?.affiliateBalance || 0}</p>
          {stats?.affiliateBalance >= 500 && (
            <button onClick={handleWithdraw} className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-500 w-full">
              Withdraw
            </button>
          )}
        </motion.div>
      </div>

      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <p className="text-gray-400 mb-1">Your Referral Link</p>
          <p className="text-lg font-mono text-yellow-400">{window.location.origin}/register?ref={stats?.referralCode}</p>
        </div>
        <button onClick={copyLink} className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition">
          Copy Link
        </button>
      </div>
    </div>
  )
}
