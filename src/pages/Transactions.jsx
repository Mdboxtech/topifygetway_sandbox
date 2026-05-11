import { useEffect, useState } from 'react'
import api from '../lib/api'
import { formatKobo, formatDate } from '../lib/utils'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/wallet/transactions').then(({ data }) => {
      setTransactions(data.data?.data || data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <p className="text-sm text-slate-500 mt-1">Your complete transaction history</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {transactions.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-600 text-sm">No transactions yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-600 uppercase">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Fee</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((tx, i) => (
                <tr key={tx.reference || i} className="hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono text-xs text-indigo-400">{tx.reference}</td>
                  <td className="px-5 py-3 capitalize">{tx.type}</td>
                  <td className="px-5 py-3 font-mono">{formatKobo(tx.amount)}</td>
                  <td className="px-5 py-3 font-mono text-slate-500">{formatKobo(tx.fee)}</td>
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
