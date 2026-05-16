function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function bookedTodayCount(handle) {
  const today = new Date().toISOString().slice(0, 10);
  const base = (simpleHash(handle + today) % 36) + 5; // 5–40
  const noise = Math.floor(Math.random() * 7) - 3;    // ±3
  return Math.max(1, base + noise);
}

export function getRestaurantRating(handle) {
  const raw = simpleHash(handle + 'rating_v1') % 25; // 0–24
  return parseFloat((7.5 + raw / 10).toFixed(1));    // 7.5–9.9
}

export function getReviewCount(handle) {
  return (simpleHash(handle + 'reviews_v1') % 180) + 20; // 20–199
}
