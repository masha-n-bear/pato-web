import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, setDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

const useAuthStore = create((set, get) => ({
  user: null,
  authLoading: true,
  savedHandles: new Set(),
  savedLoading: false,

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
      if (wasSaved) {
        await deleteDoc(ref)
      } else {
        await setDoc(ref, { handle, savedAt: serverTimestamp() })
      }
    } catch {
      // revert optimistic update on error
      set({ savedHandles })
    }
  },
}))

export function initAuth() {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      useAuthStore.getState().setUser(user)
      useAuthStore.getState().setSavedHandles(new Set())
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'savedRestaurants'))
        const handles = snap.docs.map((d) => d.id)
        useAuthStore.getState().setSavedHandles(new Set(handles))
      } catch {
        // leave savedHandles empty on error
      }
    } else {
      useAuthStore.getState().setUser(null)
      useAuthStore.getState().setSavedHandles(new Set())
    }
    useAuthStore.getState().setAuthLoading(false)
  })
}

export default useAuthStore
