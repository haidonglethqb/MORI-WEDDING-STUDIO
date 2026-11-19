export const BESPOKE_INVITATION_TOOL = {
  type: 'function',
  function: {
    name: 'generate_bespoke_invitation',
    description:
      'Thiết kế một mẫu Thiệp Cưới Online ĐỘC BẢN HOÀN TOÀN MỚI (màu sắc, font chữ, khung ảnh, họa tiết, thứ tự bố cục, thông tin tuổi/bio cô dâu chú rể, cột mốc câu chuyện tình yêu, dress code, địa điểm) để hệ thống render trực tiếp cho khách xem và xuất bản thành link thiệp thật.',
    parameters: {
      type: 'object',
      required: ['conceptName', 'groomName', 'brideName', 'typography', 'frameStyle', 'bgPattern', 'ornament', 'heroLayout', 'theme', 'sectionOrder'],
      properties: {
        conceptName: { type: 'string', description: 'Tên phong cách tinh tế, trang nhã (VD: "Song Hỷ Cổ Điển", "Ánh Nến Mùa Thu", "Tối Giản Hiện Đại", "Hoàng Hôn Biển") — tránh ghép tên địa danh sáo rỗng, KHÔNG ghi chữ AI hay MORI' },
        eyebrowTag: { type: 'string', description: 'Lời mở đầu trang trọng in trên đầu thiệp (VD: "TRÂN TRỌNG KÍNH MỜI", "THIỆP MỜI THÀNH HÔN", "SAVE THE DATE") — tuyệt đối KHÔNG ghi tên thương hiệu hay chữ AI' },
        typography: { type: 'string', enum: ['editorial-serif', 'modern-sans', 'romantic-italic', 'heritage-classic'] },
        frameStyle: { type: 'string', enum: ['arch-dome', 'sharp-magazine', 'glass-card', 'imperial-corner', 'polaroid-mat', 'soft-organic'] },
        bgPattern: { type: 'string', enum: ['none', 'linen-grain', 'starry-dots', 'botanical-wash', 'gold-aura'] },
        ornament: { type: 'string', enum: ['wax-seal', 'botanical-branch', 'double-happiness', 'constellation', 'minimal-line', 'zen-enso'] },
        heroLayout: { type: 'string', enum: ['arch-portrait', 'full-overlay', 'split-editorial', 'polaroid-story'] },
        theme: {
          type: 'object',
          required: ['bg', 'surface', 'text', 'muted', 'accent', 'border', 'buttonText'],
          properties: {
            bg: { type: 'string', description: 'Mã màu nền chính dạng #RRGGBB có độ tương phản tốt với text' },
            bgAccent: { type: 'string', description: 'Mã màu nền chuyển sắc phụ dạng #RRGGBB (tùy chọn)' },
            surface: { type: 'string', description: 'Mã màu nền card nội dung dạng #RRGGBB' },
            text: { type: 'string', description: 'Mã màu chữ chính dạng #RRGGBB' },
            muted: { type: 'string', description: 'Mã màu chữ phụ dạng #RRGGBB' },
            accent: { type: 'string', description: 'Mã màu nhấn chủ đạo (nút bấm, họa tiết) dạng #RRGGBB' },
            border: { type: 'string', description: 'Mã màu viền tinh tế dạng #RRGGBB' },
            buttonText: { type: 'string', description: 'Mã màu chữ trên nút màu accent dạng #RRGGBB' },
          },
        },
        sectionOrder: {
          type: 'array',
          items: { type: 'string', enum: ['hero', 'couple-bio', 'story', 'families', 'event-card', 'dress-code', 'gallery', 'countdown', 'gift-note'] },
          description: 'Thứ tự hiển thị các phần của thiệp online (luôn bắt đầu bằng "hero")',
        },
        groomName: { type: 'string' },
        brideName: { type: 'string' },
        groomMeta: { type: 'string', description: 'Tuổi, nghề nghiệp hoặc lời giới thiệu ngắn về chú rể' },
        brideMeta: { type: 'string', description: 'Tuổi, nghề nghiệp hoặc lời giới thiệu ngắn về cô dâu' },
        eventTitle: { type: 'string', description: 'Tiêu đề sự kiện (VD: "Lễ Thành Hôn & Tiệc Cưới Thân Mật")' },
        weddingDate: { type: 'string', description: 'Ngày giờ dạng YYYYMMDDTHHmmss (VD: 20261122T180000)' },
        lunarDate: { type: 'string', description: 'Ngày âm lịch nếu có' },
        venueName: { type: 'string' },
        venueAddress: { type: 'string' },
        groomParents: { type: 'string', description: 'Song thân nhà trai (VD: "Ông Nguyễn Văn A & Bà Trần Thị B")' },
        brideParents: { type: 'string', description: 'Song thân nhà gái' },
        greeting: { type: 'string', description: 'Lời mời trang trọng/ấm áp gửi tới khách mời' },
        storyCaption: { type: 'string', description: 'Câu trích dẫn ngắn cho bộ ảnh' },
        scheduleItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              time: { type: 'string' },
              label: { type: 'string' },
            },
          },
        },
        storyMilestones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              year: { type: 'string' },
              title: { type: 'string' },
              detail: { type: 'string' },
            },
          },
          description: '2 đến 4 cột mốc câu chuyện tình yêu của cặp đôi',
        },
        dressCode: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            note: { type: 'string' },
            swatches: { type: 'array', items: { type: 'string', description: 'Mã màu hex #RRGGBB' } },
          },
        },
        giftNote: {
          type: 'object',
          properties: {
            heading: { type: 'string' },
            message: { type: 'string' },
          },
        },
        customHtml: {
          type: 'string',
          description:
            'Mã HTML + inline <svg> ĐỘC BẢN để render toàn bộ trang Thiệp Cưới Online với họa tiết & hiệu ứng theo đúng yêu cầu khách (VD: SVG rồng vàng bay, phượng hoàng múa, mây ngũ sắc, cánh hoa anh đào rơi, đèn lồng bay, sao băng, sóng biển, dấu sáp, khung vòm). Dùng token <img src="{{HERO_PHOTO}}" class="hero-img" alt="Ảnh cưới" /> tại vị trí ảnh cưới nếu có ảnh. KHÔNG dùng <script>, KHÔNG nhúng URL ngoài, KHÔNG ghi watermark MORI hay AI.',
        },
        customCss: {
          type: 'string',
          description:
            'Mã CSS thuần (có @keyframes animation mượt mà, gradient sang trọng, layout responsive, typography tiếng Việt đẹp với Georgia/Lora/serif) khớp với customHtml. Hỗ trợ mọi hiệu ứng động (rồng bay lượn, phượng sải cánh, hạt vàng lấp lánh, hoa rơi, hiệu ứng ánh sáng, hover 3D). KHÔNG dùng @import hay url(http...).',
        },
      },
    },
  },
} as const
