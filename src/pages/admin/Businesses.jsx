import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function Businesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [acting, setActing] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/businesses')
      if (data.status) setBusinesses(data.data)
    } catch {} finally { setLoading(false) }
  }

  const viewDetail = async (id) => {
    setDetailLoading(true)
    try {
      const { data } = await api.get(`/admin/businesses/${id}`)
      if (data.status) setSelected(data.data)
    } catch {} finally { setDetailLoading(false) }
  }

  const approve = async () => {
    if (!selected) return
    setActing(true)
    try {
      const { data } = await api.post(`/admin/businesses/${selected.id}/approve`)
      if (data.status) { toast.success(data.message); setSelected(null); load() }
      else toast.error(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  const reject = async () => {
    if (!selected || !rejectReason.trim()) return toast.error('Please provide a rejection reason')
    setActing(true)
    try {
      const { data } = await api.post(`/admin/businesses/${selected.id}/reject`, { reason: rejectReason })
      if (data.status) { toast.success(data.message); setSelected(null); setRejectReason(''); load() }
      else toast.error(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Business Verification</h1>
      <p className="text-sm text-slate-500 mb-6">Review and manage pending business submissions</p>

      {/* Detail Modal */}
      {selected && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{selected.business_name}</h3>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-sm">✕ Close</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              ['Business ID', selected.business_id],
              ['RC Number', selected.rc_number],
              ['Type', selected.business_type],
              ['Address', selected.address],
              ['City', selected.city],
              ['State', selected.state],
              ['Country', selected.country],
              ['Website', selected.website || '—'],
              ['Merchant', `${selected.user?.name} (${selected.user?.email})`],
              ['Submitted', formatDate(selected.submitted_at)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-sm text-white">{value}</p>
              </div>
            ))}
          </div>

          {selected.social_links && Object.keys(selected.social_links).length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-slate-500 mb-2">Social Links</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selected.social_links).map(([k, v]) => v && (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-600/10 px-2 py-1 rounded">
                    {k}
                  </a>
                ))}
              </div>
            </div>
          )}

          {selected.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={approve} disabled={acting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {acting ? 'Processing...' : 'Approve'}
              </button>
              <div className="flex-1 flex gap-2">
                <input type="text" value={rejectReason} placeholder="Rejection reason..."
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500" />
                <button onClick={reject} disabled={acting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {businesses.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-600 text-sm">No pending submissions</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Business</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">RC Number</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Merchant</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Submitted</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-5 py-3 text-white font-medium">{b.business_name}</td>
                  <td className="px-5 py-3 text-slate-400">{b.rc_number}</td>
                  <td className="px-5 py-3 text-slate-400">{b.user_name}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(b.submitted_at)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => viewDetail(b.id)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium">
                      Review
                    </button>
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
