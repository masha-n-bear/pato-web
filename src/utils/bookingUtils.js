const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export function getOpeningHoursForDate(openingHours, dateStr) {
  if (!openingHours || !dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  const dayName = DAY_NAMES[d.getDay()];
  return openingHours[dayName] || null;
}

export function isDateOpen(openingHours, dateStr) {
  const h = getOpeningHoursForDate(openingHours, dateStr);
  if (!h) return false;
  const lower = h.toLowerCase();
  return !lower.includes('đóng') && !lower.includes('closed') && !lower.includes('không hoạt động');
}

function parseTimeRange(rangeStr) {
  // Normalize various dash/space formats to a consistent "HH:MM - HH:MM"
  const normalized = rangeStr.trim().replace(/\s*[–—]\s*/g, ' - ').replace(/\s*-\s*/g, ' - ');
  const parts = normalized.split(' - ');
  if (parts.length < 2) return [];

  const parseTime = str => {
    const clean = str.trim();
    const [h, m] = clean.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const openMinutes = parseTime(parts[0]);
  let closeMinutes = parseTime(parts[1]);
  if (closeMinutes <= openMinutes) closeMinutes += 24 * 60;

  const slots = [];
  for (let m = openMinutes; m < closeMinutes - 15; m += 15) {
    const h = Math.floor(m / 60) % 24;
    const min = m % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }
  return slots;
}

export function generateTimeSlots(openingHours, dateStr) {
  const hoursStr = getOpeningHoursForDate(openingHours, dateStr);
  if (!hoursStr) return [];
  const lower = hoursStr.toLowerCase();
  if (lower.includes('đóng') || lower.includes('closed') || lower.includes('không hoạt động')) return [];

  // Handle multi-session (e.g. "10:00-14:00 & 17:30-22:00" or fixed slots "12:00 & 18:00 & 20:00")
  const sessions = hoursStr.includes('&') ? hoursStr.split('&').map(s => s.trim()) : [hoursStr];
  const allSlots = [];
  const seen = new Set();
  for (const session of sessions) {
    // Standalone time (e.g. "12:00") — treat as a fixed booking slot, not a range
    if (/^\d{1,2}:\d{2}$/.test(session)) {
      const [h, m] = session.split(':').map(Number);
      const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      if (!seen.has(slot)) { seen.add(slot); allSlots.push(slot); }
    } else {
      for (const slot of parseTimeRange(session)) {
        if (!seen.has(slot)) { seen.add(slot); allSlots.push(slot); }
      }
    }
  }
  return allSlots;
}

function timeInRange(timeStr, rangeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const slot = h * 60 + m;
  const parts = rangeStr.split('-');
  const [sh, sm] = parts[0].split(':').map(Number);
  const [eh, em] = parts[1].split(':').map(Number);
  return slot >= sh * 60 + sm && slot < eh * 60 + em;
}

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Returns the discount label for a given time slot, or null if none
export function getSlotDiscount(restaurant, dateStr, timeStr, discountRule) {
  if (discountRule?.time_rules) {
    const dayAbbr = DAY_ABBR[new Date(dateStr + 'T00:00:00').getDay()];
    const rule = discountRule.time_rules.find(r =>
      r.date.includes(dayAbbr) && (!r.hours || r.hours.some(h => timeInRange(timeStr, h)))
    );
    return rule ? `-${rule.percentage}%` : null;
  }
  // Fallback for restaurants not in discounts.json
  if (!restaurant.discount || !restaurant.discount_details) return null;
  const [h] = timeStr.split(':').map(Number);
  if (h >= 10 && h < 15) return restaurant.discount_details;
  return null;
}

// Generate dates for the mini-calendar (next N days starting from today)
export function getCalendarDates(n = 30) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}
