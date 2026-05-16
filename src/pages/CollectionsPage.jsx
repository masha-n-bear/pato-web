import { useMemo, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import posthog from "posthog-js";
import RestaurantCard from "../components/RestaurantCard";
import Breadcrumb from "../components/Breadcrumb";
import useStore from "../store";
import config from "../data/config.json";
import { getPurposeTags, PURPOSE_OPTIONS } from "../utils/purposeUtils";
import "./CollectionsPage.css";

const PAGE_SIZE = 24;

const AMENITY_OPTIONS = [
  "Chỗ đỗ xe", "Wifi", "Phòng riêng", "Thanh toán thẻ",
  "Có xuất hóa đơn", "Trang trí sự kiện", "Karaoke",
  "Bàn ngoài trời", "Màn chiếu", "Khu vui chơi trẻ em",
  "Chỗ hút thuốc", "Nhận giao hàng",
];

export default function CollectionsPage() {
  const { restaurants, collections, locations, loaded } = useStore();
  const { handle } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  // All filter state derived directly from URL
  const cuisines = searchParams.getAll("cuisine");
  const services = searchParams.getAll("service");
  const prices = searchParams.getAll("price");
  const discount = searchParams.get("discount") === "1";
  const statuses = searchParams.getAll("status");
  const purposes = searchParams.getAll("purpose");
  const amenities = searchParams.getAll("amenity");
  const sort = searchParams.get("sort") || "default";
  const province = searchParams.get("province") || "";
  const district = searchParams.get("district") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const collection = useMemo(
    () => (handle ? collections.find((c) => c.handle === handle) : null),
    [collections, handle],
  );

  const districts = useMemo(() => {
    if (!province) return [];
    const loc = locations.find((l) => l.province === province);
    return loc ? loc.districts : [];
  }, [locations, province]);

  const filtered = useMemo(() => {
    const collectionSet = collection
      ? new Set(collection.restaurant_handles)
      : null;

    return restaurants.filter((r) => {
      if (collectionSet && !collectionSet.has(r.handle)) return false;
      if (cuisines.length && !r.cuisine_all?.some((c) => cuisines.includes(c))) return false;
      if (services.length && !services.includes(r.service_type)) return false;
      if (prices.length && !prices.map(String).includes(String(r.price_range))) return false;
      if (discount && !r.discount) return false;
      if (statuses.length && !statuses.includes(r.status)) return false;
      if (province && r.province !== province) return false;
      if (district && r.district !== district) return false;

      // Purpose filter
      if (purposes.length) {
        const rPurposes = r.purpose_tags || [];
        if (!purposes.some(p => rPurposes.includes(p))) return false;
      }

      // Amenity filter
      if (amenities.length) {
        let rAmenities = {};
        try { rAmenities = JSON.parse(r.amenities || '{}'); } catch { /* ignore */ }
        if (!amenities.every(a => rAmenities[a] === true)) return false;
      }

      return true;
    });
  }, [
    restaurants, collection, cuisines, services, prices,
    discount, statuses, province, district, purposes, amenities,
  ]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "newest")
      arr.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    else if (sort === "price_asc")
      arr.sort((a, b) => Number(a.price_range) - Number(b.price_range));
    else if (sort === "price_desc")
      arr.sort((a, b) => Number(b.price_range) - Number(a.price_range));
    return arr;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function toggleFilter(key, val) {
    const p = new URLSearchParams(searchParams);
    const current = p.getAll(key);
    p.delete(key);
    if (current.includes(val)) {
      current.filter((v) => v !== val).forEach((v) => p.append(key, v));
    } else {
      [...current, val].forEach((v) => p.append(key, v));
    }
    p.delete("page");
    setSearchParams(p);
    posthog.capture("filter_applied", { filter_type: key, value: val, collection: handle || null });
  }

  function clearFilter(key) {
    const p = new URLSearchParams(searchParams);
    p.delete(key);
    p.delete("page");
    setSearchParams(p);
  }

  function setParam(key, val) {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val);
    else p.delete(key);
    p.delete("page");
    if (key === "province") p.delete("district");
    setSearchParams(p);
  }

  function toggleDiscount() {
    const p = new URLSearchParams(searchParams);
    if (discount) p.delete("discount");
    else p.set("discount", "1");
    p.delete("page");
    setSearchParams(p);
  }

  function goToPage(n) {
    const p = new URLSearchParams(searchParams);
    if (n === 1) p.delete("page");
    else p.set("page", String(n));
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setSort(val) {
    const p = new URLSearchParams(searchParams);
    if (val === "default") p.delete("sort");
    else p.set("sort", val);
    p.delete("page");
    setSearchParams(p);
  }

  const pageTitle = collection ? collection.title : "Nhà hàng";
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: pageTitle, href: handle ? `/collections/${handle}` : "/collections" },
  ];

  const FilterSidebar = (
    <aside className={`collections-sidebar${filterOpen ? " is-open" : ""}`}>
      <button className="filter-close-btn" onClick={() => setFilterOpen(false)}>✕ Đóng</button>

      <div className="filter-section">
        <h3>Khu vực</h3>
        <div className="filter-dropdowns">
          <select value={province} onChange={(e) => setParam("province", e.target.value)}>
            <option value="">Tất cả tỉnh/thành</option>
            {locations.map((l) => (
              <option key={l.province} value={l.province}>{l.province}</option>
            ))}
          </select>
          <select value={district} onChange={(e) => setParam("district", e.target.value)} disabled={!province}>
            <option value="">Tất cả quận/huyện</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="filter-section">
        <h3>Mục đích</h3>
        <div className="filter-checks">
          {purposes.length > 0 && (
            <button className="filter-clear-btn" onClick={() => clearFilter("purpose")}>Xóa lọc</button>
          )}
          {PURPOSE_OPTIONS.map((p) => (
            <label key={p} className="filter-check-label">
              <input type="checkbox" checked={purposes.includes(p)} onChange={() => toggleFilter("purpose", p)} />
              {p}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Tiện ích</h3>
        <div className="filter-checks">
          {amenities.length > 0 && (
            <button className="filter-clear-btn" onClick={() => clearFilter("amenity")}>Xóa lọc</button>
          )}
          {AMENITY_OPTIONS.map((a) => (
            <label key={a} className="filter-check-label">
              <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleFilter("amenity", a)} />
              {a}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Loại hình ẩm thực</h3>
        <div className="filter-checks">
          {cuisines.length > 0 && (
            <button className="filter-clear-btn" onClick={() => clearFilter("cuisine")}>Xóa lọc</button>
          )}
          {config.cuisine_main.map((c) => (
            <label key={c} className="filter-check-label">
              <input type="checkbox" checked={cuisines.includes(c)} onChange={() => toggleFilter("cuisine", c)} />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Loại dịch vụ</h3>
        <div className="filter-checks">
          {services.length > 0 && (
            <button className="filter-clear-btn" onClick={() => clearFilter("service")}>Xóa lọc</button>
          )}
          {config.service_type.map((s) => (
            <label key={s} className="filter-check-label">
              <input type="checkbox" checked={services.includes(s)} onChange={() => toggleFilter("service", s)} />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Khoảng giá</h3>
        <div className="filter-checks">
          {prices.length > 0 && (
            <button className="filter-clear-btn" onClick={() => clearFilter("price")}>Xóa lọc</button>
          )}
          {config.price_range.map((p) => (
            <label key={p.value} className="filter-check-label">
              <input type="checkbox" checked={prices.includes(String(p.value))} onChange={() => toggleFilter("price", String(p.value))} />
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
  );

  return (
    <div className="collections-page">
      <div className="wrapper">
        <Breadcrumb items={breadcrumbItems} />
        <div className="collections-inner">
          {filterOpen && <div className="filter-overlay" onClick={() => setFilterOpen(false)} />}
          {FilterSidebar}

          <div className="collections-content">
            <div className="collections-header">
              <div className="collections-header-right">
                <button className="mobile-filter-btn" onClick={() => setFilterOpen(true)}>
                  ☰ Lọc nâng cao
                </button>
                <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="default">Pato đề xuất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá từ thấp đến cao</option>
                  <option value="price_desc">Giá từ cao đến thấp</option>
                </select>
              </div>
              <span className="result-count">
                {loaded ? `Có ${filtered.length} nhà hàng phù hợp` : "Đang tải..."}
              </span>
            </div>

            {/* Active filter chips */}
            {(purposes.length > 0 || amenities.length > 0) && (
              <div className="active-filters">
                {purposes.map(p => (
                  <span key={p} className="filter-chip">
                    {p} <button onClick={() => toggleFilter('purpose', p)}>×</button>
                  </span>
                ))}
                {amenities.map(a => (
                  <span key={a} className="filter-chip amenity">
                    {a} <button onClick={() => toggleFilter('amenity', a)}>×</button>
                  </span>
                ))}
              </div>
            )}

            {!loaded ? (
              <div className="collections-grid">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="card-skeleton" />
                ))}
              </div>
            ) : handle && !collection ? (
              <div className="collection-not-found">
                <p>Không tìm thấy bộ sưu tập này.</p>
              </div>
            ) : (
              <>
                <div className="collections-grid">
                  {pageItems.map((r) => (
                    <RestaurantCard key={r.handle} restaurant={r} section="collections_page" />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
                    {buildPageNumbers(currentPage, totalPages).map((n, i) =>
                      n === "..." ? (
                        <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
                      ) : (
                        <button
                          key={n}
                          className={`pagination-btn${n === currentPage ? " active" : ""}`}
                          onClick={() => goToPage(n)}
                        >
                          {n}
                        </button>
                      ),
                    )}
                    <button className="pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
