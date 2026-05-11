import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('topify_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.status) {
      localStorage.setItem('topify_token', data.data.token)
      localStorage.setItem('topify_user', JSON.stringify(data.data.user))
      setUser(data.data.user)
    }
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    if (data.status) {
      localStorage.setItem('topify_token', data.data.token)
      localStorage.setItem('topify_user', JSON.stringify(data.data.user))
      setUser(data.data.user)
    }
    return data
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('topify_token')
    localStorage.removeItem('topify_user')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      if (data.status) {
        localStorage.setItem('topify_user', JSON.stringify(data.data))
        setUser(data.data)
      }
    } catch {}
  }

  const isAdmin = user?.is_admin === true

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
