import { useEffect, useState } from 'react'
import api from '../lib/api'
import { formatKobo, formatDate } from '../lib/utils'
import toast, { Toaster } from 'react-hot-toast'

export default function Wallet() {
  const [wallet, setWallet] = useState(null)
  const [ledger, setLedger] = useState([])
  const [tab, setTab] = useState('summary')
  const [loading, setLoading] = useState(true)
  // Transfer
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferForm, setTransferForm] = useState({ email: '', amount: '', narration: '' })
  const [transferring, setTransferring] = useState(false)

  useEffect(() => {
    loadWallet()
  }, [])

  const loadWallet = async () => {
    setLoading(true)
    try {
      const [w, l] = await Promise.all([api.get('/wallet'), api.get('/wallet/ledger')])
      setWallet(w.data.data)
      setLedger(l.data.data?.data || l.data.data || [])
    } catch {} finally { setLoading(false) }
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    setTransferring(true)
    try {
      const payload = { ...transferForm, amount: parseInt(transferForm.amount) * 100 }
      const { data } = await api.post('/wallet/transfer', payload)
      if (data.status) {
        toast.success(data.message)
        setShowTransfer(false)
        setTransferForm({ email: '', amount: '', narration: '' })
        loadWallet()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed')
    } finally { setTransferring(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your funds</p>
        </div>
        <button onClick={() => setShowTransfer(!showTransfer)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          Transfer Funds
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-600/30 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-white">{formatKobo(wallet?.balance)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-1">Ledger Balance</p>
          <p className="text-3xl font-bold text-white">{formatKobo(wallet?.ledger_balance || wallet?.balance)}</p>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Transfer Funds</h3>
          <form onSubmit={handleTransfer} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Recipient Email</label>
              <input type="email" value={transferForm.email}
                onChange={(e) => setTransferForm({ ...transferForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Amount (Naira)</label>
              <input type="number" value={transferForm.amount} min="1"
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Narration</label>
              <input type="text" value={transferForm.narration}
                onChange={(e) => setTransferForm({ ...transferForm, narration: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={transferring}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {transferring ? 'Sending...' : 'Send'}
              </button>
              <button type="button" onClick={() => setShowTransfer(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Wallet Ledger</h3>
        </div>
        {ledger.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-600 text-sm">No entries yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-600 uppercase">
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Balance After</th>
                <th className="px-5 py-3">Narration</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ledger.map((entry, i) => (
                <tr key={entry.id || i} className="hover:bg-slate-800/50">
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      entry.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>{entry.type}</span>
                  </td>
                  <td className="px-5 py-3 font-mono">{formatKobo(entry.amount)}</td>
                  <td className="px-5 py-3 font-mono text-slate-400">{formatKobo(entry.balance_after)}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs max-w-[200px] truncate">{entry.narration}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(entry.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
