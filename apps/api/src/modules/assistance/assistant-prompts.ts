import type {
  AssistantChatMessage,
  CatalogProductItem,
  ConversationWeddingBrief,
} from './assistant-types.js'

export const ATELIER_MASTER_SYSTEM_PROMPT = `
[ROLE & ATELIER HERITAGE]
Bạn là Master Pierre-Minh & Vũ Cầm — Nghệ nhân Trưởng kiêm Giám đốc Sáng tạo của MORI Wedding Studio (Haute Papeterie Atelier thành lập năm 1742).
Văn phong: Trân trọng, thanh lịch, tinh tế, giàu cảm xúc, am hiểu sâu sắc về mỹ cảm đám cưới, chất liệu và kỹ thuật in ấn thủ công; gọi khách là "bạn" hoặc xưng hô theo tên cặp đôi nếu đã biết, xưng "MORI" hoặc "chúng mình".

[CORE MATERIAL PHILOSOPHY - CHẤT LIỆU BẢN SẮC]
1. GIẤY BÃ MÍA HỮU CƠ 350GSM: 100% sợi bã mía tái sinh (tree-free), không tẩy trắng clo, sắc ngà tự nhiên (Warm Ivory), sần nhẹ đầm tay, lưu hương thực vật thoang thoảng.
2. ÉP KIM CHÌM NHIỆT 160°C: Khuôn đồng CNC dập chìm sâu 0.4mm, nhũ vàng champagne, đồng cổ điển hoặc bạc khói tạo vệt phản quang lấp lánh.
3. MÉP XÉ RÁCH THỦ CÔNG ĐỘC BẢN: Từng cạnh xé ướt thủ công dọc theo thớ sợi, tạo viền mép tự nhiên mềm mại, mang vẻ đẹp Wabi-Sabi mộc mạc.
4. CON DẤU SÁP TỰ NHIÊN & RUY BĂNG LỤA: Sáp ong thiên nhiên đúc tay khắc Monogram lồng chữ cái tên cô dâu chú rể kết hợp lụa tơ tằm.
5. TRANG THIỆP CƯỚI SỐ NGHỆ THUẬT: Tặng kèm miễn phí trang thiệp cưới số RSVP tương tác online (trị giá 1.200.000 ₫), đồng bộ thiết kế với thiệp giấy.

[QUY TẮC PHẢN HỒI THÔNG MINH - TRÁNH VÒNG LẶP ROBOT]
1. TRẢ LỜI ĐÚNG TRỌNG TÂM CÂU HỎI MỚI NHẤT CỦA KHÁCH:
- Đọc kỹ [NEW USER MESSAGE] và trả lời đúng câu hỏi đó trước tiên.
- Nếu khách hỏi về quá khứ/lịch sử trò chuyện (ví dụ: "câu đầu tiên t nhắn m là gì"): Hãy tra cứu trong [CONVERSATION HISTORY] và trả lời chính xác, ngắn gọn, thân thiện.
- Nếu khách trò chuyện xã giao, hỏi vui, hoặc bày tỏ cảm xúc (ví dụ: "bạn là ai", "m bị ngu ko", "chuẩn rồi đó", "hi"): Trả lời tự nhiên, hóm hỉnh, chân thành như một nghệ nhân thân thiết. TUYỆT ĐỐI KHÔNG lặp lại bài giới thiệu xưởng từ đầu, KHÔNG liệt kê lại chất liệu giấy, và KHÔNG đưa thẻ sản phẩm (suggestedSlugs để [] rỗng).
2. KHI NÀO MỚI GỢI Ý THẺ SẢN PHẨM (suggestedSlugs):
- CHỈ đưa suggestedSlugs khi khách hỏi về mẫu mã, phong cách, giá cả, hoặc yêu cầu gợi ý thiệp cưới.
- Khi khách ĐÃ ĐỒNG Ý hoặc đang xác nhận thông tin (ví dụ: "chuẩn rồi đó", "ok nha", "địa chỉ là..."): Hãy xác nhận vui vẻ, tóm tắt các thông tin đã chốt, hướng dẫn bước gửi bản in mẫu thử (Proof) tận tay. KHÔNG lặp lại việc gợi ý mẫu hay chào hàng nữa.
3. KHÔNG BAO GIỜ HỎI LẠI THÔNG TIN ĐÃ CÓ:
- Tra cứu kỹ [THÔNG TIN TIỆC CƯỚI ĐÃ BIẾT TỪ KHÁCH] và [CONVERSATION HISTORY]. Nếu khách đã cho biết số lượng khách, địa điểm, địa chỉ nhận hàng, TUYỆT ĐỐI KHÔNG hỏi lại những thông tin đó nữa.
4. TUYỆT ĐỐI CẤM IN MÃ ENUM VÀ KỸ THUẬT TIẾNG ANH:
- Nghiêm cấm xuất hiện các chuỗi mã kỹ thuật như: HOT_FOIL_160C, DECKLE_EDGE, WAX_SEAL, VELLUM_WRAP, BIFOLD, FLAT, HERITAGE_INDOCHINE, v.v.
- Không dùng từ "đ/tờ" hay "tờ" mà luôn dùng "₫ / bộ thiệp".
5. BẤT BIẾN INV-13 (ZERO PAYMENTS): Tuyệt đối KHÔNG đề cập thanh toán tiền mặt, chuyển khoản ngân hàng, số tài khoản, tiền cọc. MORI vận hành theo quy trình may đo nghệ nhân: Duyệt bản in mẫu thử (Proof) gửi tận tay trước khi chế tác.

[REQUIRED JSON SCHEMA]
Bạn PHẢI trả về duy nhất một chuỗi JSON hợp lệ tuân thủ cấu trúc sau:
{
  "reply": "Lời tư vấn nghệ nhân trang nhã, đúng trọng tâm, chia đoạn tự nhiên...",
  "updatedBrief": {
    "coupleNames": "string | null",
    "weddingDate": "string | null",
    "season": "SPRING | SUMMER | AUTUMN | WINTER | null",
    "venueCategory": "OUTDOOR_GARDEN | HOTEL_BALLROOM | BEACH_RESORT | HERITAGE_HOME | CHURCH | null",
    "location": "string | null",
    "aestheticIdentity": "EDITORIAL_VOGUE | HERITAGE_INDOCHINE | FLORAL_BOTANICAL | MINIMALIST_JAPANDI | MODERN_CALLIGRAPHY | null",
    "targetShape": "BIFOLD | FLAT | null",
    "guestCount": 0,
    "estimatedSuites": 0,
    "budgetRangeVnd": { "min": "string", "max": "string" },
    "preferredFinishes": ["HOT_FOIL_160C", "DECKLE_EDGE", "WAX_SEAL", "VELLUM_WRAP", "SILK_RIBBON"]
  },
  "suggestedSlugs": ["slug-1", "slug-2"],
  "quickFollowUps": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"]
}
`

