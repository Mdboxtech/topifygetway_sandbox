import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast, { Toaster } from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('user@topify.test')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(email, password)
      if (res.status) {
        toast.success('Logged in!')
        navigate('/')
      } else {
        toast.error(res.message || 'Login failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Topify Gateway</h1>
          <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full">
            Sandbox
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            No account? <Link to="/register" className="text-indigo-400 hover:underline">Register</Link>
          </p>
        </div>

        <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Test Credentials</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button onClick={() => { setEmail('user@topify.test'); setPassword('password') }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors text-left">
              <span className="text-slate-500">User:</span> user@topify.test
            </button>
            <button onClick={() => { setEmail('admin@topify.test'); setPassword('password') }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors text-left">
              <span className="text-slate-500">Admin:</span> admin@topify.test
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
