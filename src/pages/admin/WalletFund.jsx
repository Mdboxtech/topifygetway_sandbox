import { useState } from 'react'
import api from '../../lib/api'
import { formatKobo } from '../../lib/utils'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminWalletFund() {
  const [form, setForm] = useState({ user_id: '', amount: '', narration: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!confirm(`Credit user #${form.user_id} with ₦${form.amount}?`)) return
    setLoading(true)
    try {
      const { data } = await api.post('/admin/wallet/fund', {
        user_id: parseInt(form.user_id),
        amount: parseInt(form.amount) * 100,
        narration: form.narration,
      })
      if (data.status) {
        toast.success(data.message)
        setResult(data.data)
        setForm({ user_id: '', amount: '', narration: '' })
      } else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Fund Wallet</h1>
        <p className="text-sm text-slate-500 mt-1">Manually credit a user's wallet</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">User ID</label>
            <input type="number" value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Amount (Naira)</label>
            <input type="number" min="1" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Narration</label>
            <input type="text" value={form.narration}
              onChange={(e) => setForm({ ...form, narration: e.target.value })}
              placeholder="Manual credit from admin"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Processing...' : 'Credit Wallet'}
          </button>
        </form>

        {result && (
          <div className="mt-6 border-t border-slate-800 pt-4">
            <p className="text-sm text-emerald-400 mb-2">Success! Wallet credited.</p>
            <pre className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
