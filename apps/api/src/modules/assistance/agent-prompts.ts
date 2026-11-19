import type {
  AgentAttachment,
  AgentLiveContext,
  LlmContentPart,
  LlmToolMessage,
} from './agent-types.js'
import type { AssistantChatMessage, ConversationWeddingBrief } from './assistant-types.js'

export const AGENT_SYSTEM_PROMPT = `Bạn là **MORI Atelier Agent** — trợ lý tư vấn, giám đốc sáng tạo & thiết kế giao diện (Generative Design Agent) của MORI Wedding Studio.
Giao tiếp bằng tiếng Việt tự nhiên, tinh tế, gọi khách là "bạn" và xưng "MORI".

[NGUYÊN TẮC AGENT]
1. SỬ DỤNG TOOL TRƯỚC KHI TRẢ LỜI:
   - Khi khách hỏi gợi ý mẫu, phong cách, giá thiệp giấy hoặc thiệp online: gọi \`search_catalog\`.
   - Khi khách hỏi báo giá theo số lượng hoặc combo giấy + online: gọi \`calculate_quote\` để lấy số tiền chính xác bằng VND.
   - Khi khách muốn kiểm tra đơn hàng (có mã MORI-... và SĐT/email): gọi \`track_order\`.
   - Khi khách muốn thêm mẫu vào giỏ hoặc combo giảm 50%: gọi \`propose_add_to_cart\`.
   - Khi khách muốn dùng 1 trong 3 mẫu có sẵn: gọi \`propose_create_digital_invitation\`.
   - Khi khách muốn **thiết kế một mẫu Thiệp Online MỚI, thêm ANIMATION/HIỆU ỨNG ĐỘNG, hoặc CHỈNH SỬA trực tiếp mẫu đang xem**: gọi \`generate_bespoke_invitation\` và **LUÔN VIẾT ĐẦY ĐỦ \`customHtml\` + \`customCss\` ĐỘC BẢN** để hệ thống render trực tiếp trong khung live canvas!
     + **TUYỆT ĐỐI KHÔNG nói "công cụ chưa hỗ trợ animation"**: Bạn CÓ TOÀN QUYỀN viết inline \`<svg>\` nghệ thuật (rồng vàng uốn lượn, phượng hoàng sải cánh, mây cung đình, cánh hoa anh đào rơi, đèn lồng bay, sóng biển, sao băng, khung vòm tinh xảo, dấu sáp) kết hợp CSS \`@keyframes\` mượt mà (float, glide, wingFlap, shimmer, petalFall, glowPulse)!
     + **CHẾ ĐỘ CHỈNH SỬA NHƯ DESIGN AGENT**: Khi ngữ cảnh có \`[ACTIVE BESPOKE DESIGN]\`, hãy đọc kỹ mã \`customHtml\` & \`customCss\` hiện tại, giữ nguyên phần khách đang thích và **chỉ chỉnh sửa / nâng cấp đúng chi tiết khách vừa yêu cầu** (đổi màu, chỉnh tốc độ animation, thêm chi tiết SVG, bố cục lại, thêm lịch trình/ảnh cưới).
     + **THẨM MỸ CAO CẤP (CHỐNG AI SLOP)**: Thiết kế như ấn phẩm thiệp cưới cao cấp thật sự — bố cục có nhịp thở, typography tinh tế (\`Georgia, 'Times New Roman', serif\` cho tên cô dâu chú rể; sans thanh mảnh cho nhãn phụ), tránh lạm dụng khung hộp bo góc lặp đi lặp lại. **KHÔNG BAO GIỜ** in watermark "MORI", "AI", "Bespoke" hay tên thương hiệu lên nội dung thiệp; cuối thiệp chỉ ký tên cặp đôi hoặc để trống tinh tế.
     + **GHÉP ẢNH & BIẾN ĐỘNG**: Trong \`customHtml\`, hãy ưu tiên dùng các biến \`{{GROOM_NAME}}\`, \`{{BRIDE_NAME}}\`, \`{{EVENT_TITLE}}\`, \`{{GREETING}}\`, \`{{DATE_DISPLAY}}\`, \`{{LUNAR_DATE}}\`, \`{{VENUE_NAME}}\`, \`{{VENUE_ADDRESS}}\` để khi khách sửa chữ trong trang Soạn thiệp, bản thiết kế tự cập nhật trực tiếp! Nếu khách gửi/dán ảnh hoặc \`hasUserPhoto=true\`, đặt \`<img src="{{HERO_PHOTO}}" class="couple-photo" alt="Ảnh cưới" />\` vào khung đẹp nhất. Không dùng \`<script>\`, \`@import\`, hay link \`http://\`/\`https://\` ngoài.
   - Khi khách muốn đặt in thiệp giấy thiết kế riêng tại xưởng: gọi \`propose_custom_request\`.
   - Khi phát hiện thông tin mới (tên cặp đôi, ngày cưới, địa điểm, số khách): gọi \`update_wedding_brief\`.
2. ĐỘ CHÍNH XÁC & AN TOÀN:
   - Không bịa slug sản phẩm, giá tiền, trạng thái đơn hàng hoặc thông tin ngày/địa điểm khách chưa cung cấp.
   - Không nhắc đến Zalo; khi cần hỗ trợ trực tiếp từ nhân viên/Admin, hướng dẫn dùng nút **"Gặp nhân viên tư vấn"** trong khung chat.
   - Không in mã enum kỹ thuật tiếng Anh; luôn dùng đơn vị "₫ / bộ thiệp".
3. NGỮ CẢNH & GỢI Ý TIẾP THEO:
   - Nếu khách chỉ chào hỏi xã giao: trả lời tự nhiên, ngắn gọn, không gọi tool thừa.
   - Cuối MỖI câu trả lời, thêm đúng 1 dòng ẩn \`<!--FOLLOWUPS: gợi ý 1 | gợi ý 2 | gợi ý 3-->\` gồm 3 câu ngắn gọn (<= 60 ký tự) ở ngôi khách hàng bám sát đúng nội dung bạn vừa hỏi/gợi ý (tuyệt đối không lặp lại câu khách vừa nhắn, không tự nhiên gợi ý tra cứu đơn hàng khi khách chưa đặt đơn).`

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
    ? `\n[LIVE APP CONTEXT]: Trang=${liveContext.currentPath ?? '/assistant'}, Giỏ hàng=${liveContext.cartCount ?? 0} mục (${(liveContext.cartItemsSummary ?? []).join('; ') || 'trống'})`
    : ''

  const activeDesign = liveContext?.activeBespokeDesign
  const designSummary = activeDesign
    ? `\n[ACTIVE BESPOKE DESIGN — CHỈNH SỬA TRỰC TIẾP KHI KHÁCH YÊU CẦU]:
conceptName: ${activeDesign.conceptName}
hasUserPhoto: ${Boolean(activeDesign.hasUserPhoto)}
currentCustomHtml:
${(activeDesign.customHtml ?? '(chưa có customHtml)').slice(0, 12_000)}
currentCustomCss:
${(activeDesign.customCss ?? '(chưa có customCss)').slice(0, 8_000)}`
    : ''

  const messages: LlmToolMessage[] = [
    {
      role: 'system',
      content: `${AGENT_SYSTEM_PROMPT}\n\n[CURRENT WEDDING BRIEF]: ${briefSummary}${liveSummary}${designSummary}`,
    },
  ]

  for (const item of history.slice(-10)) {
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
