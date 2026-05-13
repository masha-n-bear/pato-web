import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useAuthStore from '../authStore';
import useStore from '../store';
import RestaurantCard from '../components/RestaurantCard';
import './AccountPage.css';

function TabFavorites() {
  const savedHandles = useAuthStore(s => s.savedHandles);
  const restaurants = useStore(s => s.restaurants);
  const loaded = useStore(s => s.loaded);
  const saved = loaded ? restaurants.filter(r => savedHandles.has(r.handle)) : [];

  return (
    <div className="account-tab-content">
      <h3 className="tab-content-title">Nhà hàng đã lưu ({saved.length})</h3>
      {!loaded ? (
        <p className="tab-loading">Đang tải...</p>
      ) : saved.length === 0 ? (
        <div className="tab-empty">
          <div className="tab-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
          <p>Bạn chưa lưu nhà hàng nào.</p>
          <Link to="/" className="tab-explore-btn">Khám phá ngay</Link>
        </div>
      ) : (
        <div className="account-card-grid">
          {saved.map(r => <RestaurantCard key={r.handle} restaurant={r} section="account_saved" />)}
        </div>
      )}
    </div>
  );
}

const STATUS_LABELS = {
  confirmed: { label: 'Đã xác nhận', color: '#27ae60' },
  cancelled: { label: 'Đã hủy', color: '#e74c3c' },
  pending: { label: 'Chờ xác nhận', color: '#f39c12' },
};

