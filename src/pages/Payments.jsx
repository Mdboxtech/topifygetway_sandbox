import { useEffect, useState } from 'react'
import api from '../lib/api'
import { formatKobo, formatDate } from '../lib/utils'
import toast, { Toaster } from 'react-hot-toast'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInit, setShowInit] = useState(false)
  const [initForm, setInitForm] = useState({ amount: '', provider: 'paystack' })
  const [initiating, setInitiating] = useState(false)
  const [verifyRef, setVerifyRef] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = () => {
    api.get('/payments').then(({ data }) => {
      setPayments(data.data?.data || data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  const handleInitialize = async (e) => {
    e.preventDefault()
    setInitiating(true)
    try {
      const { data } = await api.post('/payments/initialize', {
        amount: parseInt(initForm.amount) * 100,
        provider: initForm.provider,
      })
      if (data.status) {
        toast.success('Payment initialized!')
        setVerifyRef(data.data.reference || '')
        setShowInit(false)
        loadPayments()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setInitiating(false) }
  }

  const handleVerify = async () => {
    if (!verifyRef) return toast.error('Enter a reference')
    try {
      const { data } = await api.get(`/payments/verify/${verifyRef}`)
      setVerifyResult(data)
      if (data.status) toast.success(data.message)
      else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Card Payments</h1>
          <p className="text-sm text-slate-500 mt-1">Initialize and verify card payments</p>
        </div>
        <button onClick={() => setShowInit(!showInit)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          Initialize Payment
        </button>
      </div>

      {/* Initialize form */}
      {showInit && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Initialize Payment</h3>
          <form onSubmit={handleInitialize} className="flex gap-4 items-end flex-wrap">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Amount (Naira)</label>
              <input type="number" min="1" value={initForm.amount}
                onChange={(e) => setInitForm({ ...initForm, amount: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 w-40"
                required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Provider</label>
              <select value={initForm.provider}
                onChange={(e) => setInitForm({ ...initForm, provider: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="paystack">Paystack</option>
                <option value="flutterwave">Flutterwave</option>
                <option value="monnify">Monnify</option>
              </select>
            </div>
            <button type="submit" disabled={initiating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {initiating ? 'Processing...' : 'Initialize'}
            </button>
          </form>
        </div>
      )}

      {/* Verify */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Verify Payment</h3>
        <div className="flex gap-3">
          <input type="text" value={verifyRef} onChange={(e) => setVerifyRef(e.target.value)}
            placeholder="Enter payment reference"
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          <button onClick={handleVerify}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
            Verify
          </button>
        </div>
        {verifyResult && (
          <pre className="mt-3 p-3 bg-slate-800 rounded-lg text-xs text-slate-300 overflow-auto max-h-48">
            {JSON.stringify(verifyResult, null, 2)}
          </pre>
        )}
      </div>

      {/* Payments list */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Payment History</h3>
        </div>
        {payments.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-600 text-sm">No payments yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-600 uppercase">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.map((p, i) => (
                <tr key={p.reference || i} className="hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-mono text-xs text-indigo-400">{p.reference}</td>
                  <td className="px-5 py-3 font-mono">{formatKobo(p.amount)}</td>
                  <td className="px-5 py-3 capitalize">{p.provider}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      p.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
