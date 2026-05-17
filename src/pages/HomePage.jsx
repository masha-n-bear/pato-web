import { useState, useMemo, useEffect, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import Carousel from "../components/Carousel";
import RestaurantCard from "../components/RestaurantCard";
import useStore from "../store";
import useAuthStore from "../authStore";
import config from "../data/config.json";
import { getPurposeTags, PURPOSE_OPTIONS } from "../utils/purposeUtils";
import { getOpeningHoursForDate } from "../utils/bookingUtils";
import { bookedTodayCount } from "../utils/hashUtils";
import { getPersonalizedRecommendations } from "../utils/scoringUtils";
import "./HomePage.css";

const BLOG_COLLECTION_LABELS = {
  healthy: "Healthy",
  "huong-dan": "Hướng dẫn",
  "doi-tac": "Đối tác",
  "top-nha-hang": "Top Nhà Hàng",
  "mon-heo": "Món Heo",
  "van-hoa-viet-nam": "Văn hóa Việt Nam",
  "mon-nhau": "Món Nhậu",
  "mon-chay": "Món Chay",
  "am-thuc-a-au": "Ẩm thực Á-Âu",
  "am-thuc-3-mien": "Ẩm thực 3 miền",
  "hai-san": "Hải sản",
  "rau-cu": "Rau củ",
  "mon-ga": "Món Gà",
  "trang-mieng": "Tráng miệng",
  "mon-bo": "Món Bò",
};

const SUGGEST_ITEMS = [
  { img: "//theme.hstatic.net/1000275435/1000883829/14/home_sug_img1.jpg", alt: "Acacias", href: "/products/acacias-47-linh-lang" },
  { img: "//theme.hstatic.net/1000275435/1000883829/14/home_sug_img2.jpg", alt: "Giang Dung", href: "/products/giang-dung-46-25-tho-quan" },
  { img: "//theme.hstatic.net/1000275435/1000883829/14/home_sug_img3.jpg", alt: "Vua Ngân", href: "/products/vua-ngan-24-tran-binh" },
  { img: "//theme.hstatic.net/1000275435/1000883829/14/home_sug_img4.jpg", alt: "Bò Nhúng Dấm 275", href: "/collections/bo-nhung-dam-275-ha-noi" },
  { img: "//theme.hstatic.net/1000275435/1000883829/14/home_sug_img5.jpg", alt: "Hải sản Biển Đông", href: "/collections/hai-san-bien-dong-ha-noi" },
  { img: "//theme.hstatic.net/1000275435/1000883829/14/home_sug_img6.jpg", alt: "Đệ Nhất Quán", href: "/products/de-nhat-quan-2-ngo-20-lang-ha" },
  { img: "//theme.hstatic.net/1000275435/1000883829/14/home_sug_img7.jpg", alt: "Cơm Niêu Singapore", href: "/collections/com-nieu-singapore-kombo-ha-noi" },
  { img: "//theme.hstatic.net/1000275435/1000883829/14/home_sug_img8.jpg", alt: "Sentosa", href: "/products/sentosa-12-huynh-thuc-khang" },
  { img: "//theme.hstatic.net/1000275435/1000883829/14/home_sug_img9.jpg", alt: "Vitamin Beer", href: "/products/vitamin-beer-76-nguyen-van-tuyet" },
  { img: "//theme.hstatic.net/1000275435/1000883829/14/home_sug_img10.jpg", alt: "Lẩu Nướng Wang Wang", href: "/collections/lau-nuong-wang-wang-ha-noi" },
];

// Check if restaurant is open for lunch (opening by 11:00 today)
function isOpenForLunch(restaurant) {
  if (!restaurant.opening_hours) return false;
  const today = new Date().toISOString().slice(0, 10);
  const hoursStr = getOpeningHoursForDate(restaurant.opening_hours, today);
  if (!hoursStr || hoursStr.toLowerCase().includes('đóng')) return false;
  const openPart = hoursStr.split(' - ')[0].trim();
  const openH = parseInt(openPart.split(':')[0], 10);
  return openH <= 11;
}

function HomeSection({ title, viewMoreHref, children, accentColor }) {
  return (
    <section className="home-section">
      <div className="wrapper">
        <div className="inner">
          <div className="home-section-header" style={accentColor ? { '--section-accent': accentColor } : {}}>
            <h2 className="home-section-title">{title}</h2>
            {viewMoreHref && (
              <Link to={viewMoreHref} className="home-section-more">Xem thêm →</Link>
            )}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

function SkeletonRow() {
  return (
    <div className="home-collection-skeleton-row">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card-skeleton" />)}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { restaurants, locations, collections, loaded } = useStore();
  const savedHandles = useAuthStore((s) => s.savedHandles);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [purpose, setPurpose] = useState("");
  const [amenity, setAmenity] = useState("");
  const [blogPosts, setBlogPosts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/blog_index.json`)
      .then(r => r.json())
      .then(posts => setBlogPosts([...posts].sort((a, b) => (b.date > a.date ? 1 : -1))))
      .catch(() => {});
  }, []);

  const blogCollections = useMemo(
    () => [...new Set(blogPosts.map(p => p.collection).filter(Boolean))],
    [blogPosts],
  );
  const recentPosts = blogPosts.slice(0, 8);

  const districtList = province
    ? locations.find(l => l.province === province)?.districts || []
    : [];

  const today = new Date().toISOString().slice(0, 10);

  // ── Section data ─────────────────────────────────────────────────────────
  const discountRestaurants = useMemo(
    () => restaurants.filter(r => r.discount).slice(0, 12),
    [restaurants],
  );

  const proposedCollection = useMemo(() => {
    const savedList = restaurants.filter((r) => savedHandles.has(r.handle));
    const recentHandles = JSON.parse(localStorage.getItem("pato_recently_viewed") || "[]");
    const recentList = recentHandles
      .map((h) => restaurants.find((r) => r.handle === h))
      .filter(Boolean);

    const savedHandleSet = new Set(savedList.map((r) => r.handle));
    const weightedRefs = [
      ...savedList.map((r) => ({ restaurant: r, weight: 2.5 })),
      ...recentList
        .filter((r) => !savedHandleSet.has(r.handle))
        .map((r) => ({ restaurant: r, weight: 1.0 })),
    ];

    if (weightedRefs.length === 0) {
      const col = collections.find((c) => c.handle === "pato-de-xuat-top-nha-hang-tai-ha-noi");
      if (!col) return [];
      const map = new Map(restaurants.map((r) => [r.handle, r]));
      return col.restaurant_handles.map((h) => map.get(h)).filter(Boolean).slice(0, 12);
    }

    const candidates = restaurants.filter((r) => !savedHandles.has(r.handle));
    return getPersonalizedRecommendations(weightedRefs, candidates, { topN: 12 });
  }, [collections, restaurants, savedHandles]);

  const mostBookedRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => bookedTodayCount(b.handle) - bookedTodayCount(a.handle))
      .slice(0, 12);
  }, [restaurants]);

  const newestRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 12);
  }, [restaurants]);

  const partyRestaurants = useMemo(() => {
    return restaurants
      .filter(r => {
        const tags = r.purpose_tags || [];
        return tags.includes('Sinh nhật') || tags.includes('Tiệc công ty') || tags.includes('Tiệc ngoài trời');
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
  }, [restaurants]);

  const lunchRestaurants = useMemo(() => {
    return restaurants
      .filter(r => (r.purpose_tags || []).includes('Ăn gia đình'))
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
  }, [restaurants]);

  function handleAdvancedSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (province) params.set("province", province);
    if (district) params.set("district", district);
    if (priceRange) params.set("price", priceRange);
    if (cuisine) params.set("cuisine", cuisine);
    if (purpose) params.append("purpose", purpose);
    if (amenity) params.append("amenity", amenity);
    navigate(`/collections?${params.toString()}`);
  }

  return (
    <div className="homepage">
      {/* ── Banner carousel ── */}
      <section id="home-suggest">
        <div className="wrapper">
          <div className="inner">
            <div className="section-title">
              <h2>Ưu đãi siêu khủng chỉ có tại PATO</h2>
              <p>ƯU ĐÃI ngập tràn, ĐẶT BÀN nhanh gọn, TIẾT KIỆM thời gian</p>
            </div>
            <Carousel
              items={SUGGEST_ITEMS}
              itemsPerView={4}
              breakpoints={{ 0: 1, 640: 2, 992: 4 }}
              autoPlay
              autoPlayInterval={6000}
              renderItem={(item) => (
                <div className="hpromo-item">
                  <Link to={item.href}>
                    <img src={item.img} alt={item.alt} loading="lazy" />
                  </Link>
                </div>
              )}
            />
          </div>
        </div>
      </section>

      {/* ── Advanced search ── */}
      <section className="home-search-section">
        <div className="module_search_pro">
          <div className="wrapper">
            <div className="inner">
              <div className="section-title">
                <h2>Tìm kiếm nâng cao</h2>
                <p>Tìm kiếm nhà hàng phù hợp với nhu cầu của bạn</p>
              </div>
              <div className="search-pro-wrap">
                <div className="search-bg" />
                <form className="search-pro-form" onSubmit={handleAdvancedSearch}>
                  <div className="search-pro-fields">
                    <div className="search-field">
                      <select value={province} onChange={e => { setProvince(e.target.value); setDistrict(""); }}>
                        <option value="">Tỉnh / Thành phố</option>
                        {locations.map(l => <option key={l.province} value={l.province}>{l.province}</option>)}
                      </select>
                    </div>
                    <div className="search-field">
                      <select value={district} onChange={e => setDistrict(e.target.value)} disabled={!province}>
                        <option value="">Quận / Huyện</option>
                        {districtList.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="search-field">
                      <select value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                        <option value="">Khoảng giá</option>
                        {config.price_range.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                    <div className="search-field">
                      <select value={cuisine} onChange={e => setCuisine(e.target.value)}>
                        <option value="">Loại hình ẩm thực</option>
                        {config.cuisine_main.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="search-field">
                      <select value={purpose} onChange={e => setPurpose(e.target.value)}>
                        <option value="">Mục đích</option>
                        {PURPOSE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="search-field">
                      <select value={amenity} onChange={e => setAmenity(e.target.value)}>
                        <option value="">Tiện ích</option>
                        {["Chỗ đỗ xe","Wifi","Phòng riêng","Thanh toán thẻ","Có xuất hóa đơn","Trang trí sự kiện","Karaoke","Bàn ngoài trời","Màn chiếu","Khu vui chơi trẻ em","Chỗ hút thuốc","Nhận giao hàng"].map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div className="search-field search-submit">
                      <button type="submit" className="btn-search-pro">Tìm kiếm</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1. Ưu đãi siêu khủng tại PATO ── */}
      {!loaded ? (
        <HomeSection title="Ưu đãi siêu khủng tại PATO"><SkeletonRow /></HomeSection>
      ) : discountRestaurants.length > 0 && (
        <HomeSection title="Ưu đãi siêu khủng tại PATO" viewMoreHref="/collections?discount=1" accentColor="#e74c3c">
          <Carousel
            items={discountRestaurants}
            fixedWidth={300}
            gap={20}
            renderItem={r => <RestaurantCard restaurant={r} section="home_deals" />}
          />
        </HomeSection>
      )}

      {/* ── 2. Top nhà hàng PATO đề xuất ── */}
      {!loaded ? (
        <HomeSection title="Top nhà hàng PATO đề xuất"><SkeletonRow /></HomeSection>
      ) : proposedCollection.length > 0 && (
        <HomeSection title="Top nhà hàng PATO đề xuất" viewMoreHref="/collections/pato-de-xuat-top-nha-hang-tai-ha-noi">
          <Carousel
            items={proposedCollection}
            fixedWidth={300}
            gap={20}
            renderItem={r => <RestaurantCard restaurant={r} section="home_proposed" />}
          />
        </HomeSection>
      )}

      {/* ── Partner banner ── */}
      {loaded && (
        <section className="home-partner-banner">
          <div className="wrapper">
            <Link to="/pages/dang-ky-doi-tac">
              <img
                src="//theme.hstatic.net/1000275435/1000883829/14/choose_1.png?v=1150"
                alt="Đăng ký đối tác PATO"
              />
            </Link>
          </div>
        </section>
      )}

      {/* ── 3. Top nhà hàng được đặt nhiều trong tháng ── */}
      {!loaded ? (
        <HomeSection title="Top nhà hàng được đặt nhiều trong tháng"><SkeletonRow /></HomeSection>
      ) : mostBookedRestaurants.length > 0 && (
        <HomeSection title="Top nhà hàng được đặt nhiều trong tháng" viewMoreHref="/collections">
          <Carousel
            items={mostBookedRestaurants}
            fixedWidth={300}
            gap={20}
            renderItem={r => <RestaurantCard restaurant={r} section="home_most_booked" />}
          />
        </HomeSection>
      )}

      {/* ── 4. Top nhà hàng mới nổi bật ── */}
      {!loaded ? (
        <HomeSection title="Top nhà hàng mới nổi bật"><SkeletonRow /></HomeSection>
      ) : newestRestaurants.length > 0 && (
        <HomeSection title="Top nhà hàng mới nổi bật" viewMoreHref="/collections?sort=newest">
          <Carousel
            items={newestRestaurants}
            fixedWidth={300}
            gap={20}
            renderItem={r => <RestaurantCard restaurant={r} section="home_newest" />}
          />
        </HomeSection>
      )}

      {/* ── 5. Đặt tiệc, sinh nhật, liên hoan ── */}
      {!loaded ? (
        <HomeSection title="Đặt tiệc, sinh nhật, liên hoan"><SkeletonRow /></HomeSection>
      ) : partyRestaurants.length > 0 && (
        <HomeSection title="Đặt tiệc, sinh nhật, liên hoan" viewMoreHref="/collections?purpose=Sinh+nh%E1%BA%ADt&purpose=Ti%E1%BB%87c+c%C3%B4ng+ty&purpose=Ti%E1%BB%87c+ngo%C3%A0i+tr%E1%BB%9Di">
          <Carousel
            items={partyRestaurants}
            fixedWidth={300}
            gap={20}
            renderItem={r => <RestaurantCard restaurant={r} section="home_party" />}
          />
        </HomeSection>
      )}

      {/* ── 6. Trưa nay ăn gì? ── */}
      {!loaded ? (
        <HomeSection title="Trưa nay ăn gì?"><SkeletonRow /></HomeSection>
      ) : lunchRestaurants.length > 0 && (
        <HomeSection title="Trưa nay ăn gì?" viewMoreHref="/collections?purpose=%C4%82n+gia+%C4%91%C3%ACnh">
          <Carousel
            items={lunchRestaurants}
            fixedWidth={300}
            gap={20}
            renderItem={r => <RestaurantCard restaurant={r} section="home_lunch" />}
          />
        </HomeSection>
      )}

      {/* ── Blog section ── */}
      <section id="home-blog">
        <div className="home-blog-banner">
          <div className="wrapper">
            <img src="//theme.hstatic.net/1000275435/1000883829/14/choose_2.png" alt="Blog PATO" />
          </div>
        </div>
        <div className="wrapper">
          <div className="inner">
            {blogCollections.length > 0 && (
              <div className="home-blog-collections">
                {blogCollections.map(col => (
                  <Link key={col} to={`/blogs/?collection=${col}`} className="home-blog-pill">
                    {BLOG_COLLECTION_LABELS[col] || col}
                  </Link>
                ))}
              </div>
            )}
            <div className="home-blog-grid">
              {recentPosts.map(post => (
                <Link key={post.slug} to={`/blogs/${post.slug}`} className="home-blog-card">
                  <div className="home-blog-card-img">
                    <img src={post.cover_image} alt={post.title} loading="lazy" />
                  </div>
                  <div className="home-blog-card-body">
                    <p className="home-blog-card-title">{post.title}</p>
                    <span className="home-blog-card-date">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {post.date ? new Date(post.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="home-blog-cta">
              <Link to="/blogs" className="btn-view-all-blogs">Xem tất cả tin tức</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section id="home-step">
        <div className="wrapper">
          <div className="inner">
            <div className="section-title">
              <h2 className="text-center">Hướng dẫn đặt bàn</h2>
              <p>Xem chi tiết hướng dẫn <a href="https://pato.com.vn/blogs/news/huong-dan-dat-ban-tai-pato-kenh-thong-tin-va-dat-ban-nha-hang">tại đây</a></p>
            </div>
            <div className="home-step-grid">
              <div className="home-step-item">
                <img className="step-img" src="//theme.hstatic.net/1000275435/1000883829/14/step_img1.png" alt="Chọn nhà hàng" />
                <p className="text-step">CHỌN NHÀ HÀNG</p>
                <p className="sub-step">Hàng ngàn Nhà hàng với nhiều ưu đãi</p>
                <img src="//theme.hstatic.net/1000275435/1000883829/14/left-black-arrow.png" className="step-arrow" alt="" />
              </div>
              <div className="home-step-item">
                <img className="step-img" src="//theme.hstatic.net/1000275435/1000883829/14/step_img2.png" alt="Gọi đặt chỗ" />
                <p className="text-step">GỌI ĐẶT CHỖ <br /> 1900.2280</p>
                <p className="sub-step"></p>
                <span className="step-or">Hoặc</span>
              </div>
              <div className="home-step-item">
                <img className="step-img" src="//theme.hstatic.net/1000275435/1000883829/14/step_img3.png" alt="Đặt bàn online" />
                <p className="text-step">ĐẶT BÀN ONLINE</p>
                <p className="sub-step">Truy cập Website www.pato.com.vn</p>
                <img src="//theme.hstatic.net/1000275435/1000883829/14/left-black-arrow.png" className="step-arrow" alt="" />
              </div>
              <div className="home-step-item">
                <img className="step-img" src="//theme.hstatic.net/1000275435/1000883829/14/step_img4.png" alt="Xác nhận" />
                <p className="text-step">XÁC NHẬN</p>
                <p className="sub-step">Xác nhận từ tổng đài viên PATO</p>
                <img src="//theme.hstatic.net/1000275435/1000883829/14/left-black-arrow.png" className="step-arrow" alt="" />
              </div>
              <div className="home-step-item">
                <img className="step-img" src="//theme.hstatic.net/1000275435/1000883829/14/step_img5.png" alt="Thưởng thức" />
                <p className="text-step">THƯỞNG THỨC</p>
                <p className="sub-step">Thưởng thức món ngon tại nhà hàng</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
