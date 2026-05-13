import { useMemo, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import posthog from 'posthog-js'
import RestaurantCard from '../components/RestaurantCard'
import useStore from '../store'
import config from '../data/config.json'
import { getPurposeTags, PURPOSE_OPTIONS } from '../utils/purposeUtils'
import './SearchPage.css'
import './CollectionsPage.css'

const AMENITY_OPTIONS = [
  "Chỗ đỗ xe", "Wifi", "Phòng riêng", "Thanh toán thẻ",
  "Có xuất hóa đơn", "Trang trí sự kiện", "Karaoke",
  "Bàn ngoài trời", "Màn chiếu", "Khu vui chơi trẻ em",
  "Chỗ hút thuốc", "Nhận giao hàng",
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { restaurants, locations, loaded } = useStore()
  const [filterOpen, setFilterOpen] = useState(false)

  const q = searchParams.get('q') || ''
  const cuisines = searchParams.getAll('cuisine')
  const services = searchParams.getAll('service')
  const prices = searchParams.getAll('price')
  const discount = searchParams.get('discount') === '1'
  const purposes = searchParams.getAll('purpose')
  const amenities = searchParams.getAll('amenity')
  const province = searchParams.get('province') || ''
  const district = searchParams.get('district') || ''

  const districts = useMemo(() => {
    if (!province) return []
    const loc = locations.find(l => l.province === province)
    return loc ? loc.districts : []
  }, [locations, province])

  const results = useMemo(() => {
    return restaurants.filter(r => {
      // text search
      if (q.trim()) {
        const lower = q.toLowerCase()
        if (
          !r.title.toLowerCase().includes(lower) &&
          !r.address.toLowerCase().includes(lower) &&
          !r.cuisine_all?.some(c => c.toLowerCase().includes(lower))
        ) return false
      }
      if (cuisines.length && !r.cuisine_all?.some(c => cuisines.includes(c))) return false
      if (services.length && !services.includes(r.service_type)) return false
      if (prices.length && !prices.map(String).includes(String(r.price_range))) return false
      if (discount && !r.discount) return false
      if (province && r.province !== province) return false
      if (district && r.district !== district) return false
      if (purposes.length) {
        const rPurposes = getPurposeTags(r)
        if (!purposes.some(p => rPurposes.includes(p))) return false
      }
      if (amenities.length) {
        let rAm = {}
        try { rAm = JSON.parse(r.amenities || '{}') } catch { /* ignore */ }
        if (!amenities.every(a => rAm[a] === true)) return false
      }
      return true
    })
  }, [q, restaurants, cuisines, services, prices, discount, province, district, purposes, amenities])

  useEffect(() => {
    if (!loaded) return
    posthog.capture('search', { query: q, result_count: results.length })
  }, [q, loaded, results.length])

  function toggleFilter(key, val) {
    const p = new URLSearchParams(searchParams)
    const current = p.getAll(key)
    p.delete(key)
    if (current.includes(val)) {
      current.filter(v => v !== val).forEach(v => p.append(key, v))
    } else {
      [...current, val].forEach(v => p.append(key, v))
    }
    setSearchParams(p)
  }

  function clearFilter(key) {
    const p = new URLSearchParams(searchParams)
    p.delete(key)
    setSearchParams(p)
  }

  function setParam(key, val) {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val)
    else p.delete(key)
    if (key === 'province') p.delete('district')
    setSearchParams(p)
  }

  function toggleDiscount() {
    const p = new URLSearchParams(searchParams)
    if (discount) p.delete('discount')
    else p.set('discount', '1')
    setSearchParams(p)
  }

  return (
    <div className="search-page">
      <div className="wrapper">
        <div className="collections-inner">
          {filterOpen && <div className="filter-overlay" onClick={() => setFilterOpen(false)} />}

          {/* Filter sidebar – same structure as CollectionsPage */}
          <aside className={`collections-sidebar${filterOpen ? ' is-open' : ''}`}>
            <button className="filter-close-btn" onClick={() => setFilterOpen(false)}>✕ Đóng</button>

            <div className="filter-section">
              <h3>Khu vực</h3>
              <div className="filter-dropdowns">
                <select value={province} onChange={e => setParam('province', e.target.value)}>
                  <option value="">Tất cả tỉnh/thành</option>
                  {locations.map(l => <option key={l.province} value={l.province}>{l.province}</option>)}
                </select>
                <select value={district} onChange={e => setParam('district', e.target.value)} disabled={!province}>
                  <option value="">Tất cả quận/huyện</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="filter-section">
              <h3>Mục đích</h3>
              <div className="filter-checks">
                {purposes.length > 0 && <button className="filter-clear-btn" onClick={() => clearFilter('purpose')}>Xóa lọc</button>}
                {PURPOSE_OPTIONS.map(p => (
                  <label key={p} className="filter-check-label">
                    <input type="checkbox" checked={purposes.includes(p)} onChange={() => toggleFilter('purpose', p)} />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Tiện ích</h3>
              <div className="filter-checks">
                {amenities.length > 0 && <button className="filter-clear-btn" onClick={() => clearFilter('amenity')}>Xóa lọc</button>}
                {AMENITY_OPTIONS.map(a => (
                  <label key={a} className="filter-check-label">
                    <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleFilter('amenity', a)} />
                    {a}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Loại hình ẩm thực</h3>
              <div className="filter-checks">
                {cuisines.length > 0 && <button className="filter-clear-btn" onClick={() => clearFilter('cuisine')}>Xóa lọc</button>}
                {config.cuisine_main.map(c => (
                  <label key={c} className="filter-check-label">
                    <input type="checkbox" checked={cuisines.includes(c)} onChange={() => toggleFilter('cuisine', c)} />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Loại dịch vụ</h3>
              <div className="filter-checks">
                {services.length > 0 && <button className="filter-clear-btn" onClick={() => clearFilter('service')}>Xóa lọc</button>}
                {config.service_type.map(s => (
                  <label key={s} className="filter-check-label">
                    <input type="checkbox" checked={services.includes(s)} onChange={() => toggleFilter('service', s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Khoảng giá</h3>
              <div className="filter-checks">
                {prices.length > 0 && <button className="filter-clear-btn" onClick={() => clearFilter('price')}>Xóa lọc</button>}
                {config.price_range.map(p => (
                  <label key={p.value} className="filter-check-label">
                    <input type="checkbox" checked={prices.includes(String(p.value))} onChange={() => toggleFilter('price', String(p.value))} />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Khuyến mãi</h3>
              <div className="filter-checks">
                <label className="filter-check-label">
                  <input type="checkbox" checked={discount} onChange={toggleDiscount} />
                  Có khuyến mãi
                </label>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="collections-content">
            <div className="collections-header">
              <div className="collections-header-right">
                <button className="mobile-filter-btn" onClick={() => setFilterOpen(true)}>
                  ☰ Lọc nâng cao
                </button>
              </div>
              <div>
                <h1 className="search-h1">
                  {q ? `Kết quả: "${q}"` : 'Tất cả nhà hàng'}
                </h1>
                <p className="search-count">
                  {!loaded ? 'Đang tải...' : `${results.length} kết quả`}
                </p>
              </div>
            </div>

            {/* Active chips */}
            {(purposes.length > 0 || amenities.length > 0 || cuisines.length > 0) && (
              <div className="active-filters">
                {purposes.map(p => (
                  <span key={p} className="filter-chip">{p} <button onClick={() => toggleFilter('purpose', p)}>×</button></span>
                ))}
                {amenities.map(a => (
                  <span key={a} className="filter-chip amenity">{a} <button onClick={() => toggleFilter('amenity', a)}>×</button></span>
                ))}
                {cuisines.map(c => (
                  <span key={c} className="filter-chip">{c} <button onClick={() => toggleFilter('cuisine', c)}>×</button></span>
                ))}
              </div>
            )}

            <div className="search-grid">
              {results.map(r => (
                <RestaurantCard key={r.handle} restaurant={r} section="search_results" />
              ))}
            </div>
            {loaded && results.length === 0 && (
              <div className="no-results">
                <p>Không tìm thấy nhà hàng phù hợp{q ? ` với "${q}"` : ''}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
