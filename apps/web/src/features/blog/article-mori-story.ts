import type { BlogArticle, BlogBlock } from './blog-types'
import { moriStoryOpeningBlocks } from './article-mori-story-blocks'

const moriStoryClosingBlocks: BlogBlock[] = [
  {
    type: 'heading',
    id: 'khi-cong-nghe-giup-khoang-cach-gan-hon',
    level: 2,
    text: 'Khi công nghệ giúp khoảng cách trở nên gần hơn',
  },
  {
    type: 'paragraph',
    text: 'Ngày nay, không phải cặp đôi nào cũng có điều kiện trực tiếp đến cửa hàng để chọn thiệp, đặc biệt khi nơi sinh sống và địa điểm sản xuất cách xa nhau. MORI được định hướng phát triển theo mô hình kinh doanh trực tuyến, với website là nơi khách hàng có thể tham khảo mẫu, tìm hiểu chất liệu, trao đổi yêu cầu và đặt hàng.',
  },
  {
    type: 'paragraph',
    text: 'Nhóm cũng dự kiến ứng dụng AI Chatbot để hỗ trợ tư vấn ban đầu, gợi ý mẫu thiệp phù hợp với phong cách và ngân sách. Bên cạnh đó, chức năng xem trước mô phỏng 3D được nghiên cứu nhằm giúp khách hàng hình dung rõ hơn kiểu dáng và bố cục thiệp trước khi xác nhận.',
  },
  {
    type: 'paragraph',
    text: 'Tuy nhiên, chúng mình không xem công nghệ là yếu tố thay thế sự quan tâm giữa con người với nhau. Phía sau mỗi yêu cầu chỉnh sửa vẫn cần một người lắng nghe, kiểm tra và hoàn thiện thiết kế. Phía sau mỗi đơn hàng vẫn cần sự cẩn thận để những thông tin quan trọng được thể hiện chính xác.',
  },
  {
    type: 'paragraph',
    text: 'Với MORI, công nghệ chỉ thực sự có ý nghĩa khi giúp quá trình chuẩn bị ngày cưới của hai bạn trở nên nhẹ nhàng và thuận tiện hơn.',
  },
  {
    type: 'heading',
    id: 'loi-moi-khong-gioi-han-boi-khoang-cach',
    level: 2,
    text: 'Bởi lời mời chân thành không bị giới hạn bởi khoảng cách',
  },
  {
    type: 'paragraph',
    text: 'Có những người thân ở ngay gần để cô dâu chú rể có thể tự tay trao thiệp. Nhưng cũng có những người bạn đang làm việc tại một thành phố khác, những người họ hàng ở xa hay những người dù không thể gặp thường xuyên vẫn luôn được nhớ đến.',
  },
  {
    type: 'paragraph',
    text: 'Từ thực tế đó, MORI định hướng phát triển cả thiệp cưới giấy và thiệp cưới điện tử, cùng các gói kết hợp có thiết kế đồng bộ. Thiệp giấy giữ lại cảm giác trang trọng của một lời mời trao tận tay. Thiệp điện tử giúp hai bạn chia sẻ thông tin ngày cưới thuận tiện hơn với những người ở xa.',
  },
  {
    type: 'paragraph',
    text: 'Hai hình thức khác nhau nhưng cùng hướng đến một điều: để lời mời được gửi đi một cách phù hợp, dù khoảng cách giữa mọi người gần hay xa. Bởi suy cho cùng, điều quan trọng không phải khách mời nhận được tấm thiệp bằng cách nào, mà là cảm giác được nhớ đến và trân trọng khi nhận lời mời ấy.',
  },
  {
    type: 'heading',
    id: 'mori-hanh-trinh-dang-viet-tiep',
    level: 2,
    text: 'MORI – Một hành trình đang được viết tiếp',
  },
  {
    type: 'paragraph',
    text: 'MORI Wedding Studio hiện vẫn là một dự án kinh doanh đang trong quá trình nghiên cứu và hoàn thiện. Chúng mình biết rằng từ một ý tưởng đến một sản phẩm thực tế là cả một hành trình. Để tạo nên một tấm thiệp đẹp, không chỉ cần một bản thiết kế tốt mà còn cần chất liệu phù hợp, kỹ thuật in, sự cẩn thận trong từng công đoạn và một quy trình phục vụ đáng tin cậy.',
  },
  {
    type: 'paragraph',
    text: 'Sẽ còn những điều cần thử nghiệm, điều chỉnh và học hỏi. Nhưng chính quá trình ấy giúp nhóm hiểu rõ hơn giá trị mà MORI muốn theo đuổi. Đó không đơn thuần là kinh doanh thiệp cưới, mà là mong muốn góp một phần nhỏ vào những khoảnh khắc quan trọng của mỗi cặp đôi.',
  },
  {
    type: 'paragraph',
    text: 'Chúng mình muốn mỗi tấm thiệp khi được trao đi đều thể hiện sự chỉn chu, sự trân trọng và một chút dấu ấn riêng. Muốn khách hàng có thể lựa chọn sản phẩm phù hợp với phong cách, ngân sách và những điều mình thật sự quan tâm. Và trên hết, chúng mình mong MORI sẽ trở thành một thương hiệu được nhớ đến không chỉ vì những mẫu thiệp đẹp, mà còn bởi sự chân thành trong cách tạo ra và gửi trao từng sản phẩm.',
  },
  {
    type: 'heading',
    id: 'loi-ket-nhung-lua-chon-nho',
    level: 2,
    text: 'Lời kết: Gửi những điều đẹp đẽ từ những lựa chọn nhỏ',
  },
  {
    type: 'image',
    image: {
      src: '/images/blog/story-closing-envelope.jpg',
      width: 1672,
      height: 941,
      alt: 'Bàn tay nhẹ nhàng đặt tấm thiệp cưới kem kèm hoa bi trắng vào phong bì giấy bã mía có dấu sáp dưới ánh nắng chiều',
      caption: 'Một tấm thiệp nhỏ được giữ lại trong ngăn bàn hay kệ sách luôn bắt đầu từ sự chân thành của người gửi.',
    },
  },
  {
    type: 'paragraph',
    text: 'Một lễ cưới có thể bắt đầu bằng rất nhiều công việc chuẩn bị. Nhưng đối với những người được mời tham dự, đôi khi mọi cảm xúc lại bắt đầu từ khoảnh khắc nhận được một tấm thiệp. Tấm thiệp ấy có thể được giữ lại trong một ngăn bàn, đặt trên kệ sách hoặc đơn giản là được mở ra cùng một nụ cười. Dù nhỏ bé, nó vẫn từng là lời mời chân thành dành cho một ngày đặc biệt.',
  },
  {
    type: 'paragraph',
    text: 'MORI Wedding Studio được hình thành từ niềm tin giản dị rằng những điều đẹp đẽ không nhất thiết phải thật lớn lao; đôi khi, chúng bắt đầu từ cách chúng ta trân trọng những chi tiết nhỏ nhất. Với MORI, mỗi tấm thiệp không chỉ mang thông tin về một ngày cưới, mà còn mang theo sự quan tâm đến người nhận, câu chuyện của người gửi và những lựa chọn được thực hiện bằng sự chân thành.',
  },
  {
    type: 'callout',
    label: 'MORI Wedding Studio',
    text: 'Giữ trọn yêu thương, lan tỏa điều xanh.',
  },
  {
    type: 'quote',
    text: 'Một tấm thiệp nhỏ. Một lời mời chân thành. Một khởi đầu đáng nhớ.',
  },
]

