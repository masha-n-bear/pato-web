import useAuthStore from '../authStore'

export function useSaved(handle) {
  const savedHandles = useAuthStore((s) => s.savedHandles)
  const toggleSaved = useAuthStore((s) => s.toggleSaved)

  return {
    isSaved: savedHandles.has(handle),
    toggle: () => toggleSaved(handle),
  }
}
