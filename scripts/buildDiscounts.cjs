const fs = require('fs');
const path = require('path');

const restaurants = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/data/all_restaurants.json'), 'utf8')
);

// ─── Day helpers ────────────────────────────────────────────────────────────

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_ORDER = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

const VI_TO_ENG = {
  'thứ 2': 'Mon', 'thứ hai': 'Mon',
  'thứ 3': 'Tue', 'thứ ba': 'Tue',
  'thứ 4': 'Wed', 'thứ tư': 'Wed',
  'thứ 5': 'Thu', 'thứ năm': 'Thu',
  'thứ 6': 'Fri', 'thứ sáu': 'Fri',
  'thứ 7': 'Sat', 'thứ bảy': 'Sat',
  'chủ nhật': 'Sun',
};

function dayIdx(viKey) {
  const eng = VI_TO_ENG[viKey.toLowerCase().trim()];
  return eng !== undefined ? DAY_ORDER[eng] : -1;
}

function parseDays(text) {
  const low = text.toLowerCase();

  if (low.includes('tất cả các ngày')) return ALL_DAYS;

  // range: "thứ X đến thứ Y" or "thứ X đến chủ nhật"
  const range = low.match(/thứ\s*(\d)\s*(?:đến|tới)\s*(?:thứ\s*(\d)|chủ nhật)/);
  if (range) {
    const startKey = `thứ ${range[1]}`;
    const endKey   = range[2] ? `thứ ${range[2]}` : 'chủ nhật';
    const s = dayIdx(startKey);
    const e = dayIdx(endKey);
    if (s !== -1 && e !== -1) return ALL_DAYS.slice(s, e + 1);
  }

  // single days scattered in text
  const found = new Set();
  for (const [vi, eng] of Object.entries(VI_TO_ENG)) {
    if (low.includes(vi)) found.add(eng);
  }
  if (found.size > 0) return ALL_DAYS.filter(d => found.has(d));

  return null;
}

// ─── Field parsers ───────────────────────────────────────────────────────────

function clean(text) {
  return (text || '').replace(/\*\*/g, '');
}

function parsePercentage(text) {
  const t = clean(text);
  const m = t.match(/giảm\s*(?:ngay\s*)?0*(\d+)\s*%/i) || t.match(/0*(\d+)\s*%/);
  return m ? parseInt(m[1], 10) : null;
}

function parseHours(text) {
  const t = clean(text);
  const matches = [...t.matchAll(/(\d{1,2}[h:]\d{2})\s*[-–]\s*(\d{1,2}[h:]\d{2})/g)];
  if (!matches.length) return null;
  return matches.map(m => {
    const norm = s => s.replace('h', ':').replace(/^(\d):/, '0$1:');
    return `${norm(m[1])}-${norm(m[2])}`;
  });
}

function parseGuestCount(text) {
  const t = clean(text);

  // "từ X đến Y người/khách"
  const range = t.match(/từ\s*(\d+)\s*(?:đến|tới)\s*(\d+)\s*(?:người|khách)/i);
  if (range) return { min: parseInt(range[1], 10), max: parseInt(range[2], 10) };

  // "từ X người/khách trở lên" or "nhóm (từ) X"
  const minMatch =
    t.match(/(?:từ|nhóm\s+từ|nhóm)\s*(\d+)\s*(?:người|khách)/i) ||
    t.match(/(\d+)\s*(?:người|khách)\s*trở\s*lên/i);
  if (minMatch) return { min: parseInt(minMatch[1], 10), max: 999 };

  return null;
}

function parseDiscountId(title) {
  const m = clean(title).match(/ƯU ĐÃI\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

// ─── Skip non-discount promo titles ─────────────────────────────────────────

const SKIP = ['ĐẶT BÀN ĐỂ GIỮ CHỖ', 'ĐẶT GIAO HÀNG NGAY', 'ĐẶT ĐỂ GIỮ CHỖ'];

// ─── Main parser ─────────────────────────────────────────────────────────────

function parseRestaurant(restaurant) {
  const time_rules     = [];
  const guest_count_rules = [];

  for (const promo of restaurant.promotions) {
    const title    = clean(promo.title || '').trim();
    const desc     = clean(promo.description || '');
    const fullText = `${title} ${desc}`;

    if (SKIP.some(s => title.includes(s))) continue;

    const discountId = parseDiscountId(title);
    const pct        = parsePercentage(fullText);
    const days       = parseDays(fullText);
    const hours      = parseHours(desc);
    const guests     = parseGuestCount(fullText);

    if (guests) {
      // Group-size based rule
      const rule = {
        min: guests.min,
        max: guests.max,
        ...(discountId !== null && { discount_id: discountId }),
        ...(pct        !== null && { percentage: pct }),
        discount_description: title,
      };
      guest_count_rules.push(rule);
    } else if (pct !== null) {
      // Time-based rule (specific days or all days)
      const rule = {
        date: days || ALL_DAYS,
        ...(hours && { hours }),
        percentage: pct,
      };
      time_rules.push(rule);
    }
    // Skip promos with no percentage and no guest count (pure gift/text)
  }

  if (time_rules.length === 0 && guest_count_rules.length === 0) return null;

  const entry = { handle: restaurant.handle };
  if (time_rules.length)       entry.time_rules       = time_rules;
  if (guest_count_rules.length) entry.guest_count_rules = guest_count_rules;
  return entry;
}

// ─── Run & write ─────────────────────────────────────────────────────────────

const existing = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/data/discounts.json'), 'utf8')
);

// Keep manually-curated entries (the sample), replace the rest
const manualHandles = new Set(['mor-fai-tttm-vincom-plaza-ngo-quyen']);
const manual = existing.filter(e => manualHandles.has(e.handle));

const withPromos = restaurants.filter(r => r.promotions && r.promotions.length > 0);
const parsed     = withPromos
  .filter(r => !manualHandles.has(r.handle))
  .map(parseRestaurant)
  .filter(Boolean);

const result = [...manual, ...parsed];

fs.writeFileSync(
  path.join(__dirname, '../public/data/discounts.json'),
  JSON.stringify(result, null, 4),
  'utf8'
);

console.log(`Manual entries kept : ${manual.length}`);
console.log(`Parsed entries added: ${parsed.length}`);
console.log(`Total in discounts  : ${result.length}`);
