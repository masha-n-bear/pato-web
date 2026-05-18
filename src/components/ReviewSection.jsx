import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import useAuthStore from '../authStore';
import { getRestaurantRating, getReviewCount } from '../utils/hashUtils';
import { REVIEW_POOL } from '../data/mockReviewPool';
import './ReviewSection.css';

function seededRandInt(seed, min, max) {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = (((h << 5) + h) + seed.charCodeAt(i)) | 0;
  return min + (Math.abs(h) % (max - min + 1));
}

function selectMockReviews(handle) {
  const count = seededRandInt(handle + 'cnt_v2', 0, 10);
  if (count === 0) return [];
  const usedIdx = new Set();
  const usedNames = new Set();
  const result = [];
  for (let i = 0; i < count * 5 && result.length < count; i++) {
    const idx = seededRandInt(handle + 'pick_v2_' + i, 0, REVIEW_POOL.length - 1);
    const review = REVIEW_POOL[idx];
    if (!usedIdx.has(idx) && !usedNames.has(review.userName)) {
      usedIdx.add(idx);
      usedNames.add(review.userName);
      result.push({ ...review, id: `pool-${idx}-${handle}`, isMock: true });
    }
  }
  return result;
}

function StarBar({ value }) {
  const pct = (value / 10) * 100;
  return (
    <div className="star-bar">
      <div className="star-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function RatingBadge({ value }) {
  const color = value >= 9 ? '#2ecc71' : value >= 8 ? '#27ae60' : value >= 7 ? '#f39c12' : '#e74c3c';
  return (
    <span className="rating-badge" style={{ background: color }}>
      {value.toFixed(1)}
    </span>
  );
}

function getRatingLabel(v) {
  if (v >= 9.5) return 'Xuất sắc';
  if (v >= 9) return 'Tuyệt vời';
  if (v >= 8.5) return 'Rất tốt';
  if (v >= 8) return 'Tốt';
  if (v >= 7) return 'Khá tốt';
  return 'Tạm được';
}

export default function ReviewSection({ restaurant }) {
  const { handle } = restaurant;
  const user = useAuthStore(s => s.user);
  const addReview = useAuthStore(s => s.addReview);

  const [realReviews, setRealReviews] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [helpfulSet, setHelpfulSet] = useState(new Set());
  const [moreOpenId, setMoreOpenId] = useState(null);
  const [form, setForm] = useState({
    rating: 8, foodRating: 8, serviceRating: 8, ambienceRating: 8, text: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const overallRating = getRestaurantRating(handle);
  const totalCount = getReviewCount(handle);
  const mockReviews = selectMockReviews(handle);

  // Avg category scores (mock-based)
  const avgFood = parseFloat((mockReviews.reduce((s, r) => s + r.foodRating, 0) / mockReviews.length).toFixed(1));
  const avgService = parseFloat((mockReviews.reduce((s, r) => s + r.serviceRating, 0) / mockReviews.length).toFixed(1));
  const avgAmbience = parseFloat((mockReviews.reduce((s, r) => s + r.ambienceRating, 0) / mockReviews.length).toFixed(1));

  useEffect(() => {
    async function fetchReviews() {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('restaurantHandle', '==', handle),
          orderBy('submittedAt', 'desc'),
        );
        const snap = await getDocs(q);
        setRealReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setFetchError(false);
      } catch {
        setFetchError(true);
      }
    }
    fetchReviews();
  }, [handle]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.text.trim()) return;
    setSubmitting(true);
    const ok = await addReview({
      restaurantHandle: handle,
      restaurantTitle: restaurant.title,
      ...form,
    });
    if (ok) {
      // Optimistic: show the new review immediately before re-fetch
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        ...form,
        restaurantHandle: handle,
        restaurantTitle: restaurant.title,
        userName: user.displayName || user.email?.split('@')[0] || 'Khách',
        userPhoto: user.photoURL || null,
        submittedAt: { toDate: () => new Date() },
        isMock: false,
      };
      setRealReviews(prev => [optimistic, ...prev]);
      setShowForm(false);
      setForm({ rating: 8, foodRating: 8, serviceRating: 8, ambienceRating: 8, text: '' });
      // Re-fetch to replace optimistic entry with real Firestore data
      try {
        const q = query(collection(db, 'reviews'), where('restaurantHandle', '==', handle), orderBy('submittedAt', 'desc'));
        const snap = await getDocs(q);
        setRealReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setFetchError(false);
      } catch {
        // optimistic entry stays visible; real data will load on next page visit
      }
    }
    setSubmitting(false);
  }

  const allReviews = [
    ...realReviews.map(r => ({ ...r, isMock: false })),
    ...mockReviews,
  ];

  return (
    <div className="review-section">
      <h2 className="review-section-title">Đánh giá từ thực khách</h2>

      {/* Overall score */}
      <div className="review-overview">
        <div className="review-score-block">
          <RatingBadge value={overallRating} />
          <div className="review-score-label">
            <span className="review-label-text">{getRatingLabel(overallRating)}</span>
            <span className="review-count">{totalCount} đánh giá</span>
          </div>
        </div>

        <div className="review-categories">
          <div className="review-cat-row">
            <span>Đồ ăn</span>
            <StarBar value={avgFood} />
            <span className="review-cat-score">{avgFood}</span>
          </div>
          <div className="review-cat-row">
            <span>Phục vụ</span>
            <StarBar value={avgService} />
            <span className="review-cat-score">{avgService}</span>
          </div>
          <div className="review-cat-row">
            <span>Không gian</span>
            <StarBar value={avgAmbience} />
            <span className="review-cat-score">{avgAmbience}</span>
          </div>
        </div>
      </div>

      {/* Write review CTA */}
      <div className="review-cta-row">
        {user ? (
          <button className="btn-write-review" onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Hủy' : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'5px',verticalAlign:'middle'}}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Viết đánh giá
              </>
            )}
          </button>
        ) : (
          <p className="review-login-hint">
            <a href="#/login">Đăng nhập</a> để viết đánh giá
          </p>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-row">
            {[
              { label: 'Đánh giá chung', key: 'rating' },
              { label: 'Đồ ăn', key: 'foodRating' },
              { label: 'Phục vụ', key: 'serviceRating' },
              { label: 'Không gian', key: 'ambienceRating' },
            ].map(({ label, key }) => (
              <div key={key} className="review-form-score">
                <label>{label}</label>
                <div className="score-input-row">
                  <input
                    type="range" min="1" max="10" step="0.5"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) }))}
                  />
                  <span>{form[key]}</span>
                </div>
              </div>
            ))}
          </div>
          <textarea
            className="review-form-text"
            placeholder="Chia sẻ trải nghiệm của bạn tại nhà hàng này..."
            rows={4}
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            required
          />
          <button className="btn-submit-review" type="submit" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      {/* Review list */}
      {fetchError && (
        <p className="review-fetch-error">Không thể tải đánh giá thực. Hệ thống đang được cập nhật, vui lòng thử lại sau.</p>
      )}
      <div className="review-list">
        {allReviews.slice(0, 6).map((rev, i) => {
          const timeLabel = rev.isMock
            ? `${rev.daysAgo} ngày trước`
            : rev.submittedAt?.toDate
              ? new Date(rev.submittedAt.toDate()).toLocaleDateString('vi-VN')
              : 'Gần đây';
          const isHelpful = helpfulSet.has(rev.id);
          return (
            <div key={rev.id || i} className="review-card">
              <div className="review-card-header">
                <div className="review-avatar">
                  {rev.userPhoto ? (
                    <img src={rev.userPhoto} alt={rev.userName} referrerPolicy="no-referrer" />
                  ) : (
                    <span>{(rev.avatar || rev.userName?.[0] || '?').toUpperCase()}</span>
                  )}
                </div>
                <div className="review-card-meta">
                  <strong>{rev.userName}</strong>
                  <span className="review-time">{timeLabel}</span>
                </div>
                <RatingBadge value={rev.rating} />
                <div className="review-more-wrap">
                  <button
                    className="review-more-btn"
                    onClick={() => setMoreOpenId(moreOpenId === rev.id ? null : rev.id)}
                    aria-label="Thêm"
                  >⋯</button>
                  {moreOpenId === rev.id && (
                    <div className="review-more-menu">
                      <button onClick={() => setMoreOpenId(null)}>Báo cáo</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="review-cat-mini">
                <span>Đồ ăn: <b>{rev.foodRating}</b></span>
                <span>Phục vụ: <b>{rev.serviceRating}</b></span>
                <span>Không gian: <b>{rev.ambienceRating}</b></span>
              </div>

              <p className="review-text">{rev.text}</p>

              <div className="review-actions">
                <button
                  className={`btn-helpful${isHelpful ? ' active' : ''}`}
                  onClick={() => {
                    setHelpfulSet(s => {
                      const next = new Set(s);
                      if (next.has(rev.id)) next.delete(rev.id);
                      else next.add(rev.id);
                      return next;
                    });
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:'4px',verticalAlign:'middle'}}><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                  Hữu ích ({(rev.helpful || 0) + (isHelpful ? 1 : 0)})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
