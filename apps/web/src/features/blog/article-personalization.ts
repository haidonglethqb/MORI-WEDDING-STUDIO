import type { BlogArticle, BlogBlock } from './blog-types'
import { personalizationIntroBlocks } from './article-personalization-blocks'

const personalizationDetailBlocks: BlogBlock[] = [
  {
    type: 'heading',
    id: 'vi-sao-chon-mau-co-san',
    level: 2,
    text: '3. Vì sao chọn mẫu có sẵn rồi điều chỉnh là giải pháp đáng cân nhắc?',
  },
  {
    type: 'image',
    image: {
      src: '/images/blog/personalize-couple-table.jpg',
      width: 1536,
      height: 1024,
      alt: 'Cặp đôi cùng xem mẫu thiệp cưới xanh lá và bảng màu trên bàn để chọn chi tiết cần điều chỉnh',
      caption: 'Khi có mẫu sẵn làm điểm tựa, cặp đôi dễ trao đổi trực tiếp những chi tiết muốn giữ lại hoặc thay đổi.',
    },
  },
  {
    type: 'paragraph',
    text: 'Khi chọn mẫu có sẵn, khách hàng đã có một hình dung ban đầu về phong cách, bố cục và hình thức của thiệp. Điều này giúp quá trình trao đổi với nhân viên trở nên cụ thể hơn.',
  },
  {
    type: 'paragraph',
    text: 'Thay vì mất nhiều thời gian mô tả một ý tưởng trừu tượng, hai bạn có thể chỉ ra ngay những chi tiết mình thích hoặc muốn thay đổi.',
  },
  {
    type: 'paragraph',
    text: 'Hình thức này đặc biệt phù hợp với những cặp đôi đang chuẩn bị nhiều công việc cho lễ cưới và muốn kiểm soát tốt thời gian cũng như ngân sách.',
  },
  {
    type: 'heading',
    id: 'mori-ho-tro-ca-nhan-hoa',
    level: 2,
    text: '4. MORI hỗ trợ cá nhân hóa thiệp cưới như thế nào?',
  },
  {
    type: 'paragraph',
    text: 'MORI định hướng xây dựng bộ sưu tập thiệp cưới theo nhiều phong cách để các cặp đôi lựa chọn. Sau khi tìm được mẫu phù hợp, khách hàng có thể gửi yêu cầu điều chỉnh nội dung, màu sắc, hình ảnh hoặc một số chi tiết trang trí.',
  },
  {
    type: 'paragraph',
    text: 'Nhân viên MORI tiếp nhận nhu cầu, trao đổi về những thay đổi có thể thực hiện và hoàn thiện phương án thiết kế. Trong quá trình này, AI có thể hỗ trợ nhân viên tham khảo ý tưởng phối màu, họa tiết hoặc phong cách; việc kiểm tra và hoàn thiện thiết kế vẫn do nhân viên phụ trách.',
  },
  {
    type: 'paragraph',
    text: 'Bản cuối cùng được gửi để khách hàng xem xét, kiểm tra và xác nhận trước khi sản xuất.',
  },
  {
    type: 'heading',
    id: 'luu-y-truoc-khi-chot-thiet-ke',
    level: 2,
    text: '5. Một vài lưu ý trước khi chốt thiết kế',
  },
  {
    type: 'image',
    image: {
      src: '/images/blog/personalize-checklist.jpg',
      width: 1536,
      height: 1024,
      alt: 'Bảng kiểm tra thông tin thiệp cưới đặt bên bộ thiệp Minh Khoa và Như Ý trước khi duyệt bản thiết kế',
      caption: 'Rà soát đủ thông tin gia đình, ngày giờ, địa điểm và phụ kiện giúp hạn chế phải chỉnh sửa nhiều vòng.',
    },
  },
  {
    type: 'paragraph',
    text: 'Để hạn chế chỉnh sửa nhiều lần, hai bạn nên chuẩn bị trước những thông tin quan trọng như ngày giờ tổ chức, địa điểm, cách ghi tên hai bên gia đình và số lượng thiệp dự kiến.',
  },
  {
    type: 'paragraph',
    text: 'Nếu có màu sắc hoặc hình ảnh yêu thích, hãy gửi kèm ví dụ tham khảo. Những thông tin càng rõ ràng sẽ càng giúp nhân viên hiểu đúng mong muốn của hai bạn.',
  },
  {
    type: 'paragraph',
    text: 'Sau khi nhận bản thiết kế cuối cùng, hãy dành thời gian đọc kỹ từng nội dung. Một lỗi nhỏ về tên, thời gian hoặc địa chỉ cũng có thể ảnh hưởng đến toàn bộ đơn hàng.',
  },
  {
    type: 'checklist',
    title: 'Thông tin nên chuẩn bị trước khi gửi yêu cầu điều chỉnh',
    items: [
      'Tên cô dâu – chú rể và cách ghi thông tin hai bên gia đình',
      'Ngày, giờ và địa điểm tổ chức lễ cưới chính xác',
      'Số lượng thiệp dự kiến cần đặt',
      'Màu sắc, kiểu chữ hoặc hình ảnh tham khảo yêu thích',
      'Phụ kiện mong muốn như ruy băng hoặc dấu sáp (nếu có)',
      'Kiểm tra kỹ từng chữ trên bản thiết kế cuối trước khi xác nhận',
    ],
  },
  {
    type: 'quote',
    text: 'Cá nhân hóa không nằm ở việc thay đổi thật nhiều chi tiết, mà ở cách lựa chọn những điều thực sự có ý nghĩa đối với hai người.',
  },
  {
    type: 'paragraph',
    text: 'Cùng MORI Wedding Studio tìm một mẫu thiệp phù hợp và điều chỉnh để tạo nên lời mời mang dấu ấn riêng của hai bạn.',
  },
]

export const articlePersonalization: BlogArticle = {
  slug: 'ca-nhan-hoa-thiep-cuoi',
  order: '03',
  category: 'personalize',
  categoryLabel: 'Cá nhân hóa',
  title: 'Cá nhân hóa thiệp cưới: Không cần thiết kế từ đầu vẫn có thể mang dấu ấn riêng',
  italicAccent: 'Chọn điều thật sự có ý nghĩa với hai người.',
  subtitle:
    'Vì sao điều chỉnh từ một mẫu thiệp có sẵn giúp tiết kiệm thời gian, dễ hình dung kết quả mà vẫn giữ trọn cá tính của cô dâu chú rể.',
  excerpt:
    'Cá nhân hóa thiệp cưới không nhất thiết phải bắt đầu từ trang giấy trắng: chỉ cần điều chỉnh đúng nội dung, bảng màu, kiểu chữ và một chi tiết kỷ niệm vừa vặn.',
  readMinutes: 5,
  publishedLabel: 'Cá nhân hóa thiết kế · 03',
  cover: {
    src: '/images/blog/personalize-moodboard.jpg',
    width: 1536,
    height: 1024,
    alt: 'Bảng gợi ý cá nhân hóa thiệp cưới gồm bảng màu, mẫu giấy bã mía, kiểu chữ và danh mục chi tiết có thể điều chỉnh',
    caption: 'Bảng định hướng điều chỉnh màu sắc, chất liệu giấy và kiểu chữ từ một phom thiệp có sẵn.',
  },
  blocks: [...personalizationIntroBlocks, ...personalizationDetailBlocks],
  cta: {
    label: 'Chọn mẫu để cá nhân hóa',
    href: '/collections',
    secondaryLabel: 'Mở không gian thiết kế',
    secondaryHref: '/workspace',
  },
}
