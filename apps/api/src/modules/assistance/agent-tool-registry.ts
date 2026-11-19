import {
  BESPOKE_INVITATION_TOOL,
  DESIGN_SYSTEM_TOOL,
  MOTION_ARTWORK_KIT_TOOL,
} from './agent-bespoke-tool-schema.js'

export const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_catalog',
      description: 'Tìm kiếm danh sách thiệp giấy và thiệp online hiện có trong kho dữ liệu MORI theo từ khóa, phong cách hoặc dáng thiệp.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Từ khóa tìm kiếm tên hoặc mô tả mẫu thiệp' },
          style: { type: 'string', description: 'Phong cách: editorial, floral, traditional, minimalist, typography' },
          productType: { type: 'string', enum: ['PAPER', 'DIGITAL', 'ALL'], description: 'Loại sản phẩm cần lọc' },
          shape: { type: 'string', enum: ['BIFOLD', 'FLAT'], description: 'Dáng thiệp giấy' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_quote',
      description: 'Tính báo giá chính xác theo số lượng bộ thiệp giấy và/hoặc thiệp online (tự động áp dụng ưu đãi giảm 50% thiệp online khi mua Combo).',
      parameters: {
        type: 'object',
        properties: {
          paperSlug: { type: 'string', description: 'Slug của mẫu thiệp giấy trong danh mục' },
          shape: { type: 'string', enum: ['BIFOLD', 'FLAT'], description: 'Dáng thiệp giấy' },
          quantity: { type: 'number', description: 'Số lượng bộ thiệp giấy cần in (VD: 80, 100, 150)' },
          digitalSlug: { type: 'string', description: 'Slug của mẫu thiệp online muốn mua lẻ hoặc ghép Combo giảm 50%' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'track_order',
      description: 'Tra cứu trạng thái và tiến độ thực tế của đơn hàng tại MORI bằng mã đơn (MORI-xxxx) và SĐT hoặc email liên hệ.',
      parameters: {
        type: 'object',
        required: ['code', 'contact'],
        properties: {
          code: { type: 'string', description: 'Mã đơn hàng, ví dụ MORI-1001' },
          contact: { type: 'string', description: 'Số điện thoại hoặc email đặt hàng' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'propose_add_to_cart',
      description: 'Đề xuất thẻ xác nhận để khách bấm thêm mẫu thiệp giấy, thiệp online hoặc Combo giảm 50% vào giỏ hàng.',
      parameters: {
        type: 'object',
        required: ['productType', 'slug'],
        properties: {
          productType: { type: 'string', enum: ['PAPER', 'DIGITAL', 'COMBO'] },
          slug: { type: 'string', description: 'Slug chính xác của sản phẩm chính (thiệp giấy nếu PAPER/COMBO, thiệp online nếu DIGITAL)' },
          shape: { type: 'string', enum: ['BIFOLD', 'FLAT'] },
          quantity: { type: 'number', description: 'Số lượng bộ (mặc định 1 với DIGITAL, >=10 với PAPER/COMBO)' },
          linkedDigitalSlug: { type: 'string', description: 'Slug thiệp online đi kèm khi productType là COMBO' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'propose_create_digital_invitation',
      description: 'Đề xuất thẻ tạo sẵn bản nháp Thiệp Cưới Online với thông tin cô dâu chú rể, ngày cưới và mẫu template đã chọn.',
      parameters: {
        type: 'object',
        required: ['templateId', 'groomName', 'brideName'],
        properties: {
          templateId: { type: 'string', enum: ['editorial-vogue', 'heritage-palace', 'botanical-zen'] },
          groomName: { type: 'string' },
          brideName: { type: 'string' },
          eventTitle: { type: 'string' },
          weddingDate: { type: 'string', description: 'Ngày giờ dạng YYYYMMDDTHHmmss hoặc văn bản mô tả ngày cưới' },
          lunarDate: { type: 'string' },
          venueName: { type: 'string' },
          venueAddress: { type: 'string' },
          greeting: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'propose_custom_request',
      description: 'Đề xuất thẻ gửi yêu cầu thiết kế riêng (Bespoke) tới đội ngũ nghệ nhân MORI.',
      parameters: {
        type: 'object',
        required: ['notes'],
        properties: {
          coupleNames: { type: 'string' },
          weddingDate: { type: 'string' },
          quantity: { type: 'string' },
          style: { type: 'string' },
          notes: { type: 'string', description: 'Tóm tắt yêu cầu thiết kế riêng' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_wedding_brief',
      description: 'Cập nhật bộ nhớ thông tin tiệc cưới của khách hàng khi phát hiện thông tin mới.',
      parameters: {
        type: 'object',
        properties: {
          coupleNames: { type: 'string' },
          weddingDate: { type: 'string' },
          location: { type: 'string' },
          venueCategory: { type: 'string', enum: ['OUTDOOR_GARDEN', 'HOTEL_BALLROOM', 'BEACH_RESORT', 'HERITAGE_HOME', 'CHURCH'] },
          aestheticIdentity: { type: 'string', enum: ['EDITORIAL_VOGUE', 'HERITAGE_INDOCHINE', 'FLORAL_BOTANICAL', 'MINIMALIST_JAPANDI', 'MODERN_CALLIGRAPHY'] },
          targetShape: { type: 'string', enum: ['BIFOLD', 'FLAT'] },
          guestCount: { type: 'number' },
          estimatedSuites: { type: 'number' },
        },
      },
    },
  },
  DESIGN_SYSTEM_TOOL,
  MOTION_ARTWORK_KIT_TOOL,
  BESPOKE_INVITATION_TOOL,
]
