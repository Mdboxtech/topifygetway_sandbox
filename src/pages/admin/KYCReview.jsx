import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { formatDate } from '../../lib/utils'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminKYC() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)

  useEffect(() => { loadKYC() }, [])

  const loadKYC = () => {
    api.get('/admin/kyc').then(({ data }) => {
      setSubmissions(data.data?.data || data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  const handleApprove = async (userId) => {
    try {
      const { data } = await api.post(`/admin/kyc/${userId}/approve`)
      if (data.status) { toast.success(data.message); loadKYC() }
      else toast.error(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleReject = async (userId) => {
    if (!rejectReason) return toast.error('Enter a reason')
    try {
      const { data } = await api.post(`/admin/kyc/${userId}/reject`, { reason: rejectReason })
      if (data.status) { toast.success(data.message); setRejectingId(null); setRejectReason(''); loadKYC() }
      else toast.error(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">KYC Review</h1>
        <p className="text-sm text-slate-500 mt-1">Approve or reject KYC submissions</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-500">No pending KYC submissions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id || sub.user_id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-medium">{sub.user?.name || `User #${sub.user_id}`}</p>
                  <p className="text-xs text-slate-500">{sub.user?.email}</p>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-slate-500">BVN:</span> <span className="text-slate-300 font-mono">{sub.bvn}</span></div>
                    <div><span className="text-slate-500">ID Type:</span> <span className="text-slate-300">{sub.id_type}</span></div>
                    <div><span className="text-slate-500">ID No:</span> <span className="text-slate-300 font-mono">{sub.id_number}</span></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">Submitted: {formatDate(sub.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(sub.user_id || sub.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg">
                    Approve
                  </button>
                  <button onClick={() => setRejectingId(rejectingId === (sub.user_id || sub.id) ? null : (sub.user_id || sub.id))}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded-lg border border-red-600/30">
                    Reject
                  </button>
                </div>
              </div>
              {rejectingId === (sub.user_id || sub.id) && (
                <div className="mt-3 flex gap-2">
                  <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Rejection reason"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  <button onClick={() => handleReject(sub.user_id || sub.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg">Submit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
