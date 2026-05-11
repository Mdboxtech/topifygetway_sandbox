import { useEffect, useState } from 'react'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import toast, { Toaster } from 'react-hot-toast'

export default function KYC() {
  const [kyc, setKyc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ bvn: '', id_type: 'nin', id_number: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/kyc/status').then(({ data }) => {
      setKyc(data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/kyc/submit', form)
      if (data.status) {
        toast.success(data.message)
        setKyc(data.data)
        setShowForm(false)
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  const statusColor = {
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-600/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-600/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-600/20',
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">KYC Verification</h1>
          <p className="text-sm text-slate-500 mt-1">Verify your identity to increase transaction limits</p>
        </div>
        {(!kyc?.status || kyc?.status === 'rejected') && (
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            Submit KYC
          </button>
        )}
      </div>

      {/* Current status */}
      {kyc && (
        <div className={`rounded-xl border p-6 mb-6 ${statusColor[kyc.status] || statusColor.pending}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">KYC Status</p>
              <p className="text-2xl font-bold text-white capitalize">{kyc.status || 'Not submitted'}</p>
            </div>
            {kyc.submitted_at && (
              <p className="text-xs text-slate-500">Submitted: {formatDate(kyc.submitted_at || kyc.created_at)}</p>
            )}
          </div>
          {kyc.rejection_reason && (
            <p className="mt-3 text-sm text-red-400">Reason: {kyc.rejection_reason}</p>
          )}
        </div>
      )}

      {/* Submit form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Submit KYC Documents</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-slate-400 mb-1">BVN</label>
              <input type="text" maxLength="11" value={form.bvn}
                onChange={(e) => setForm({ ...form, bvn: e.target.value })}
                placeholder="12345678901"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">ID Type</label>
              <select value={form.id_type} onChange={(e) => setForm({ ...form, id_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="nin">NIN</option>
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="voters_card">Voter's Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">ID Number</label>
              <input type="text" value={form.id_number}
                onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                required />
            </div>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
