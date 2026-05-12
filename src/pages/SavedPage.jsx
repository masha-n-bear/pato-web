import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../authStore'
import useStore from '../store'
import RestaurantCard from '../components/RestaurantCard'
import './SavedPage.css'

export default function SavedPage() {
  const savedHandles = useAuthStore((s) => s.savedHandles)
  const restaurants = useStore((s) => s.restaurants)
  const loaded = useStore((s) => s.loaded)

  const savedRestaurants = useMemo(() => {
    if (!loaded) return []
    return restaurants.filter((r) => savedHandles.has(r.handle))
  }, [restaurants, savedHandles, loaded])

  return (
    <div className="saved-page">
      <div className="wrapper">
        <h1 className="saved-title">Đã lưu</h1>
        {!loaded ? (
          <div className="saved-loading">Đang tải...</div>
        ) : savedRestaurants.length === 0 ? (
          <div className="saved-empty">
            <div className="saved-empty-icon">🔖</div>
            <p>Bạn chưa lưu nhà hàng nào.</p>
            <Link to="/" className="saved-explore-btn">Khám phá ngay</Link>
          </div>
        ) : (
          <div className="saved-grid">
            {savedRestaurants.map((r) => (
              <RestaurantCard key={r.handle} restaurant={r} section="saved" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