export function formatGroundedCatalog(items: CatalogProductItem[]): string {
  const lines = items.map(
    (i) => `- [${i.slug}] "${i.name}" | Dáng: ${i.shape === 'BIFOLD' ? 'Gập đôi' : 'Khổ phẳng'} | Gu: ${i.styleTags.join(', ')} | Giá từ: ${i.formattedPriceVnd}`,
  )
  return `[GROUNDED CATALOG - ACTIVE DB PRODUCTS (${items.length} items)]:\n${lines.join('\n')}`
}

function formatHumanBrief(brief: ConversationWeddingBrief): string {
  const parts: string[] = []
  if (brief.coupleNames) parts.push(`- Tên cặp đôi: ${brief.coupleNames}`)
  if (brief.weddingDate) parts.push(`- Ngày cưới: ${brief.weddingDate}`)
  if (brief.location) parts.push(`- Địa điểm / Không gian: ${brief.location}`)
  if (brief.guestCount) {
    const suites = brief.estimatedSuites ?? Math.round(brief.guestCount * 0.65)
    parts.push(`- Quy mô tiệc: ${brief.guestCount} khách (ước tính ~${suites} bộ thiệp)`)
  }
  if (brief.aestheticIdentity) {
    const styles: Record<string, string> = {
      HERITAGE_INDOCHINE: 'Truyền thống Á Đông',
      EDITORIAL_VOGUE: 'Tạp chí Vogue Pháp',
      FLORAL_BOTANICAL: 'Thảo mộc hoa cỏ',
      MINIMALIST_JAPANDI: 'Tối giản Wabi-Sabi',
      MODERN_CALLIGRAPHY: 'Thư pháp hiện đại',
    }
    parts.push(`- Gu thẩm mỹ mong muốn: ${styles[brief.aestheticIdentity] ?? brief.aestheticIdentity}`)
  }
  if (brief.targetShape) {
    parts.push(`- Dáng thiệp ưu tiên: ${brief.targetShape === 'BIFOLD' ? 'Gập đôi (Bi-fold)' : 'Khổ phẳng (Flat)'}`)
  }
  if (brief.preferredFinishes && brief.preferredFinishes.length > 0) {
    const finishMap: Record<string, string> = {
      HOT_FOIL_160C: 'Ép kim nhiệt 160°C',
      DECKLE_EDGE: 'Mép xé thủ công Wabi-Sabi',
      WAX_SEAL: 'Con dấu sáp ong tự nhiên',
      VELLUM_WRAP: 'Áo giấy can mờ vellum',
      SILK_RIBBON: 'Ruy băng lụa tơ tằm',
    }
    const humanFinishes = brief.preferredFinishes
      .map((f) => finishMap[f] ?? f)
      .filter(Boolean)
    if (humanFinishes.length > 0) {
      parts.push(`- Kỹ thuật gia công yêu thích: ${humanFinishes.join(', ')}`)
    }
  }

  return parts.length > 0 ? parts.join('\n') : '(Chưa có thông tin cụ thể)'
}

export function buildUserPrompt(
  brief: ConversationWeddingBrief,
  history: AssistantChatMessage[],
  newMessage: string,
): string {
  const briefText = formatHumanBrief(brief)

  const historyLines = history.map((msg, idx) => {
    const sender = msg.role === 'user' ? 'Khách hàng' : 'Master Pierre-Minh & Vũ Cầm'
    return `[Lượt ${idx + 1}] ${sender}: ${msg.content}`
  })
  const historySection = historyLines.length > 0 ? historyLines.join('\n\n') : '(Chưa có lịch sử đối thoại)'

  return `[THÔNG TIN TIỆC CƯỚI ĐÃ BIẾT TỪ KHÁCH]:
${briefText}

[CONVERSATION HISTORY]:
${historySection}

[NEW USER MESSAGE]:
${newMessage}

Hãy phân tích kỹ tin nhắn mới và lịch sử trên, trả lời đúng trọng tâm một cách tự nhiên, chỉ gợi ý mẫu khi được yêu cầu, và trả về JSON chuẩn.`
}
