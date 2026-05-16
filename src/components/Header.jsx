import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const AI_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" width="15" height="15">
    <path d="M295.4 37L310.2 73.8L347 88.6C350 89.8 352 92.8 352 96C352 99.2 350 102.2 347 103.4L310.2 118.2L295.4 155C294.2 158 291.2 160 288 160C284.8 160 281.8 158 280.6 155L265.8 118.2L229 103.4C226 102.2 224 99.2 224 96C224 92.8 226 89.8 229 88.6L265.8 73.8L280.6 37C281.8 34 284.8 32 288 32C291.2 32 294.2 34 295.4 37zM142.7 105.7L164.2 155.8L214.3 177.3C220.2 179.8 224 185.6 224 192C224 198.4 220.2 204.2 214.3 206.7L164.2 228.2L142.7 278.3C140.2 284.2 134.4 288 128 288C121.6 288 115.8 284.2 113.3 278.3L91.8 228.2L41.7 206.7C35.8 204.2 32 198.4 32 192C32 185.6 35.8 179.8 41.7 177.3L91.8 155.8L113.3 105.7C115.8 99.8 121.6 96 128 96C134.4 96 140.2 99.8 142.7 105.7zM496 368C502.4 368 508.2 371.8 510.7 377.7L532.2 427.8L582.3 449.3C588.2 451.8 592 457.6 592 464C592 470.4 588.2 476.2 582.3 478.7L532.2 500.2L510.7 550.3C508.2 556.2 502.4 560 496 560C489.6 560 483.8 556.2 481.3 550.3L459.8 500.2L409.7 478.7C403.8 476.2 400 470.4 400 464C400 457.6 403.8 451.8 409.7 449.3L459.8 427.8L481.3 377.7C483.8 371.8 489.6 368 496 368zM492 64C503 64 513.6 68.4 521.5 76.2L563.8 118.5C571.6 126.4 576 137 576 148C576 159 571.6 169.6 563.8 177.5L475.6 265.7L374.3 164.4L462.5 76.2C470.4 68.4 481 64 492 64zM76.2 462.5L340.4 198.3L441.7 299.6L177.5 563.8C169.6 571.6 159 576 148 576C137 576 126.4 571.6 118.5 563.8L76.2 521.5C68.4 513.6 64 503 64 492C64 481 68.4 470.4 76.2 462.5z"/>
  </svg>
);
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import useStore from "../store";
import useAuthStore from "../authStore";
import UserMenu from "./UserMenu";
import "./Header.css";

