import { useEffect, useState } from 'react'
import api from '../lib/api'
import { formatKobo } from '../lib/utils'

export default function Fees() {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('transfer')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePreview = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.get('/fees/preview', { params: { amount: parseInt(amount) * 100, type } })
      setResult(data.data)
    } catch {} finally { setLoading(false) }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Fee Preview</h1>
        <p className="text-sm text-slate-500 mt-1">Calculate fees before transacting</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg">
        <form onSubmit={handlePreview} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Amount (Naira)</label>
            <input type="number" min="1" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Transaction Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
              <option value="transfer">Transfer</option>
              <option value="card_payment">Card Payment</option>
              <option value="virtual_account">Virtual Account</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Calculating...' : 'Calculate Fee'}
          </button>
        </form>

        {result && (
          <div className="mt-6 border-t border-slate-800 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Amount</span>
              <span className="text-white font-mono">{formatKobo(result.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Fee</span>
              <span className="text-amber-400 font-mono">{formatKobo(result.fee)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-800 pt-3">
              <span className="text-slate-400 font-medium">Total</span>
              <span className="text-white font-bold font-mono">{formatKobo(result.total || (result.amount + result.fee))}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
