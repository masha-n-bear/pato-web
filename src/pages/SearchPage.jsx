import { useMemo, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import posthog from 'posthog-js'
import RestaurantCard from '../components/RestaurantCard'
import useStore from '../store'
import config from '../data/config.json'
import { getPurposeTags, PURPOSE_OPTIONS } from '../utils/purposeUtils'
import { parseQueryToFilters } from '../utils/geminiSearch'
import './SearchPage.css'
import './CollectionsPage.css'

const AMENITY_OPTIONS = [
  "Chỗ đỗ xe", "Wifi", "Phòng riêng", "Thanh toán thẻ",
  "Có xuất hóa đơn", "Trang trí sự kiện", "Karaoke",
  "Bàn ngoài trời", "Màn chiếu", "Khu vui chơi trẻ em",
  "Chỗ hút thuốc", "Nhận giao hàng",
]

function NlSearchBar({ locations, onApplyFilters }) {
  const [nlQuery, setNlQuery] = useState('')
  const [nlLoading, setNlLoading] = useState(false)
  const [nlError, setNlError] = useState(null)

  async function handleNlSearch() {
    if (!nlQuery.trim()) return
    setNlLoading(true)
    setNlError(null)
    try {
      const filters = await parseQueryToFilters(nlQuery, locations)
      onApplyFilters(filters, nlQuery.trim())
    } catch (err) {
      setNlError(err.message)
    } finally {
      setNlLoading(false)
    }
  }

  return (
    <div className="nl-search-bar">
      <input
        type="text"
        value={nlQuery}
        onChange={e => setNlQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleNlSearch()}
        placeholder="Mô tả nhà hàng bạn đang tìm, ví dụ: đồ Việt cho gia đình ở Hà Nội..."
        disabled={nlLoading}
      />
      <button onClick={handleNlSearch} disabled={nlLoading || !nlQuery.trim()}>
        {nlLoading ? 'Đang tìm...' : '✦ Tìm thông minh'}
      </button>
      {nlError && <p className="nl-error">{nlError}</p>}
    </div>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { restaurants, locations, loaded } = useStore()
  const [filterOpen, setFilterOpen] = useState(false)
  const [nlLabel, setNlLabel] = useState('')

  const q = searchParams.get('q') || ''
  const cuisines = searchParams.getAll('cuisine')
  const services = searchParams.getAll('service')
  const prices = searchParams.getAll('price')
  const discount = searchParams.get('discount') === '1'
  const purposes = searchParams.getAll('purpose')
  const amenities = searchParams.getAll('amenity')
  const province = searchParams.get('province') || ''
  const district = searchParams.get('district') || ''
  const sort = searchParams.get('sort') || 'default'
  const nlKeywords = searchParams.getAll('nlkw')

  const hasFilters = !!(q.trim() || cuisines.length || services.length || prices.length ||
    discount || province || district || purposes.length || amenities.length || nlKeywords.length)

  const districts = useMemo(() => {
    if (!province) return []
    const loc = locations.find(l => l.province === province)
    return loc ? loc.districts : []
  }, [locations, province])

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
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
        const rPurposes = r.purpose_tags || []
        if (!purposes.some(p => rPurposes.includes(p))) return false
      }
      if (amenities.length) {
        let rAm = {}
        try { rAm = JSON.parse(r.amenities || '{}') } catch { /* ignore */ }
        if (!amenities.every(a => rAm[a] === true)) return false
      }
      if (nlKeywords.length) {
        const searchText = `${r.title} ${r.description || ''}`.toLowerCase()
        if (!nlKeywords.some(kw => searchText.includes(kw))) return false
      }
      return true
    })
  }, [q, restaurants, cuisines, services, prices, discount, province, district, purposes, amenities, nlKeywords])

  const results = useMemo(() => {
    const arr = [...filtered]
    if (sort === 'newest') arr.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    else if (sort === 'price_asc') arr.sort((a, b) => Number(a.price_range) - Number(b.price_range))
    else if (sort === 'price_desc') arr.sort((a, b) => Number(b.price_range) - Number(a.price_range))
    return arr
  }, [filtered, sort])

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

  function setSort(val) {
    const p = new URLSearchParams(searchParams)
    if (val === 'default') p.delete('sort')
    else p.set('sort', val)
    setSearchParams(p)
  }

  function applyNlFilters(filters, label) {
    const p = new URLSearchParams(searchParams)
    ;['cuisine', 'service', 'price', 'purpose', 'amenity', 'nlkw'].forEach(k => p.delete(k))
    p.delete('province')
    p.delete('district')
    if (filters.cuisine) filters.cuisine.forEach(v => p.append('cuisine', v))
    if (filters.service) filters.service.forEach(v => p.append('service', v))
    if (filters.price) filters.price.forEach(v => p.append('price', v))
    if (filters.purpose) filters.purpose.forEach(v => p.append('purpose', v))
    if (filters.amenity) filters.amenity.forEach(v => p.append('amenity', v))
    if (filters.province) p.set('province', filters.province)
    if (filters.district) p.set('district', filters.district)
    if (filters.keywords) filters.keywords.forEach(v => p.append('nlkw', v))
    setSearchParams(p)
    setNlLabel(label || '')
  }

  function toggleDiscount() {
    const p = new URLSearchParams(searchParams)
    if (discount) p.delete('discount')
    else p.set('discount', '1')
    setSearchParams(p)
  }

  const searchLabel = nlLabel || (q ? `"${q}"` : '')

  return (
    <div className="search-page">
      <div className="wrapper">
        <div className="collections-inner">
          {filterOpen && <div className="filter-overlay" onClick={() => setFilterOpen(false)} />}

          {/* Filter sidebar */}
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
            <NlSearchBar locations={locations} onApplyFilters={applyNlFilters} />

            {hasFilters && (
              <div className="search-result-label">
                <h2 className="search-h2">
                  Bạn đang tìm{searchLabel ? ': ' : ''}<em>{searchLabel}</em>
                </h2>
              </div>
            )}

            <div className="collections-header">
              <div className="collections-header-right">
                <button className="mobile-filter-btn" onClick={() => setFilterOpen(true)}>
                  ☰ Lọc nâng cao
                </button>
                {hasFilters && (
                  <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="default">Pato đề xuất</option>
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá từ thấp đến cao</option>
                    <option value="price_desc">Giá từ cao đến thấp</option>
                  </select>
                )}
                {hasFilters && (
                  <span className="result-count">
                    {loaded ? `Có ${results.length} nhà hàng phù hợp` : 'Đang tải...'}
                  </span>
                )}
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

            {!hasFilters ? (
              <div className="nl-empty-state">
                <p className="nl-empty-hint">Nhập mô tả vào ô tìm thông minh bên trên, hoặc chọn bộ lọc ở thanh bên để bắt đầu tìm kiếm.</p>
                <p className="nl-empty-example">Ví dụ: <em>"Đồ Việt cho gia đình ở nội thành Hà Nội"</em>, <em>"Nhà hàng lẩu có chỗ đỗ xe quận 1"</em></p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
