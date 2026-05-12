import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import useAuthStore from '../authStore'
import './LoginPage.css'

const ERROR_MESSAGES = {
  'auth/user-not-found': 'Email không tồn tại',
  'auth/wrong-password': 'Mật khẩu không đúng',
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
  'auth/email-already-in-use': 'Email đã được sử dụng',
  'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
  'auth/invalid-email': 'Email không hợp lệ',
  'auth/too-many-requests': 'Quá nhiều lần thử, vui lòng thử lại sau',
  'auth/popup-closed-by-user': '',
}

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const user = useAuthStore((s) => s.user)
  const authLoading = useAuthStore((s) => s.authLoading)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (!authLoading && user) navigate(from, { replace: true })
  }, [user, authLoading, navigate, from])

  function getErrorMessage(code) {
    return ERROR_MESSAGES[code] || 'Đã xảy ra lỗi, vui lòng thử lại'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = getErrorMessage(err.code)
      if (msg) setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-logo">
          <img
            src="//theme.hstatic.net/1000275435/1000883829/14/logo.png"
            alt="PATO"
          />
        </Link>

        <div className="login-tabs">
          <button
            className={tab === 'login' ? 'active' : ''}
            onClick={() => { setTab('login'); setError('') }}
          >
            Đăng nhập
          </button>
          <button
            className={tab === 'register' ? 'active' : ''}
            onClick={() => { setTab('register'); setError('') }}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : tab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <div className="login-divider"><span>hoặc</span></div>

        <button className="login-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" viewBox="0 0 488 512" fill="currentColor">
            <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
          </svg>
          Tiếp tục với Google
        </button>
      </div>
    </div>
  )
}