export const articleMoriStory: BlogArticle = {
  slug: 'cau-chuyen-mori-wedding-studio',
  order: '04',
  category: 'story',
  categoryLabel: 'Câu chuyện MORI',
  title: 'MORI Wedding Studio – Khi một tấm thiệp nhỏ mang theo những điều lớn lao',
  italicAccent: 'Giữ trọn yêu thương, lan tỏa điều xanh.',
  subtitle:
    'Câu chuyện hình thành MORI Wedding Studio: từ trăn trở về chất liệu xơ bã mía, trải nghiệm đặt thiệp từ xa với mô phỏng 3D đến sự chăm chút thủ công sau từng đơn hàng.',
  excerpt:
    'Những điều đẹp đẽ không nhất thiết phải thật lớn lao; đôi khi chúng bắt đầu từ cách trân trọng từng chi tiết nhỏ trên tấm thiệp mời gửi đến những người thương yêu.',
  readMinutes: 7,
  publishedLabel: 'Câu chuyện thương hiệu · 04',
  cover: {
    src: '/images/blog/story-sunlit-seal.jpg',
    width: 1672,
    height: 941,
    alt: 'Phong bì thiệp cưới giấy bã mía thắt dây gai cùng nhánh hoa bi trắng và dấu sáp xanh olive bên khung cửa nắng sớm',
    caption: 'Mỗi tấm thiệp tại MORI bắt đầu từ câu hỏi giản dị: làm sao để lời mời vừa mang dấu ấn riêng, vừa tử tế với chất liệu.',
  },
  blocks: [...moriStoryOpeningBlocks, ...moriStoryClosingBlocks],
  cta: {
    label: 'Khám phá bộ sưu tập MORI',
    href: '/collections',
    secondaryLabel: 'Trò chuyện cùng trợ lý gợi ý',
    secondaryHref: '/assistant',
  },
}
