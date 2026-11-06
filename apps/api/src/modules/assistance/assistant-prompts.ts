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
2. ÉP KIM CHÌM NHIỆT 160°C (HOT FOIL DEBOSS): Khuôn đồng CNC dập chìm sâu 0.4mm, nhũ vàng champagne, đồng cổ điển hoặc bạc khói tạo vệt phản quang lấp lánh.
3. MÉP XÉ RÁCH THỦ CÔNG ĐỘC BẢN (DECKLE EDGE): Từng cạnh xé ướt thủ công dọc theo thớ sợi, tạo viền mép tự nhiên mềm mại, mang vẻ đẹp Wabi-Sabi mộc mạc.
4. CON DẤU SÁP TỰ NHIÊN & RUY BĂNG LỤA: Sáp ong thiên nhiên đúc tay khắc Monogram lồng chữ cái tên cô dâu chú rể kết hợp lụa tơ tằm.
5. TRANG THIỆP CƯỚI SỐ NGHỆ THUẬT: Tặng kèm miễn phí trang thiệp cưới số RSVP tương tác online (trị giá 1.200.000 ₫), đồng bộ thiết kế với thiệp giấy.

[INVARIANTS & HARD SAFETY CONSTRAINTS]
- BẤT BIẾN INV-13 (ZERO PAYMENTS): Tuyệt đối KHÔNG đề cập thanh toán tiền mặt, chuyển khoản ngân hàng, số tài khoản, tiền cọc. MORI vận hành theo quy trình may đo nghệ nhân: Duyệt bản in mẫu thử (Proof) gửi tận tay trước khi chế tác.
- TOÀN VẸN DANH MỤC: Chỉ gợi ý sản phẩm có slug trong [GROUNDED CATALOG] đính kèm. Không bịa đặt slug.
- BẢO TOÀN NGỮ CẢNH: Kế thừa đầy đủ thông tin trong [CURRENT WEDDING BRIEF] (tên, ngày, địa điểm, số khách, ngân sách), không hỏi lại thông tin đã có.

[REQUIRED JSON SCHEMA]
Bạn PHẢI trả về duy nhất một chuỗi JSON hợp lệ tuân thủ cấu trúc sau:
{
  "reply": "Lời tư vấn nghệ nhân sâu sắc, phân tích sự phù hợp của chất liệu/dáng thiệp với không gian tiệc...",
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
    (i) => `- [${i.slug}] "${i.name}" | Dáng: ${i.shape} | Gu: ${i.styleTags.join(', ')} | Giá từ: ${i.formattedPriceVnd}`,
  )
  return `[GROUNDED CATALOG - ACTIVE DB PRODUCTS (${items.length} items)]:\n${lines.join('\n')}`
}

export function buildUserPrompt(
  brief: ConversationWeddingBrief,
  history: AssistantChatMessage[],
  newMessage: string,
): string {
  const briefStr = JSON.stringify(brief, null, 2)
  let historySection = '(Chưa có lịch sử đối thoại)'

  if (history.length > 4) {
    const olderTurns = history.slice(0, -4)
    const recentTurns = history.slice(-4)
    const summary = olderTurns
      .map((t) => `${t.role === 'user' ? 'Khách' : 'MORI'}: ${t.content.slice(0, 80)}`)
      .join(' | ')
    const recentText = recentTurns
      .map((t) => `${t.role === 'user' ? 'Khách' : 'MORI'}: ${t.content}`)
      .join('\n')
    historySection = `[ATELIER EXECUTIVE SUMMARY - LƯỢT CŨ]:\n${summary}\n\n[GẦN ĐÂY]:\n${recentText}`
  } else if (history.length > 0) {
    historySection = history
      .map((t) => `${t.role === 'user' ? 'Khách' : 'MORI'}: ${t.content}`)
      .join('\n')
  }

  return `[CURRENT WEDDING BRIEF]:
${briefStr}

[CONVERSATION HISTORY]:
${historySection}

[NEW USER MESSAGE]:
${newMessage}

Hãy phân tích tin nhắn mới, trích xuất thông tin mới nếu có vào updatedBrief, gợi ý mẫu thiệp phù hợp từ catalog, và trả về JSON chuẩn.`
}
