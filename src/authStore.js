import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection, getDocs, setDoc, deleteDoc, doc,
  serverTimestamp, addDoc, query, orderBy, updateDoc, where,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import posthog from 'posthog-js'

const useAuthStore = create((set, get) => ({
  user: null,
  authLoading: true,
  savedHandles: new Set(),
  savedLoading: false,
  bookings: [],
  bookingsLoading: false,
  reviews: [],
  reviewsLoading: false,

  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setSavedHandles: (savedHandles) => set({ savedHandles }),

  toggleSaved: async (handle) => {
    const { user, savedHandles } = get()
    if (!user) return
    const wasSaved = savedHandles.has(handle)
    const next = new Set(savedHandles)
    if (wasSaved) next.delete(handle)
    else next.add(handle)
    set({ savedHandles: next })
    const ref = doc(db, 'users', user.uid, 'savedRestaurants', handle)
    try {
      if (wasSaved) await deleteDoc(ref)
      else await setDoc(ref, { handle, savedAt: serverTimestamp() })
    } catch {
      set({ savedHandles }) // revert
    }
  },

  // ── Bookings ──────────────────────────────────────────────────────────────
  loadBookings: async () => {
    const { user } = get()
    if (!user) return
    set({ bookingsLoading: true })
    try {
      const q = query(collection(db, 'users', user.uid, 'bookings'), orderBy('submittedAt', 'desc'))
      const snap = await getDocs(q)
      set({ bookings: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
    } catch {
      // preserve existing optimistic state on error
    } finally {
      set({ bookingsLoading: false })
    }
  },

  addBooking: async (bookingData) => {
    const { user } = get()
    if (!user) return null
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'bookings'), {
        ...bookingData,
        status: 'confirmed',
        submittedAt: serverTimestamp(),
      })
      // optimistic update
      set(s => ({
        bookings: [{ id: ref.id, ...bookingData, status: 'confirmed' }, ...s.bookings],
      }))
      return ref.id
    } catch {
      return null
    }
  },

  cancelBooking: async (bookingId) => {
    const { user } = get()
    if (!user) return
    try {
      await updateDoc(doc(db, 'users', user.uid, 'bookings', bookingId), { status: 'cancelled' })
      set(s => ({
        bookings: s.bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b),
      }))
    } catch { /* ignore */ }
  },

  // ── Reviews ───────────────────────────────────────────────────────────────
  loadReviews: async () => {
    const { user } = get()
    if (!user) return
    set({ reviewsLoading: true })
    try {
      const q = query(collection(db, 'users', user.uid, 'reviews'), orderBy('submittedAt', 'desc'))
      const snap = await getDocs(q)
      set({ reviews: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
    } catch {
      set({ reviews: [] })
    } finally {
      set({ reviewsLoading: false })
    }
  },

  addReview: async (reviewData) => {
    const { user } = get()
    if (!user) return false
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'reviews'), {
        ...reviewData,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Khách',
        userPhoto: user.photoURL || null,
        submittedAt: serverTimestamp(),
      })
      // Also write to global reviews collection for per-restaurant display
      await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Khách',
        userPhoto: user.photoURL || null,
        submittedAt: serverTimestamp(),
        userReviewId: ref.id,
      })
      set(s => ({
        reviews: [{ id: ref.id, ...reviewData, userId: user.uid }, ...s.reviews],
      }))
      return true
    } catch {
      return false
    }
  },

  deleteReview: async (reviewId) => {
    const { user } = get()
    if (!user) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'reviews', reviewId))
      // Also remove the corresponding public review
      const q = query(collection(db, 'reviews'), where('userReviewId', '==', reviewId))
      const snap = await getDocs(q)
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
      set(s => ({ reviews: s.reviews.filter(r => r.id !== reviewId) }))
    } catch { /* ignore */ }
  },
}))

export function initAuth() {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      useAuthStore.getState().setUser(user)
      useAuthStore.getState().setSavedHandles(new Set())
      posthog.identify(user.uid, {
        email: user.email,
        name: user.displayName,
      })
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'savedRestaurants'))
        useAuthStore.getState().setSavedHandles(new Set(snap.docs.map(d => d.id)))
      } catch { /* ignore */ }
    } else {
      useAuthStore.getState().setUser(null)
      useAuthStore.getState().setSavedHandles(new Set())
      posthog.reset()
    }
    useAuthStore.getState().setAuthLoading(false)
  })
}

export default useAuthStore