function TabBookings() {
  const { bookings, bookingsLoading, loadBookings, cancelBooking } = useAuthStore();
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  async function handleCancel(id) {
    setCancellingId(id);
    await cancelBooking(id);
    setCancellingId(null);
    setConfirmId(null);
  }

  return (
    <div className="account-tab-content">
      <h3 className="tab-content-title">Lịch sử đặt bàn ({bookings.length})</h3>
      {bookingsLoading ? (
        <p className="tab-loading">Đang tải...</p>
      ) : bookings.length === 0 ? (
        <div className="tab-empty">
          <div className="tab-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <p>Bạn chưa có đặt bàn nào.</p>
          <Link to="/" className="tab-explore-btn">Tìm nhà hàng</Link>
        </div>
      ) : (
        <div className="booking-history-list">
          {bookings.map(b => {
            const st = STATUS_LABELS[b.status] || STATUS_LABELS.confirmed;
            const isUpcoming = b.status !== 'cancelled' && b.rawDate >= new Date().toISOString().slice(0, 10);
            return (
              <div key={b.id} className={`booking-history-card${b.status === 'cancelled' ? ' cancelled' : ''}`}>
                {b.restaurantThumbnail && (
                  <div className="bh-thumb">
                    <img src={b.restaurantThumbnail} alt={b.restaurantTitle} />
                  </div>
                )}
                <div className="bh-info">
                  <div className="bh-top">
                    <Link to={`/products/${b.restaurantHandle}`} className="bh-name">{b.restaurantTitle}</Link>
                    <span className="bh-status" style={{ background: st.color }}>{st.label}</span>
                  </div>
                  {b.restaurantAddress && (
                    <div className="bh-address">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:'4px',flexShrink:0}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      {b.restaurantAddress}
                    </div>
                  )}
                  <div className="bh-details">
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'3px',verticalAlign:'middle'}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {b.date}
                    </span>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'3px',verticalAlign:'middle'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {b.time}
                    </span>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'3px',verticalAlign:'middle'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {b.guests} người
                    </span>
                    {b.offer && b.offer !== 'Không có ưu đãi' && (
                      <span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'3px',verticalAlign:'middle'}}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                        {b.offer}
                      </span>
                    )}
                  </div>
                  {b.note && <div className="bh-note">Ghi chú: {b.note}</div>}
                </div>
                <div className="bh-actions">
                  <Link to={`/products/${b.restaurantHandle}`} className="bh-btn-view">Xem nhà hàng</Link>
                  {isUpcoming && b.status !== 'cancelled' && (
                    confirmId === b.id ? (
                      <div className="bh-confirm-row">
                        <span>Xác nhận hủy?</span>
                        <button
                          className="bh-btn-cancel confirm"
                          disabled={cancellingId === b.id}
                          onClick={() => handleCancel(b.id)}
                        >
                          {cancellingId === b.id ? 'Đang hủy...' : 'Hủy đặt bàn'}
                        </button>
                        <button className="bh-btn-cancel back" onClick={() => setConfirmId(null)}>Không</button>
                      </div>
                    ) : (
                      <button className="bh-btn-cancel" onClick={() => setConfirmId(b.id)}>Hủy đặt bàn</button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StarDisplay({ value }) {
  const filled = Math.round(value);
  return (
    <span className="star-display">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className={i < filled ? 'star-filled' : 'star-empty'}>★</span>
      ))}
      <span className="star-num">{value}/10</span>
    </span>
  );
}

function TabReviews() {
  const { reviews, reviewsLoading, loadReviews, deleteReview } = useAuthStore();
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  async function handleDelete(id) {
    setDeletingId(id);
    await deleteReview(id);
    setDeletingId(null);
  }

  return (
    <div className="account-tab-content">
      <h3 className="tab-content-title">Đánh giá của tôi ({reviews.length})</h3>
      {reviewsLoading ? (
        <p className="tab-loading">Đang tải...</p>
      ) : reviews.length === 0 ? (
        <div className="tab-empty">
          <div className="tab-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>
          <p>Bạn chưa có đánh giá nào.</p>
          <p className="tab-hint">Đặt bàn và viết đánh giá để giúp cộng đồng!</p>
        </div>
      ) : (
        <div className="review-history-list">
          {reviews.map(r => (
            <div key={r.id} className="review-history-card">
              <div className="rh-top">
                <Link to={`/products/${r.restaurantHandle}`} className="rh-name">{r.restaurantTitle}</Link>
                <span className="rh-date">
                  {r.submittedAt?.toDate
                    ? new Date(r.submittedAt.toDate()).toLocaleDateString('vi-VN')
                    : 'Gần đây'}
                </span>
              </div>
              <div className="rh-scores">
                <span>Chung: <b>{r.rating}</b></span>
                <span>Đồ ăn: <b>{r.foodRating}</b></span>
                <span>Phục vụ: <b>{r.serviceRating}</b></span>
                <span>Không gian: <b>{r.ambienceRating}</b></span>
              </div>
              <StarDisplay value={r.rating} />
              <p className="rh-text">{r.text}</p>
              <button
                className="rh-delete-btn"
                disabled={deletingId === r.id}
                onClick={() => handleDelete(r.id)}
              >
                {deletingId === r.id ? 'Đang xóa...' : 'Xóa đánh giá'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TAB_ICONS = {
  favorites: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:'5px',verticalAlign:'middle'}}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  bookings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'5px',verticalAlign:'middle'}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  reviews: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'5px',verticalAlign:'middle'}}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
};

const TABS = [
  { key: 'favorites', label: 'Yêu thích' },
  { key: 'bookings', label: 'Đặt bàn' },
  { key: 'reviews', label: 'Đánh giá' },
];

export default function AccountPage() {
  const user = useAuthStore(s => s.user);
  const authLoading = useAuthStore(s => s.authLoading);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'favorites';

  function setTab(tab) {
    setSearchParams({ tab });
  }

  if (authLoading) {
    return <div className="account-loading">Đang tải...</div>;
  }

  if (!user) {
    return (
      <div className="account-unauthenticated">
        <div className="account-unauth-icon"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <h2>Bạn chưa đăng nhập</h2>
        <p>Đăng nhập để xem và quản lý tài khoản của bạn.</p>
        <Link to="/login" className="btn-login-redirect">Đăng nhập ngay</Link>
      </div>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'Tài khoản';

  return (
    <div className="account-page">
      <div className="wrapper">
        {/* Profile header */}
        <div className="account-header">
          <div className="account-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt={displayName} referrerPolicy="no-referrer" />
            ) : (
              <span>{displayName[0].toUpperCase()}</span>
            )}
          </div>
          <div className="account-info">
            <h1 className="account-name">{displayName}</h1>
            <p className="account-email">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="account-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`account-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {TAB_ICONS[t.key]}{t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'favorites' && <TabFavorites />}
        {activeTab === 'bookings' && <TabBookings />}
        {activeTab === 'reviews' && <TabReviews />}
      </div>
    </div>
  );
}
