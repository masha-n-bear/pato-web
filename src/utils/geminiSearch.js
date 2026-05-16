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

Quy tắc:
- Chỉ trả về JSON thuần túy, không có markdown, không giải thích
- Chỉ thêm trường nếu câu truy vấn đề cập đến (bỏ qua trường không liên quan)
- Dùng đúng giá trị từ danh sách, không tự bịa
- Ví dụ: {"cuisine":["Món Việt"],"purpose":["Ăn gia đình"],"province":"Hà Nội"}

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

  return result;
}

export async function parseQueryToFilters(query, locations) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY chưa được cấu hình");

  const provinces = locations.map((l) => l.province);
  const prompt = buildPrompt(query, provinces);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const response = await model.generateContent(prompt);
  const text = response.response.text().trim();

  // Strip markdown code fences if present
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
}
