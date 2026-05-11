import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { formatKobo, formatDate } from '../lib/utils'
import {
  HiOutlineWallet, HiOutlineBanknotes, HiOutlineArrowTrendingUp,
  HiOutlineIdentification, HiOutlineCreditCard, HiOutlineArrowsRightLeft,
} from 'react-icons/hi2'

function StatCard({ icon: Icon, label, value, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20',
    green: 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20',
    amber: 'bg-amber-600/10 text-amber-400 border-amber-600/20',
    purple: 'bg-purple-600/10 text-purple-400 border-purple-600/20',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-6 h-6" />
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [kyc, setKyc] = useState(null)
  const [recentTx, setRecentTx] = useState([])
  const [limits, setLimits] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [w, k, tx, l] = await Promise.allSettled([
          api.get('/wallet'),
          api.get('/kyc/status'),
          api.get('/wallet/transactions'),
          api.get('/limits'),
        ])
        if (w.status === 'fulfilled') setWallet(w.value.data.data)
        if (k.status === 'fulfilled') setKyc(k.value.data.data)
        if (tx.status === 'fulfilled') setRecentTx((tx.value.data.data?.data || tx.value.data.data || []).slice(0, 5))
        if (l.status === 'fulfilled') setLimits(l.value.data.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-slate-500 mt-1">Here's your account overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiOutlineWallet} label="Wallet Balance" value={formatKobo(wallet?.balance)} color="green" />
        <StatCard icon={HiOutlineBanknotes} label="Ledger Balance" value={formatKobo(wallet?.ledger_balance || wallet?.balance)} color="indigo" />
        <StatCard icon={HiOutlineIdentification} label="KYC Status" value={kyc?.status || 'Not submitted'} color="amber" />
        <StatCard icon={HiOutlineArrowTrendingUp} label="KYC Tier" value={kyc?.tier || user?.kyc_tier || 'Tier 0'} color="purple" />
      </div>

      {/* Limits */}
      {limits && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Transaction Limits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Daily Limit</p>
              <p className="text-white font-mono">{formatKobo(limits.daily_limit || limits.limits?.daily)}</p>
            </div>
            <div>
              <p className="text-slate-500">Per Transaction</p>
              <p className="text-white font-mono">{formatKobo(limits.per_transaction_limit || limits.limits?.per_transaction)}</p>
            </div>
            <div>
              <p className="text-slate-500">Daily Used</p>
              <p className="text-white font-mono">{formatKobo(limits.daily_used || limits.usage?.daily_used)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Transactions</h3>
        </div>
        {recentTx.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-600 text-sm">No transactions yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-600 uppercase">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentTx.map((tx, i) => (
                <tr key={tx.reference || i} className="hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono text-xs text-indigo-400">{tx.reference}</td>
                  <td className="px-5 py-3 capitalize">{tx.type}</td>
                  <td className="px-5 py-3 font-mono">{formatKobo(tx.amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{tx.status}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(tx.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
