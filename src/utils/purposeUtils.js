export const PURPOSE_OPTIONS = [
  'Tiệc công ty',
  'Ăn gia đình',
  'Hẹn hò',
  'Tiếp khách',
  'Tiệc ngoài trời',
  'Sinh nhật',
];

const PURPOSE_KEYWORDS = {
  'Tiệc công ty': ['công ty', 'doanh nghiệp', 'hội nghị', 'team building', 'liên hoan', 'đội nhóm', 'corporate', 'tổ chức sự kiện', 'hội thảo', 'hội họp'],
  'Ăn gia đình': ['gia đình', 'family', 'trẻ em', 'sum họp', 'họp mặt', 'đại gia đình', 'cho bé', 'khu vui chơi'],
  'Hẹn hò': ['hẹn hò', 'lãng mạn', 'romantic', 'cặp đôi', 'tình nhân', 'riêng tư', 'view đẹp', 'không gian yên tĩnh', 'intimate'],
  'Tiếp khách': ['tiếp khách', 'đối tác', 'khách hàng', 'vip', 'sang trọng', 'cao cấp', 'doanh nhân', 'thương nhân', 'quý khách'],
  'Tiệc ngoài trời': [],
  'Sinh nhật': ['sinh nhật', 'birthday', 'kỷ niệm', 'tiệc mừng', 'tổ chức sinh nhật', 'mừng ngày'],
};

export function getPurposeTags(restaurant) {
  const text = [
    restaurant.description || '',
    restaurant.title || '',
    (restaurant.tags || []).join(' '),
    (restaurant.cuisine_all || []).join(' '),
  ].join(' ').toLowerCase();

  let amenities = {};
  try { amenities = JSON.parse(restaurant.amenities || '{}'); } catch { /* ignore */ }

  const tags = new Set();

  Object.entries(PURPOSE_KEYWORDS).forEach(([purpose, keywords]) => {
    if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
      tags.add(purpose);
    }
  });

  // Amenity-based inference
  if (amenities['Trang trí sự kiện']) {
    tags.add('Sinh nhật');
    tags.add('Tiệc công ty');
  }
  if (amenities['Bàn ngoài trời']) {
    tags.add('Tiệc ngoài trời');
  }
  if (amenities['Khu vui chơi trẻ em']) {
    tags.add('Ăn gia đình');
  }
  if (amenities['Phòng riêng']) {
    tags.add('Hẹn hò');
    tags.add('Tiếp khách');
  }
  if (amenities['Màn chiếu']) {
    tags.add('Tiệc công ty');
  }
  if (amenities['Karaoke']) {
    tags.add('Tiệc công ty');
    tags.add('Sinh nhật');
  }

  // Default fallback so every restaurant appears in at least one category
  if (tags.size === 0) {
    tags.add('Ăn gia đình');
  }

  return Array.from(tags);
}
