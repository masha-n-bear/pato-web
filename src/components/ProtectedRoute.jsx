import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../authStore'

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const authLoading = useAuthStore((s) => s.authLoading)
  const location = useLocation()

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
