import { GoogleGenerativeAI } from "@google/generative-ai";

const CUISINE_OPTIONS = [
  "Nướng",
  "Món Nga",
  "Món Âu",
  "Món Singapore",
  "Đặc Sản",
  "Món Hàn",
  "Hải Sản",
  "Món Việt",
  "Món Tây Ban Nha",
  "Lẩu-Nướng",
  "Món Việt - Miền Nam",
  "Món Việt - Miền Trung",
  "Quán nhậu",
  "Món Việt - Miền Bắc",
  "Món Ý",
  "Món Thái",
  "Món Trung",
  "Món chay",
  "Món Ấn Độ",
  "Món Nhật",
  "Lẩu",
  "Món Pháp",
  "Món Lào",
  "Món Á",
];

const PURPOSE_OPTIONS = [
  "Tiệc công ty",
  "Ăn gia đình",
  "Hẹn hò",
  "Tiếp khách",
  "Tiệc ngoài trời",
  "Sinh nhật",
];

const AMENITY_OPTIONS = [
  "Chỗ đỗ xe",
  "Wifi",
  "Phòng riêng",
  "Thanh toán thẻ",
  "Có xuất hóa đơn",
  "Trang trí sự kiện",
  "Karaoke",
  "Bàn ngoài trời",
  "Màn chiếu",
  "Khu vui chơi trẻ em",
  "Chỗ hút thuốc",
  "Nhận giao hàng",
];

const SERVICE_OPTIONS = ["Gọi món", "Buffet và Gọi món", "Buffet"];

function buildPrompt(query, provinces) {
  return `Bạn là trợ lý tìm kiếm nhà hàng. Hãy chuyển câu truy vấn của người dùng thành các bộ lọc JSON.

Các giá trị hợp lệ:
- cuisine (mảng, chọn từ danh sách): ${CUISINE_OPTIONS.join(", ")}
- service (mảng, chọn từ danh sách): ${SERVICE_OPTIONS.join(", ")}
- price (mảng số dạng chuỗi): "1"(dưới 200k), "2"(200-300k), "3"(300-400k), "4"(400-500k), "5"(trên 500k)
- purpose (mảng, chọn từ danh sách): ${PURPOSE_OPTIONS.join(", ")}
- amenity (mảng, chọn từ danh sách): ${AMENITY_OPTIONS.join(", ")}
- province (chuỗi, chọn từ danh sách): ${provinces.join(", ")}
- district (chuỗi): tên quận/huyện cụ thể trong tỉnh đã chọn
- keywords (mảng chuỗi): tên món ăn, nguyên liệu, hoặc từ khóa cụ thể cần tìm trong tên/mô tả nhà hàng. Tách thành các cụm ngắn nhất có nghĩa (2-3 từ). Ví dụ: ["lợn rừng"], ["dê núi"], ["bún bò Huế"], ["hải sản tươi sống"]. KHÔNG đưa vào các từ chung như "nhà hàng", "quán", "có", "ăn", "món".

Quy tắc:
- Chỉ trả về JSON thuần túy, không có markdown, không giải thích
- Chỉ thêm trường nếu câu truy vấn đề cập đến (bỏ qua trường không liên quan)
- Dùng đúng giá trị từ danh sách, không tự bịa
- cuisine chỉ được đặt khi người dùng nói rõ thể loại ẩm thực ("đồ Nhật", "Món Việt"...), KHÔNG suy diễn từ tên món ăn hay nguyên liệu cụ thể
- Ví dụ: {"cuisine":["Món Việt"],"purpose":["Ăn gia đình"],"province":"Hà Nội","keywords":["lợn rừng"]}

Câu truy vấn: "${query}"`;
}

function validate(raw, provinces) {
  const result = {};

  if (Array.isArray(raw.cuisine)) {
    const valid = raw.cuisine.filter((v) => CUISINE_OPTIONS.includes(v));
    if (valid.length) result.cuisine = valid;
  }
  if (Array.isArray(raw.service)) {
    const valid = raw.service.filter((v) => SERVICE_OPTIONS.includes(v));
    if (valid.length) result.service = valid;
  }
  if (Array.isArray(raw.price)) {
    const valid = raw.price
      .map(String)
      .filter((v) => ["1", "2", "3", "4", "5"].includes(v));
    if (valid.length) result.price = valid;
  }
  if (Array.isArray(raw.purpose)) {
    const valid = raw.purpose.filter((v) => PURPOSE_OPTIONS.includes(v));
    if (valid.length) result.purpose = valid;
  }
  if (Array.isArray(raw.amenity)) {
    const valid = raw.amenity.filter((v) => AMENITY_OPTIONS.includes(v));
    if (valid.length) result.amenity = valid;
  }
  if (typeof raw.province === "string" && provinces.includes(raw.province)) {
    result.province = raw.province;
  }
  if (typeof raw.district === "string" && raw.district.trim()) {
    result.district = raw.district.trim();
  }
  if (Array.isArray(raw.keywords)) {
    const valid = raw.keywords
      .filter((k) => typeof k === "string" && k.trim())
      .map((k) => k.trim().toLowerCase());
    if (valid.length) result.keywords = valid;
  }

  return result;
}

const MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
];

let keyIndex = 0;
let modelIndex = 0;

function getApiKeys() {
  const keys = [];
  const primary = import.meta.env.VITE_GEMINI_API_KEY;
  if (primary) keys.push(primary);
  for (let i = 2; i <= 10; i++) {
    const k = import.meta.env[`VITE_GEMINI_API_KEY_${i}`];
    if (k) keys.push(k);
  }
  return keys;
}

export async function parseQueryToFilters(query, locations) {
  const apiKeys = getApiKeys();
  if (!apiKeys.length)
    throw new Error("VITE_GEMINI_API_KEY chưa được cấu hình");

  const provinces = locations.map((l) => l.province);
  const prompt = buildPrompt(query, provinces);

  const totalCombinations = apiKeys.length * MODELS.length;
  let lastError;

  for (let attempt = 0; attempt < totalCombinations; attempt++) {
    const key = apiKeys[keyIndex % apiKeys.length];
    const modelName = MODELS[modelIndex % MODELS.length];

    keyIndex = (keyIndex + 1) % apiKeys.length;
    if (keyIndex === 0) modelIndex = (modelIndex + 1) % MODELS.length;

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: modelName });

      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();

      const jsonText = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      let raw;
      try {
        raw = JSON.parse(jsonText);
      } catch {
        throw new Error("Không thể phân tích kết quả từ AI. Vui lòng thử lại.");
      }

      return validate(raw, provinces);
    } catch (err) {
      if (err.message?.includes("phân tích")) throw err;
      lastError = err;
    }
  }

  throw lastError ?? new Error("Không thể kết nối AI. Vui lòng thử lại.");
}
