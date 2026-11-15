export interface MoriFontSample {
  code: string
  name: string
  cssVar: string
  fallbackFamily: string
  styleNote: string
}

export interface MoriFontGroup {
  id: string
  title: string
  description: string
  fonts: MoriFontSample[]
}

export const FONTS_PAGE_INTRO =
  '“Những nét chữ nhỏ xinh cũng góp phần tạo nên dấu ấn riêng cho tấm thiệp cưới. Hãy cùng MORI lựa chọn kiểu chữ phù hợp với phong cách của hai bạn nhé!”'

export const SAMPLE_INVITE_LINE =
  '“Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi”'

export const MORI_FONT_GROUPS: MoriFontGroup[] = [
  {
    id: 'classic',
    title: 'Nhóm 1 – Font cổ điển, thanh lịch',
    description:
      'Các kiểu chữ có chân, đường nét cân đối, phù hợp với thiệp sang trọng hoặc phong cách truyền thống.',
    fonts: [
      {
        code: 'MORI F01',
        name: 'Cormorant Garamond',
        cssVar: '--mori-f01',
        fallbackFamily: 'Georgia, serif',
        styleNote: 'Nét có chân thanh mảnh, cân đối cho thiệp lễ cưới truyền thống.',
      },
      {
        code: 'MORI F02',
        name: 'Playfair Display',
        cssVar: '--mori-f02',
        fallbackFamily: 'Georgia, serif',
        styleNote: 'Độ tương phản nét rõ ràng, nổi bật tiêu đề tên cô dâu chú rể.',
      },
      {
        code: 'MORI F03',
        name: 'EB Garamond',
        cssVar: '--mori-f03',
        fallbackFamily: 'Georgia, serif',
        styleNote: 'Cổ điển trang nhã, dễ đọc trên khổ thiệp phẳng lẫn thiệp gấp.',
      },
      {
        code: 'MORI F04',
        name: 'Lora Serif',
        cssVar: '--mori-f04',
        fallbackFamily: 'Georgia, serif',
        styleNote: 'Cân bằng dịu mắt, hòa quyện tự nhiên với mực in trên giấy bã mía.',
      },
    ],
  },
  {
    id: 'romantic',
    title: 'Nhóm 2 – Font mềm mại, lãng mạn',
    description:
      'Các kiểu chữ viết tay hoặc nét uốn mềm, thích hợp dùng cho tên cô dâu – chú rể và những chi tiết trang trí.',
    fonts: [
      {
        code: 'MORI F05',
        name: 'Dancing Script',
        cssVar: '--mori-f05',
        fallbackFamily: 'cursive',
        styleNote: 'Chữ viết tay uyển chuyển, giàu nhịp điệu, rất hợp tên đôi uyên ương.',
      },
      {
        code: 'MORI F06',
        name: 'Great Vibes',
        cssVar: '--mori-f06',
        fallbackFamily: 'cursive',
        styleNote: 'Nét uốn lượn lãng mạn và tinh tế theo phong cách calligraphy.',
      },
      {
        code: 'MORI F07',
        name: 'Allura Script',
        cssVar: '--mori-f07',
        fallbackFamily: 'cursive',
        styleNote: 'Nét bút thanh nhẹ, tạo điểm nhấn bay bổng cho bìa thiệp cưới.',
      },
      {
        code: 'MORI F08',
        name: 'Pacifico Script',
        cssVar: '--mori-f08',
        fallbackFamily: 'cursive',
        styleNote: 'Đậm nét đầy đặn, dễ đọc khi in dập chìm hoặc mực olive.',
      },
    ],
  },
  {
    id: 'modern',
    title: 'Nhóm 3 – Font hiện đại, tối giản',
    description:
      'Các kiểu chữ đơn giản, rõ ràng, phù hợp với thiệp ít họa tiết và thiết kế hiện đại.',
    fonts: [
      {
        code: 'MORI F09',
        name: 'Be Vietnam Pro',
        cssVar: '--mori-f09',
        fallbackFamily: 'system-ui, sans-serif',
        styleNote: 'Tối ưu dấu tiếng Việt sắc nét, chuẩn mực cho bố cục tối giản.',
      },
      {
        code: 'MORI F10',
        name: 'Montserrat',
        cssVar: '--mori-f10',
        fallbackFamily: 'system-ui, sans-serif',
        styleNote: 'Hình khối gọn gàng, phù hợp phong cách hiện đại trẻ trung.',
      },
      {
        code: 'MORI F11',
        name: 'Josefin Sans',
        cssVar: '--mori-f11',
        fallbackFamily: 'system-ui, sans-serif',
        styleNote: 'Nét hình học thanh thoát, tạo cảm giác rộng rãi và tinh giản.',
      },
      {
        code: 'MORI F12',
        name: 'Quicksand',
        cssVar: '--mori-f12',
        fallbackFamily: 'system-ui, sans-serif',
        styleNote: 'Đầu nét bo tròn thân thiện, nhẹ nhàng mà vẫn hiện đại.',
      },
    ],
  },
  {
    id: 'rustic',
    title: 'Nhóm 4 – Font mộc mạc, tự nhiên',
    description:
      'Những kiểu chữ nhẹ nhàng, gần gũi, phù hợp với giấy bã mía và phong cách cưới lấy cảm hứng từ thiên nhiên.',
    fonts: [
      {
        code: 'MORI F13',
        name: 'Merriweather',
        cssVar: '--mori-f13',
        fallbackFamily: 'Georgia, serif',
        styleNote: 'Chân chữ ấm áp, vững chãi trên nền giấy xơ bã mía nguyên bản.',
      },
      {
        code: 'MORI F14',
        name: 'Nunito Sans-Rounded',
        cssVar: '--mori-f14',
        fallbackFamily: 'system-ui, sans-serif',
        styleNote: 'Êm dịu và mộc mạc, thích hợp cho phần nội dung giờ giấc tiệc cưới.',
      },
      {
        code: 'MORI F15',
        name: 'Mali Hand',
        cssVar: '--mori-f15',
        fallbackFamily: 'cursive',
        styleNote: 'Nét viết tay mộc mạc tự nhiên, hợp tiệc cưới sân vườn ngoài trời.',
      },
      {
        code: 'MORI F16',
        name: 'Patrick Hand',
        cssVar: '--mori-f16',
        fallbackFamily: 'cursive',
        styleNote: 'Chữ viết tay chân phương, mang hơi thở gần gũi và ấm áp.',
      },
    ],
  },
]
