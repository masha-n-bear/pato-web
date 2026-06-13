import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import posthog from 'posthog-js';
import useAuthStore from '../authStore';
import { generateTimeSlots, isDateOpen, getSlotDiscount, getCalendarDates } from '../utils/bookingUtils';
import './BookingWidget.css';

function formatGuestReq(rule) {
  if (rule.max >= 999) return `Từ ${rule.min} người trở lên`;
  return `Từ ${rule.min}–${rule.max} người`;
}

function shortTitle(desc) {
  // "ƯU ĐÃI 1: GIẢM NGAY 30% (Áp dụng ...)" → "ƯU ĐÃI 1: GIẢM NGAY 30%"
  return (desc || '').replace(/\s*\(.*$/, '').trim();
}

const GOOGLE_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzNPX30oeXZABNv3Q04xciy-HegV4gJp3Ie14ynkNFLbaheGY_MXADADallmqLPOn1oTQ/exec';

const MONTH_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const DAY_SHORT = ['CN','T2','T3','T4','T5','T6','T7'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

export default function BookingWidget({ restaurant }) {
  const user = useAuthStore(s => s.user);
  const addBooking = useAuthStore(s => s.addBooking);

  const today = new Date().toISOString().slice(0, 10);
  const allDates = useMemo(() => getCalendarDates(30), []);

  const [calendarBase, setCalendarBase] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [step, setStep] = useState('calendar'); // calendar | form | success
  const [form, setForm] = useState({ name: user?.displayName || '', phone: '', note: '' });
  const [status, setStatus] = useState('idle');
  const [booking, setBooking] = useState(null);

  const [discounts, setDiscounts] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/discounts.json`)
      .then(res => res.json())
      .then(setDiscounts)
      .catch(() => {});
  }, []);

  const discountRule = discounts.find(d => d.handle === restaurant.handle);
  const matchingGuestRules = discountRule?.guest_count_rules?.filter(
    rule => guests >= rule.min && guests <= rule.max
  ) ?? null;

  const timeSlots = useMemo(
    () => selectedDate ? generateTimeSlots(restaurant.opening_hours, selectedDate) : [],
    [restaurant.opening_hours, selectedDate],
  );

  // Build calendar grid for current month view
  const calendarDays = useMemo(() => {
    const { year, month } = calendarBase;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = [];
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      grid.push(dateStr);
    }
    return grid;
  }, [calendarBase]);

  function prevMonth() {
    setCalendarBase(b => {
      const m = b.month === 0 ? 11 : b.month - 1;
      const y = b.month === 0 ? b.year - 1 : b.year;
      return { year: y, month: m };
    });
  }
  function nextMonth() {
    setCalendarBase(b => {
      const m = b.month === 11 ? 0 : b.month + 1;
      const y = b.month === 11 ? b.year + 1 : b.year;
      return { year: y, month: m };
    });
  }

  function selectDate(dateStr) {
    if (!dateStr) return;
    if (dateStr < today) return;
    if (!isDateOpen(restaurant.opening_hours, dateStr)) return;
    setSelectedDate(dateStr);
    setSelectedTime('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');

    const payload = {
      restaurant: restaurant.title,
      address: restaurant.address ?? '',
      name: form.name,
      phone: form.phone,
      date: formatDate(selectedDate),
      time: selectedTime,
      adults: `${guests} người`,
      children: '0',
      offer: '',
      note: form.note,
      submittedAt: new Date().toISOString(),
    };

    try {
      await fetch(GOOGLE_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const bookingData = {
        restaurantHandle: restaurant.handle,
        restaurantTitle: restaurant.title,
        restaurantAddress: restaurant.address ?? '',
        restaurantThumbnail: restaurant.thumbnail ?? '',
        date: formatDate(selectedDate),
        rawDate: selectedDate,
        time: selectedTime,
        guests,
        offer: 'Không có ưu đãi',
        note: form.note,
        name: form.name,
        phone: form.phone,
      };

      if (user) await addBooking(bookingData);

      setBooking({ ...payload, ...bookingData });
      setStatus('success');
      setStep('success');

      posthog.capture('booking_submitted', {
        restaurant_handle: restaurant.handle,
        date: selectedDate,
        time: selectedTime,
        guests,
      });
    } catch {
      setStatus('error');
    }
  }

  if (step === 'success' && booking) {
    return (
      <div className="bw-success">
        <div className="bw-success-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="28" fill="#27ae60"/>
            <path d="M16 28L24 36L40 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="bw-success-heading">XÁC NHẬN ĐẶT BÀN THÀNH CÔNG</h3>
        <p>PATO sẽ gọi xác nhận tới <strong>{booking.phone}</strong> trong 10 phút.</p>
        <div className="bw-success-details">
          <div className="bw-detail-row"><span>Nhà hàng</span><strong>{booking.restaurantTitle}</strong></div>
          <div className="bw-detail-row"><span>Địa chỉ</span><strong>{booking.restaurantAddress}</strong></div>
          <div className="bw-detail-row"><span>Ngày</span><strong>{booking.date}</strong></div>
          <div className="bw-detail-row"><span>Giờ</span><strong>{booking.time}</strong></div>
          <div className="bw-detail-row"><span>Số khách</span><strong>{booking.guests} người</strong></div>
          <div className="bw-detail-row"><span>Ưu đãi</span><strong>{booking.offer}</strong></div>
          {booking.note && <div className="bw-detail-row"><span>Ghi chú</span><strong>{booking.note}</strong></div>}
        </div>
        <p className="bw-success-note">PATO sẽ gọi điện tới SĐT <strong>{booking.phone}</strong> để xác nhận trong vòng 10 phút tới! Vui lòng giữ liên lạc.</p>
        {user && (
          <Link className="bw-view-bookings" to="/account?tab=bookings">Xem lịch sử đặt bàn →</Link>
        )}
      </div>
    );
  }

  return (
    <div className="booking-widget">
      {/* Progress indicator */}
      <div className="bw-steps">
        <span className={step === 'calendar' ? 'bw-step active' : 'bw-step done'}>1. Chọn ngày & giờ</span>
        <span className="bw-step-sep">›</span>
        <span className={step === 'form' ? 'bw-step active' : step === 'success' ? 'bw-step done' : 'bw-step'}>2. Thông tin</span>
      </div>

      {step === 'calendar' && (
        <>
          {/* Calendar */}
          <div className="bw-calendar">
            <div className="bw-cal-nav">
              <button onClick={prevMonth}>‹</button>
              <span>{MONTH_VI[calendarBase.month]} {calendarBase.year}</span>
              <button onClick={nextMonth}>›</button>
            </div>
            <div className="bw-cal-grid">
              {DAY_SHORT.map(d => <div key={d} className="bw-cal-day-header">{d}</div>)}
              {calendarDays.map((dateStr, i) => {
                if (!dateStr) return <div key={`empty-${i}`} />;
                const isPast = dateStr < today;
                const isOpen = !isPast && isDateOpen(restaurant.opening_hours, dateStr);
                let discountBadge = null;
                if (isOpen) {
                  if (discountRule?.time_rules) {
                    const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const dayAbbr = DAY_ABBR[new Date(dateStr + 'T00:00:00').getDay()];
                    const rule = discountRule.time_rules.find(r => r.date.includes(dayAbbr));
                    if (rule) discountBadge = `-${rule.percentage}%`;
                  } else if (restaurant.discount) {
                    const m = (restaurant.discount_details || '').match(/^Giảm\s+(\d+)%$/i);
                    if (m) discountBadge = `-${m[1]}%`;
                  }
                }
                const isSelected = dateStr === selectedDate;
                return (
                  <div
                    key={dateStr}
                    className={[
                      'bw-cal-day',
                      isPast ? 'past' : '',
                      isOpen ? 'open' : 'closed',
                      isSelected ? 'selected' : '',
                    ].join(' ')}
                    onClick={() => selectDate(dateStr)}
                  >
                    <span>{new Date(dateStr + 'T00:00:00').getDate()}</span>
                    {discountBadge && <div className="bw-discount-badge">{discountBadge}</div>}
                  </div>
                );
              })}
            </div>
            <div className="bw-cal-legend">
              <span><i className="legend-dot open" /> Còn chỗ</span>
              <span><i className="legend-dot closed" /> Đóng cửa</span>
              <span><i className="legend-dot discount" /> Có ưu đãi</span>
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div className="bw-time-section">
              <div className="bw-section-label">Chọn giờ — {formatDate(selectedDate)}</div>
              {timeSlots.length === 0 ? (
                <p className="bw-no-slots">Nhà hàng đóng cửa vào ngày này.</p>
              ) : (
                <div className="bw-time-grid">
                  {timeSlots.map(t => {
                    const disc = getSlotDiscount(restaurant, selectedDate, t, discountRule);
                    return (
                      <button
                        key={t}
                        className={`bw-time-slot${selectedTime === t ? ' selected' : ''}${disc ? ' has-disc' : ''}`}
                        onClick={() => setSelectedTime(t)}
                      >
                        <span>{t}</span>
                        {disc && <span className="slot-disc">{disc}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Guest count */}
          <div className="bw-guests-section">
            <div className="bw-section-label">Số khách</div>
            <div className="bw-guests-row">
              <button onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
              <span>{guests} người</span>
              <button onClick={() => setGuests(g => Math.min(100, g + 1))}>+</button>
            </div>
          </div>


          {discountRule?.guest_count_rules
            ? matchingGuestRules.length > 0
              ? (
                  <div className="bw-urgency">
                    {matchingGuestRules.map((rule, i) => (
                      <div key={i}>{rule.discount_description}</div>
                    ))}
                  </div>
                )
              : (
                  <div className="bw-no-discount">
                    <div className="bw-no-discount-title">
                      Nhóm {guests} người chưa đủ điều kiện nhận ưu đãi theo số khách.
                    </div>
                    <div className="bw-no-discount-label">Ưu đãi có sẵn:</div>
                    {discountRule.guest_count_rules.map((rule, i) => (
                      <div key={i} className="bw-no-discount-row">
                        <span className="bw-no-discount-req">{formatGuestReq(rule)}</span>
                        {' — '}{shortTitle(rule.discount_description)}
                      </div>
                    ))}
                  </div>
                )
            : <div className="bw-urgency">Đặt ngay để giữ chỗ!</div>
          }

          <button
            className="bw-next-btn"
            disabled={!selectedDate || !selectedTime}
            onClick={() => setStep('form')}
          >
            Tiếp tục →
          </button>
        </>
      )}

      {step === 'form' && (
        <form className="bw-form" onSubmit={handleSubmit}>
          <button type="button" className="bw-back-btn" onClick={() => setStep('calendar')}>
            ← Quay lại
          </button>
          <div className="bw-summary">
            <div className="bw-sum-row"><span>Ngày</span><strong>{formatDate(selectedDate)}</strong></div>
            <div className="bw-sum-row"><span>Giờ</span><strong>{selectedTime}</strong></div>
            <div className="bw-sum-row"><span>Số khách</span><strong>{guests} người</strong></div>
          </div>

          <input
            className="bw-input"
            type="text"
            placeholder="Họ và tên *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="bw-input"
            type="tel"
            placeholder="Số điện thoại *"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            required
          />
          <textarea
            className="bw-input bw-textarea"
            placeholder="Ghi chú (yêu cầu đặc biệt...)"
            rows={3}
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          />

          {status === 'error' && (
            <p className="bw-error">Có lỗi xảy ra. Vui lòng thử lại hoặc gọi <a href="tel:19002280">1900.2280</a>.</p>
          )}

          <button className="bw-submit-btn" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Đang đặt...' : 'Xác nhận đặt bàn'}
          </button>
          <p className="bw-footer-note">Hoặc gọi: <a href="tel:19002280">1900.2280</a> để được tư vấn.</p>
        </form>
      )}
    </div>
  );
}
