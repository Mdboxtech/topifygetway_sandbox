import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Business() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    business_name: '', rc_number: '', business_type: '', address: '',
    city: '', state: '', country: 'Nigeria', website: '',
    'social_links[facebook]': '', 'social_links[x]': '',
    'social_links[instagram]': '', 'social_links[linkedin]': '',
  })
  const [logo, setLogo] = useState(null)

  useEffect(() => { loadStatus() }, [])

  const loadStatus = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/business/status')
      if (data.status) setStatus(data.data)
    } catch {} finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      if (logo) fd.append('logo', logo)
      const { data } = await api.post('/business/submit', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data.status) {
        toast.success(data.message)
        loadStatus()
      } else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  const biz = status?.business
  const st = status?.status

  // Show status if pending or approved
  if (st === 'pending' || st === 'approved') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Business Verification</h1>
        <p className="text-sm text-slate-500 mb-6">Your business verification status</p>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              st === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {st === 'approved' ? '✓ Approved' : '⏳ Pending Review'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Business ID', biz?.business_id],
              ['Business Name', biz?.business_name],
              ['RC Number', biz?.rc_number],
              ['Type', biz?.business_type],
              ['Address', biz?.address],
              ['City', biz?.city],
              ['State', biz?.state],
              ['Country', biz?.country],
              ['Website', biz?.website || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-sm text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show rejection message + resubmit form
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Business Verification</h1>
      <p className="text-sm text-slate-500 mb-6">Submit your business details for verification</p>

      {st === 'rejected' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-red-400 mb-1">Previous submission was rejected</p>
          <p className="text-sm text-red-300">{biz?.rejection_reason}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            ['business_name', 'Business Name', 'text', true],
            ['rc_number', 'RC/CAC Number', 'text', true],
            ['business_type', 'Business Type', 'text', true],
            ['address', 'Business Address', 'text', true],
            ['city', 'City', 'text', true],
            ['state', 'State', 'text', true],
            ['country', 'Country', 'text', true],
            ['website', 'Website', 'url', false],
          ].map(([name, label, type, required]) => (
            <div key={name}>
              <label className="block text-sm text-slate-400 mb-1">{label} {required && <span className="text-red-400">*</span>}</label>
              <input type={type} value={form[name]} required={required}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-1">Business Logo</label>
          <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm" />
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-300 mb-3">Social Links (optional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['social_links[facebook]', 'Facebook'],
              ['social_links[x]', 'X (Twitter)'],
              ['social_links[instagram]', 'Instagram'],
              ['social_links[linkedin]', 'LinkedIn'],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block text-sm text-slate-400 mb-1">{label}</label>
                <input type="url" value={form[name]} placeholder={`https://${label.toLowerCase()}.com/...`}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {submitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  )
}
