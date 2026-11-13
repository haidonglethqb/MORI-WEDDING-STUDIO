import type { BlogArticle, BlogBlock } from './blog-types'
import { fiveStylesFirstHalfBlocks } from './article-five-styles-sections'

const fiveStylesSecondHalfBlocks: BlogBlock[] = [
  {
    type: 'heading',
    id: '4-lang-man',
    level: 2,
    text: '4. Lãng mạn: Dịu dàng trong từng đường nét',
  },
  {
    type: 'paragraph',
    text: 'Không ít cặp đôi mong muốn tấm thiệp cưới mang cảm giác nhẹ nhàng như chính câu chuyện tình yêu của mình.',
  },
  {
    type: 'paragraph',
    text: 'Phong cách lãng mạn có thể sử dụng những đường nét mềm mại, hình ảnh mang tính kỷ niệm hoặc bảng màu dịu mắt. Khi phối hợp hợp lý, các chi tiết trang trí sẽ góp phần thể hiện cảm xúc mà không khiến tổng thể trở nên rườm rà.',
  },
  {
    type: 'paragraph',
    text: 'Nếu yêu thích phong cách này nhưng không muốn thiệp quá nhiều hoa văn, hai bạn có thể ưu tiên thiết kế ít họa tiết, sử dụng màu sắc và kiểu chữ làm điểm nhấn.',
  },
  {
    type: 'callout',
    label: 'Phù hợp với',
    text: 'Các cặp đôi thích vẻ đẹp nhẹ nhàng, giàu cảm xúc và có chút riêng tư.',
  },
  {
    type: 'image',
    image: {
      src: '/images/blog/style-romantic-charm.jpg',
      width: 1536,
      height: 1024,
      alt: 'Mẫu thiệp cưới phong cách lãng mạn Minh Khoa và Thanh Trúc với phong bì hồng tro, ruy băng voan và dấu sáp trắng ngà',
      caption: 'Phong cách Lãng mạn: tông hồng phấn dịu, mép giấy xé mềm và dải ruy băng voan nhẹ nhàng.',
    },
  },
  {
    type: 'heading',
    id: '5-thien-nhien-moc-mac',
    level: 2,
    text: '5. Thiên nhiên – mộc mạc: Gần gũi mà vẫn tinh tế',
  },
  {
    type: 'image',
    image: {
      src: '/images/blog/style-rustic-garden.jpg',
      width: 1536,
      height: 1024,
      alt: 'Mẫu thiệp cưới phong cách thiên nhiên mộc mạc Đức Huy và Thanh Mai gấp đôi minh họa đồi xanh và dây thừng mảnh',
      caption: 'Phong cách Thiên nhiên – mộc mạc: minh họa cành lá, sắc xanh olive và chất liệu giấy giàu kết cấu tự nhiên.',
    },
  },
  {
    type: 'paragraph',
    text: 'Phong cách thiên nhiên – mộc mạc thường gợi cảm giác ấm áp thông qua màu sắc và những chất liệu mang vẻ đẹp tự nhiên.',
  },
  {
    type: 'paragraph',
    text: 'Các gam màu xanh olive, xanh lá dịu, be và nâu đất có thể kết hợp cùng thiết kế đơn giản để tạo nên tổng thể hài hòa.',
  },
  {
    type: 'paragraph',
    text: 'Đây cũng là hướng thiết kế phù hợp với dòng thiệp giấy có thành phần xơ bã mía mà MORI đang phát triển.',
  },
  {
    type: 'callout',
    label: 'Phù hợp với',
    text: 'Các cặp đôi yêu thích thiên nhiên, phong cách rustic hoặc lễ cưới có không gian gần gũi.',
  },
  {
    type: 'heading',
    id: 'lam-the-nao-de-chon-phong-cach',
    level: 2,
    text: 'Làm thế nào để chọn được phong cách phù hợp?',
  },
  {
    type: 'paragraph',
    text: 'Trước khi quyết định, hai bạn nên xác định ba điều: phong cách lễ cưới, màu sắc yêu thích và ngân sách dự kiến dành cho thiệp.',
  },
  {
    type: 'paragraph',
    text: 'Tiếp theo, hãy tham khảo một số mẫu trong cùng nhóm phong cách để so sánh. Khi đã tìm được mẫu gần với mong muốn, việc điều chỉnh tên, nội dung, màu sắc và những chi tiết phù hợp sẽ giúp tấm thiệp mang dấu ấn riêng hơn.',
  },
  {
    type: 'paragraph',
    text: 'Tại MORI, các mẫu thiệp được định hướng phân loại theo phong cách để khách hàng dễ dàng tìm kiếm. AI Chatbot trên website dự kiến hỗ trợ gợi ý mẫu theo sở thích và ngân sách, trong khi nhân viên tiếp nhận những yêu cầu điều chỉnh cụ thể.',
  },
  {
    type: 'quote',
    text: 'Thiệp cưới đẹp nhất không phải tấm thiệp có nhiều chi tiết nhất, mà là tấm thiệp khiến cả hai cảm thấy: “Đúng là phong cách của chúng mình.”',
  },
  {
    type: 'paragraph',
    text: 'Khám phá bộ sưu tập thiệp cưới MORI Wedding Studio và lựa chọn thiết kế đồng hành cùng ngày vui của hai bạn.',
  },
]

export const articleFiveStyles: BlogArticle = {
  slug: '5-phong-cach-thiep-cuoi',
  order: '02',
  category: 'style',
  categoryLabel: 'Phong cách',
  title: '5 phong cách thiệp cưới giúp cô dâu chú rể chọn đúng gu cho ngày trọng đại',
  italicAccent: 'Đúng với lễ cưới và sở thích của cả hai.',
  subtitle:
    'Từ Hiện đại – tối giản, Sang trọng, Cổ điển đến Lãng mạn và Thiên nhiên – mộc mạc: cách nhận diện từng nhóm thiết kế và chọn mẫu phù hợp.',
  excerpt:
    'Một tấm thiệp đẹp không cần chạy theo xu hướng mới nhất, mà cần hài hòa với không gian lễ cưới, màu sắc yêu thích và câu chuyện của hai bạn.',
  readMinutes: 6,
  publishedLabel: 'Phong cách thiết kế · 02',
  cover: {
    src: '/images/blog/style-modern-minimalist.jpg',
    width: 1536,
    height: 1024,
    alt: 'Bộ thiệp cưới phong cách hiện đại tối giản tại MORI Wedding Studio với bảng màu xanh rêu và giấy trắng kem',
    caption: 'Bộ sưu tập MORI được phân nhóm theo năm phong cách rõ ràng giúp cặp đôi dễ so sánh và lựa chọn.',
  },
  blocks: [...fiveStylesFirstHalfBlocks, ...fiveStylesSecondHalfBlocks],
  cta: {
    label: 'Khám phá bộ sưu tập 5 phong cách',
    href: '/collections',
    secondaryLabel: 'Nhờ trợ lý AI gợi ý theo gu',
    secondaryHref: '/assistant',
  },
}
