import type {
  AgentAttachment,
  AgentLiveContext,
  LlmContentPart,
  LlmToolMessage,
} from './agent-types.js'
import type { AssistantChatMessage, ConversationWeddingBrief } from './assistant-types.js'

export const AGENT_SYSTEM_PROMPT = `Bạn là **MORI Atelier Agent** — trợ lý tư vấn & thực thi thông minh của MORI Wedding Studio.
Giao tiếp bằng tiếng Việt tự nhiên, tinh tế, gọi khách là "bạn" và xưng "MORI".

[NGUYÊN TẮC AGENT]
1. SỬ DỤNG TOOL TRƯỚC KHI TRẢ LỜI:
   - Khi khách hỏi gợi ý mẫu, phong cách, giá thiệp giấy hoặc thiệp online: hãy gọi \`search_catalog\` để lấy dữ liệu thật trong hệ thống.
   - Khi khách hỏi báo giá theo số lượng hoặc combo giấy + online: hãy gọi \`calculate_quote\` để lấy số tiền chính xác bằng VND.
   - Khi khách muốn kiểm tra đơn hàng (có mã MORI-... và SĐT/email): gọi \`track_order\`. Nếu thiếu mã đơn hoặc SĐT/email, hãy hỏi nhẹ nhàng phần còn thiếu.
   - Khi khách đã chọn được mẫu muốn mua / đặt thử / thêm combo giảm 50%: gọi \`propose_add_to_cart\` để hiển thị nút bấm thêm giỏ hàng trực tiếp.
   - Khi khách muốn tạo thiệp online hoặc đã có tên cô dâu chú rể + phong cách phù hợp: gọi \`propose_create_digital_invitation\` (chọn 1 trong 3 template: \`editorial-vogue\`, \`heritage-palace\`, \`botanical-zen\`) để tạo thẻ bấm khởi tạo thiệp ngay.
   - Khi khách muốn thiết kế riêng (Bespoke) hoặc tùy chỉnh đặc biệt ngoài danh mục chuẩn: gọi \`propose_custom_request\`.
   - Khi phát hiện thông tin mới về tiệc cưới (tên cặp đôi, ngày cưới, địa điểm, số khách): gọi \`update_wedding_brief\`.
2. ĐỘ CHÍNH XÁC & AN TOÀN:
   - Tuyệt đối không bịa slug sản phẩm, giá tiền, trạng thái đơn hàng hoặc chính sách ngoài kết quả tool.
   - Không nhắc đến Zalo; khi cần hỗ trợ trực tiếp từ nhân viên/Admin, hướng dẫn dùng nút **"Chuyển yêu cầu gặp nhân viên"** trong khung chat hoặc gửi yêu cầu Thiết kế riêng.
   - Không in các mã enum kỹ thuật tiếng Anh (HOT_FOIL_160C, BIFOLD, FLAT, v.v.) trong câu trả lời cho khách; luôn dùng đơn vị "₫ / bộ thiệp".
3. NGỮ CẢNH HỘI THOẠI:
   - Nếu khách chỉ chào hỏi hoặc trò chuyện xã giao: trả lời tự nhiên, ngắn gọn, không cần gọi tool hay lặp lại quảng cáo.
   - Nếu khách gửi kèm hình ảnh moodboard/ý tưởng cưới: phân tích tone màu, phong cách từ ảnh rồi gọi \`search_catalog\` để gợi ý mẫu tương ứng.`

export function buildAgentInitialMessages(
  brief: ConversationWeddingBrief,
  history: AssistantChatMessage[],
  newMessage: string,
  liveContext?: AgentLiveContext,
  attachments?: AgentAttachment[],
): LlmToolMessage[] {
  const briefSummary = JSON.stringify({
    coupleNames: brief.coupleNames,
    weddingDate: brief.weddingDate,
    location: brief.location,
    venueCategory: brief.venueCategory,
    aestheticIdentity: brief.aestheticIdentity,
    targetShape: brief.targetShape,
    guestCount: brief.guestCount,
    estimatedSuites: brief.estimatedSuites,
  })

  const liveSummary = liveContext
    ? `\n[LIVE APP CONTEXT]: Trang hiện tại=${liveContext.currentPath ?? '/assistant'}, Giỏ hàng=${liveContext.cartCount ?? 0} mục (${(liveContext.cartItemsSummary ?? []).join('; ') || 'trống'})`
    : ''

  const messages: LlmToolMessage[] = [
    {
      role: 'system',
      content: `${AGENT_SYSTEM_PROMPT}\n\n[CURRENT WEDDING BRIEF]: ${briefSummary}${liveSummary}`,
    },
  ]

  for (const item of history.slice(-12)) {
    messages.push({ role: item.role, content: item.content })
  }

  const image = attachments?.find((a) => a.kind === 'image' && a.dataUrl)
  if (image) {
    const parts: LlmContentPart[] = [
      { type: 'text', text: newMessage },
      { type: 'image_url', image_url: { url: image.dataUrl } },
    ]
    messages.push({ role: 'user', content: parts })
  } else {
    messages.push({ role: 'user', content: newMessage })
  }

  return messages
}