const NAV_LINKS = [
  { label: "Giới thiệu", to: "/pages/gioi-thieu" },
  { label: "Liên hệ hợp tác", to: "/pages/lien-he" },
  {
    label: "Đề án cung cấp dịch vụ TMĐT",
    to: "/pages/de-an-cung-cap-dich-vu-thuong-mai-dien-tu",
  },
];

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const restaurants = useStore((s) => s.restaurants);
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setMobileSearchOpen(false);
    }
  }

  function handleQueryChange(val) {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const q = val.toLowerCase();
      const results = restaurants
        .filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.address.toLowerCase().includes(q),
        )
        .slice(0, 8);
      setSuggestions(results);
      setShowSuggestions(true);
    }, 300);
  }

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      {/* Mobile Nav Drawer */}
      <div className={`nav-drawer ${mobileNavOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <span>Menu</span>
          <button onClick={() => setMobileNavOpen(false)}>✕</button>
        </div>
        <ul className="mobile-nav">
          <li>
            <a href="tel:19002280">📞 Hotline: 1900.2280</a>
          </li>
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} onClick={() => setMobileNavOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/saved" onClick={() => setMobileNavOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'5px',verticalAlign:'middle'}}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Đã lưu
            </Link>
          </li>
          {user ? (
            <li>
              <button
                className="mobile-logout-btn"
                onClick={() => { setMobileNavOpen(false); signOut(auth); }}
              >
                Đăng xuất
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                Đăng nhập
              </Link>
            </li>
          )}
        </ul>
      </div>
      {mobileNavOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <header id="header">
        {/* Desktop header */}
        <div className="header-desktop">
          <div className="header-top">
            <div className="wrapper">
              <div className="header-top-inner">
                {/* Logo + search */}
                <div className="header-logo-search">
                  <div className="header-logo">
                    <Link to="/">
                      <img
                        src="//theme.hstatic.net/1000275435/1000883829/14/logo.png"
                        alt="PATO - Kênh thông tin và đặt bàn Nhà hàng"
                      />
                    </Link>
                  </div>
                  <div className="header-search-wrap" ref={searchRef}>
                    <form
                      onSubmit={handleSearch}
                      className="header-search-form"
                    >
                      <div className="search-input-wrap">
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => handleQueryChange(e.target.value)}
                          placeholder="Tìm kiếm nhà hàng phù hợp"
                          autoComplete="off"
                        />
                        <button type="submit" className="search-btn">
                          <svg
                            width="16"
                            viewBox="0 0 53.627 53.627"
                            fill="currentColor"
                          >
                            <path d="M53.627,49.385L37.795,33.553C40.423,30.046,42,25.709,42,21C42,9.42,32.58,0,21,0S0,9.42,0,21s9.42,21,21,21c4.709,0,9.046-1.577,12.553-4.205l15.832,15.832L53.627,49.385z M2,21C2,10.523,10.523,2,21,2s19,8.523,19,19s-8.523,19-19,19S2,31.477,2,21z" />
                          </svg>
                        </button>
                      </div>
                    </form>
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="search-suggestions">
                        {suggestions.map((r) => (
                          <Link
                            key={r.handle}
                            to={`/products/${r.handle}`}
                            className="suggestion-item"
                            onClick={() => {
                              setShowSuggestions(false);
                              setQuery("");
                            }}
                          >
                            <img src={r.thumbnail} alt={r.title} />
                            <div className="suggestion-title">
                              {r.title}
                              {r.status === "Đã hợp tác" && (
                                <span className="star-icon">⭐</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link to="/search" className="ai-search-btn">
                    {AI_ICON}
                    Tìm thông minh
                  </Link>
                </div>
                {/* Right: hotline + auth */}
                <div className="header-right">
                  <a href="tel:19002280" className="hotline-link">
                    <svg width="18" viewBox="0 0 512 512" fill="currentColor">
                      <path d="m256 0c-140.609375 0-256 115.390625-256 256 0 46.40625 12.511719 91.582031 36.238281 131.105469l-36.238281 124.894531 124.894531-36.238281c39.523438 23.726562 84.699219 36.238281 131.105469 36.238281 140.609375 0 256-115.390625 256-256s-115.390625-256-256-256zm160.054688 364.167969-11.910157 11.910156c-16.851562 16.851563-55.605469 15.515625-80.507812 10.707031-82.800781-15.992187-179.335938-109.5625-197.953125-190.59375-9.21875-40.140625-4.128906-75.039062 9.183594-88.355468l11.910156-11.910157c6.574218-6.570312 17.253906-6.5625 23.820312 0l47.648438 47.652344c3.179687 3.179687 4.921875 7.394531 4.921875 11.90625s-1.742188 8.730469-4.921875 11.898437l-11.90625 11.921876c-13.125 13.15625-13.125 34.527343 0 47.652343l78.683594 77.648438c13.164062 13.164062 34.46875 13.179687 47.652343 0l11.910157-11.90625c6.148437-6.183594 17.632812-6.203125 23.832031 0l47.636719 47.636719c6.46875 6.441406 6.714843 17.113281 0 23.832031z" />
                    </svg>
                    Hotline: 1900.2280
                  </a>
                  {!authLoading && (
                    user ? <UserMenu /> : (
                      <Link to="/login" className="header-login-btn">Đăng nhập</Link>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="header-mobile">
          <div className="wrapper">
            <div className="header-mobile-inner">
              <button
                className="hd-btnMenu"
                onClick={() => setMobileNavOpen(true)}
              >
                <svg width="24" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M491.318,235.318H20.682C9.26,235.318,0,244.577,0,256s9.26,20.682,20.682,20.682h470.636c11.423,0,20.682-9.259,20.682-20.682C512,244.578,502.741,235.318,491.318,235.318z" />
                  <path d="M491.318,78.439H20.682C9.26,78.439,0,87.699,0,99.121c0,11.422,9.26,20.682,20.682,20.682h470.636c11.423,0,20.682-9.26,20.682-20.682C512,87.699,502.741,78.439,491.318,78.439z" />
                  <path d="M491.318,392.197H20.682C9.26,392.197,0,401.456,0,412.879s9.26,20.682,20.682,20.682h470.636c11.423,0,20.682-9.259,20.682-20.682S502.741,392.197,491.318,392.197z" />
                </svg>
              </button>
              <div className="hd-logo">
                <Link to="/">
                  <img
                    src="//theme.hstatic.net/1000275435/1000883829/14/logo.png"
                    alt="PATO"
                  />
                </Link>
              </div>
              <button
                className="search-mb-btn"
                onClick={() => setMobileSearchOpen((v) => !v)}
              >
                <svg width="22" viewBox="0 0 53.627 53.627" fill="currentColor">
                  <path d="M53.627,49.385L37.795,33.553C40.423,30.046,42,25.709,42,21C42,9.42,32.58,0,21,0S0,9.42,0,21s9.42,21,21,21c4.709,0,9.046-1.577,12.553-4.205l15.832,15.832L53.627,49.385z M2,21C2,10.523,10.523,2,21,2s19,8.523,19,19s-8.523,19-19,19S2,31.477,2,21z" />
                </svg>
              </button>
            </div>
          </div>
          {mobileSearchOpen && (
            <div className="mobile-search-panel">
              <div className="wrapper">
                <form onSubmit={handleSearch} className="mobile-search-form">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="Tìm kiếm nhà hàng phù hợp"
                    autoFocus
                  />
                  <button type="submit">Tìm</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
