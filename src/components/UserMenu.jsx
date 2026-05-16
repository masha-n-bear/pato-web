import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import useAuthStore from '../authStore'
import './UserMenu.css'

export default function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    setOpen(false)
    await signOut(auth)
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Tài khoản'
  const photoURL = user?.photoURL

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-avatar-btn" onClick={() => setOpen((v) => !v)} aria-label="Tài khoản">
        {photoURL ? (
          <img src={photoURL} alt={displayName} className="user-avatar-img" referrerPolicy="no-referrer" />
        ) : (
          <span className="user-avatar-initials">{displayName[0].toUpperCase()}</span>
        )}
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-name">{displayName}</div>
          <Link to="/account" className="user-dropdown-item" onClick={() => setOpen(false)}>
            <svg width="14" viewBox="0 0 448 512" fill="currentColor">
              <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/>
            </svg>
            Tài khoản của tôi
          </Link>
          <Link to="/saved" className="user-dropdown-item" onClick={() => setOpen(false)}>
            <svg width="14" viewBox="0 0 384 512" fill="currentColor">
              <path d="M0 48C0 21.5 21.5 0 48 0l0 48 0 393.4 130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4 336 48 48 48 48 0 336 0c26.5 0 48 21.5 48 48l0 440c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.1-16.9 5.9-24.9 1.8S0 497 0 488L0 48z" />
            </svg>
            Đã lưu của tôi
          </Link>
          <button className="user-dropdown-item user-logout" onClick={handleLogout}>
            <svg width="14" viewBox="0 0 512 512" fill="currentColor">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
            </svg>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
