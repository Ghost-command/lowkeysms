import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Ban, Lock, Unlock, Plus, Minus, X } from 'lucide-react'
import { toast } from 'sonner'
import { getUsers, banUser, unlockUser, creditUser, debitUser } from '../../api/admin'
import { SkeletonTableRow } from '../../components/common/Skeleton'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export default function AdminUsers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-list', { page, search }],
    queryFn: () => getUsers({ page, limit: 15, search: search || undefined }).then((r) => r.data?.data),
  })

  const users = data?.users ?? []
  const totalPages = data?.pages ?? 1

  const handleBanToggle = async (userDoc) => {
    try {
      if (userDoc.isBanned) {
        await unlockUser(userDoc._id)
        toast.success(`Unbanned user ${userDoc.username}`)
      } else {
        await banUser(userDoc._id)
        toast.success(`Banned user ${userDoc.username}`)
      }
      qc.invalidateQueries({ queryKey: ['admin-users-list'] })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status.')
    }
  }

  const handleAdjustWallet = async (type) => {
    if (!selectedUser || !creditAmount) return
    const amt = Number(creditAmount)
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount')
      return
    }

    setActionLoading(true)
    try {
      if (type === 'credit') {
        await creditUser(selectedUser._id, { amount: amt })
        toast.success(`Credited ₦${amt.toLocaleString()} to ${selectedUser.username}`)
      } else {
        await debitUser(selectedUser._id, { amount: amt })
        toast.success(`Debited ₦${amt.toLocaleString()} from ${selectedUser.username}`)
      }
      qc.invalidateQueries({ queryKey: ['admin-users-list'] })
      setSelectedUser(null)
      setCreditAmount('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wallet adjustment failed.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-space-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight">
            Users Management
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Search registered accounts, adjust wallet balances, lock or ban users.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search email or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-surface-container-low border-white/10 text-on-surface"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm">
        {isLoading ? (
          <div className="w-full overflow-x-auto rounded-[12px] border border-white/5 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <tbody>
                <SkeletonTableRow columns={6} />
                <SkeletonTableRow columns={6} />
              </tbody>
            </table>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-[14px] text-on-surface-variant">No users found matching query.</div>
        ) : (
          <div className="w-full overflow-x-auto rounded-[12px] border border-white/5 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-white/5 text-[12px] font-code-md text-outline uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Username</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Balance</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-[13px] text-on-surface">
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                    <td className="px-4 py-3 font-semibold text-on-surface">{u.username}</td>
                    <td className="px-4 py-3 font-code-md text-on-surface-variant text-[12px]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-md border uppercase ${
                        u.role === 'admin' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-surface-container-high border-white/10 text-outline'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-code-md font-bold text-secondary">
                      ₦{(u.balance || u.walletBalance || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-md border uppercase ${
                        u.isBanned ? 'bg-error/10 border-error/20 text-error' : 
                        u.isLocked ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 
                        'bg-primary/10 border-primary/20 text-primary'
                      }`}>
                        {u.isBanned ? 'Banned' : u.isLocked ? 'Locked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedUser(u)}
                          className="h-7 px-3 text-[11px] font-code-md font-bold text-secondary border border-secondary/30 hover:bg-secondary/10 hover:text-secondary"
                          title="Adjust balance"
                        >
                          ± Wallet
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleBanToggle(u)}
                          className={`h-7 px-3 text-[11px] font-code-md font-bold border ${
                            u.isBanned ? 'text-primary border-primary/30 hover:bg-primary/10 hover:text-primary' : 'text-error border-error/30 hover:bg-error/10 hover:text-error'
                          }`}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit / Debit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container border border-white/10 shadow-2xl max-w-sm w-full rounded-[24px] p-space-xl relative overflow-hidden">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-surface-container-high border border-white/5 flex items-center justify-center text-outline hover:text-on-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-1">
              Adjust Wallet: <span className="text-primary">{selectedUser.username}</span>
            </h3>
            <p className="text-[13px] text-on-surface-variant mb-6 font-code-md">
              Current balance: <span className="text-on-surface">₦{(selectedUser.balance || selectedUser.walletBalance || 0).toLocaleString()}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-on-surface mb-2">Amount (NGN)</label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="5000"
                  className="h-11 font-code-md bg-surface-container-lowest border-white/10 text-on-surface focus-visible:ring-primary-container"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => handleAdjustWallet('credit')}
                  disabled={actionLoading}
                  className="bg-primary-container hover:bg-primary text-on-primary-container h-10 font-code-md text-[12px] font-bold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Credit User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAdjustWallet('debit')}
                  disabled={actionLoading}
                  className="h-10 font-code-md text-[12px] font-bold text-error border-error/30 hover:bg-error/10 hover:text-error"
                >
                  <Minus className="w-3.5 h-3.5 mr-1" /> Debit User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
