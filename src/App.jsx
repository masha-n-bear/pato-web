import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import posthog from 'posthog-js'
import Header from './components/Header'
import Footer from './components/Footer'
import ExperimentNotice from './components/ExperimentNotice'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import CollectionsPage from './pages/CollectionsPage'
import SearchPage from './pages/SearchPage'
import ProductPage from './pages/ProductPage'
import StaticPage from './pages/StaticPage'
import BlogListPage from './pages/BlogListPage'
import BlogPostPage from './pages/BlogPostPage'
import LoginPage from './pages/LoginPage'
import SavedPage from './pages/SavedPage'
import AccountPage from './pages/AccountPage'
import useStore from './store'
import { initAuth } from './authStore'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname, search])
  return null
}

function PageviewTracker() {
  const location = useLocation()
  useEffect(() => {
    posthog.capture('$pageview', { $current_url: window.location.href })
  }, [location.pathname, location.search])
  return null
}

export default function App() {
  const load = useStore(s => s.load)
  useEffect(() => { load() }, [load])
  useEffect(() => { return initAuth() }, [])

  return (
    <>
      <ExperimentNotice />
      <ScrollToTop />
      <PageviewTracker />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:handle" element={<CollectionsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/products/:handle" element={<ProductPage />} />
          <Route path="/pages/:handle" element={<StaticPage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/:slug" element={<BlogPostPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
