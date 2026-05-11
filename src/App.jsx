import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'
import Payments from './pages/Payments'
import Transactions from './pages/Transactions'
import VirtualAccounts from './pages/VirtualAccounts'
import KYC from './pages/KYC'
import Fees from './pages/Fees'
import Notifications from './pages/Notifications'
import Business from './pages/Business'
import Developer from './pages/Developer'

// Admin
import AdminUsers from './pages/admin/Users'
import AdminTransactions from './pages/admin/Transactions'
import AdminKYC from './pages/admin/KYCReview'
import AdminSettings from './pages/admin/Settings'
import AdminLimits from './pages/admin/Limits'
import AdminAuditLogs from './pages/admin/AuditLogs'
import AdminWalletFund from './pages/admin/WalletFund'
import AdminReports from './pages/admin/Reports'
import AdminBusinesses from './pages/admin/Businesses'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
      }} />
      <Routes>
        {/* Guest */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Authenticated */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="payments" element={<Payments />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="virtual-accounts" element={<VirtualAccounts />} />
          <Route path="kyc" element={<KYC />} />
          <Route path="fees" element={<Fees />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="business" element={<Business />} />
          <Route path="developer" element={<Developer />} />

          {/* Admin */}
          <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
          <Route path="admin/kyc" element={<AdminRoute><AdminKYC /></AdminRoute>} />
          <Route path="admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="admin/limits" element={<AdminRoute><AdminLimits /></AdminRoute>} />
          <Route path="admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
          <Route path="admin/wallet-fund" element={<AdminRoute><AdminWalletFund /></AdminRoute>} />
          <Route path="admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="admin/businesses" element={<AdminRoute><AdminBusinesses /></AdminRoute>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
