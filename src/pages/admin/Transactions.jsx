import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { formatKobo, formatDate } from '../../lib/utils'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', type: '' })

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = (params = {}) => {
    setLoading(true)
    const query = new URLSearchParams(Object.fromEntries(Object.entries({ ...filter, ...params }).filter(([_, v]) => v))).toString()
    api.get(`/admin/transactions${query ? '?' + query : ''}`).then(({ data }) => {
      setTransactions(data.data?.data || data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  const handleReverse = async (tx) => {
    if (!confirm(`Reverse transaction ${tx.reference}?`)) return
    try {
      const { data } = await api.post(`/admin/transactions/${tx.id}/reverse`)
      if (data.status) {
        toast.success(data.message)
        loadTransactions()
      } else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">All Transactions</h1>
        <p className="text-sm text-slate-500 mt-1">View and reverse transactions across all users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={filter.status} onChange={(e) => { setFilter({ ...filter, status: e.target.value }); loadTransactions({ status: e.target.value }) }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="reversed">Reversed</option>
        </select>
        <select value={filter.type} onChange={(e) => { setFilter({ ...filter, type: e.target.value }); loadTransactions({ type: e.target.value }) }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
          <option value="">All Types</option>
          <option value="transfer">Transfer</option>
          <option value="card_payment">Card Payment</option>
          <option value="virtual_account">Virtual Account</option>
          <option value="manual_credit">Manual Credit</option>
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-600 uppercase">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((tx, i) => (
                <tr key={tx.reference || i} className="hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono text-xs text-indigo-400">{tx.reference}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{tx.user?.email || tx.user_id}</td>
                  <td className="px-5 py-3 capitalize">{tx.type}</td>
                  <td className="px-5 py-3 font-mono">{formatKobo(tx.amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      tx.status === 'reversed' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{tx.status}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(tx.created_at)}</td>
                  <td className="px-5 py-3">
                    {tx.status === 'success' && (
                      <button onClick={() => handleReverse(tx)}
                        className="text-xs text-red-400 hover:text-red-300">Reverse</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
