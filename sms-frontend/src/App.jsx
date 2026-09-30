import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ErrorBoundary from './components/ErrorBoundary'

// Layouts
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import ResetPasswordPage from './pages/public/ResetPasswordPage'
import NotFoundPage from './pages/public/NotFoundPage'
import PrivacyPolicy from './pages/public/PrivacyPolicy'
import TermsOfService from './pages/public/TermsOfService'
import PricingPage from './pages/public/PricingPage'
import VerifyEmailPage from './pages/public/VerifyEmailPage'
import Verify2FAPage from './pages/public/Verify2FAPage'

// User Dashboard Pages
import DashboardHome from './pages/user/DashboardHome'
import BuyNumberPage from './pages/user/BuyNumberPage'
import EsimPlansPage from './pages/user/EsimPlansPage'
import MyNumbersPage from './pages/user/MyNumbersPage'
import WalletPage from './pages/user/WalletPage'
import TransactionsPage from './pages/user/TransactionsPage'
import ReferralsPage from './pages/user/ReferralsPage'
import SettingsPage from './pages/user/SettingsPage'
import ProfilePage from './pages/user/ProfilePage'
import ApiKeysPage from './pages/user/ApiKeysPage'
import OrderHistoryPage from './pages/user/OrderHistoryPage'
import RefundRequestsPage from './pages/user/RefundRequestsPage'

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminNumbers from './pages/admin/AdminNumbers'
import AdminWallet from './pages/admin/AdminWallet'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminPricing from './pages/admin/AdminPricing'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminSiteSettings from './pages/admin/AdminSiteSettings'
import AdminEarnings from './pages/admin/AdminEarnings'
import AdminDeposits from './pages/admin/AdminDeposits'
import AdminRefunds from './pages/admin/AdminRefunds'
import AdminDamageControlBot from './pages/admin/AdminDamageControlBot'
import AdminProviderRouting from './pages/admin/AdminProviderRouting'

// Route Guards
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function RequireAdmin({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function RedirectIfAuth({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }
  return children
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/verify-2fa" element={<Verify2FAPage />} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<RequireAuth><UserLayout><DashboardHome /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/buy" element={<RequireAuth><UserLayout><BuyNumberPage /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/esim" element={<RequireAuth><UserLayout><EsimPlansPage /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/numbers" element={<RequireAuth><UserLayout><MyNumbersPage /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/orders" element={<RequireAuth><UserLayout><OrderHistoryPage /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/api-keys" element={<RequireAuth><UserLayout><ApiKeysPage /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/wallet" element={<RequireAuth><UserLayout><WalletPage /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/transactions" element={<RequireAuth><UserLayout><TransactionsPage /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/referrals" element={<RequireAuth><UserLayout><ReferralsPage /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/settings" element={<RequireAuth><UserLayout><SettingsPage /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/profile" element={<RequireAuth><UserLayout><ProfilePage /></UserLayout></RequireAuth>} />
        <Route path="/dashboard/refunds" element={<RequireAuth><UserLayout><RefundRequestsPage /></UserLayout></RequireAuth>} />

        {/* Admin Panel */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout><AdminOverview /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminLayout><AdminUsers /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/orders" element={<RequireAdmin><AdminLayout><AdminOrders /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/numbers" element={<RequireAdmin><AdminLayout><AdminNumbers /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/wallet" element={<RequireAdmin><AdminLayout><AdminWallet /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/transactions" element={<RequireAdmin><AdminLayout><AdminTransactions /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/pricing" element={<RequireAdmin><AdminLayout><AdminPricing /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/routing" element={<RequireAdmin><AdminLayout><AdminProviderRouting /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/announcements" element={<RequireAdmin><AdminLayout><AdminAnnouncements /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/settings" element={<RequireAdmin><AdminLayout><AdminSiteSettings /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/earnings" element={<RequireAdmin><AdminLayout><AdminEarnings /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/deposits" element={<RequireAdmin><AdminLayout><AdminDeposits /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/refunds" element={<RequireAdmin><AdminLayout><AdminRefunds /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/damage-control" element={<RequireAdmin><AdminLayout><AdminDamageControlBot /></AdminLayout></RequireAdmin>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  )
}
