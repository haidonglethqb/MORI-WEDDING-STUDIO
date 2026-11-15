export interface OrderProcessStep {
  code: string
  number: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  imageSrc: string
  imageAlt: string
  imageCaption: string
}

export const ORDER_PROCESS_INTRO =
  '“Mỗi tấm thiệp cưới đều mang theo một câu chuyện riêng. Tại MORI Wedding Studio, chúng mình đồng hành cùng bạn từ lúc lựa chọn mẫu thiệp, hoàn thiện thiết kế cho đến khi nhận được thành phẩm dành cho ngày cưới.”'

export const ORDER_PROCESS_STEPS: OrderProcessStep[] = [
  {
    code: 'BƯỚC 01',
    number: '01',
    title: 'LỰA CHỌN HÌNH THỨC THIỆP',
    paragraphs: ['Khách hàng lựa chọn một trong ba sản phẩm:'],
    bullets: [
      'Thiệp cưới giấy bã mía: Thiệp phẳng hoặc thiệp gấp, kèm phong bì in đồng bộ.',
      'Thiệp cưới online: Thiệp mời dưới dạng website, có đường link để chia sẻ với khách mời.',
      'Combo thiệp giấy và online: Kết hợp hai loại thiệp, được giảm 50% giá bán của phần thiệp online.',
    ],
    imageSrc: '/images/landing/hero-ivory-suite.jpg',
    imageAlt: 'Bộ thiệp cưới giấy bã mía kèm phong bì đồng bộ của MORI',
    imageCaption: 'Thiệp giấy bã mía, thiệp online hoặc combo tiết kiệm 50%',
  },
  {
    code: 'BƯỚC 02',
    number: '02',
    title: 'LỰA CHỌN MẪU VÀ PHONG CÁCH',
    paragraphs: [
      'Khách tham khảo Bộ sưu tập MORI, lựa chọn kiểu thiệp, màu sắc, phong cách và số lượng mong muốn.',
      'Nếu chưa tìm được mẫu phù hợp, khách có thể hỏi Trợ lý AI MORI để được gợi ý theo sở thích, ngân sách hoặc liên hệ nhân viên để thiết kế riêng.',
    ],
    imageSrc: '/images/products/floral/floral-bifold-01.jpg',
    imageAlt: 'Mẫu thiệp cưới phong cách hoa cỏ tại MORI',
    imageCaption: 'Đa dạng kiểu thiệp từ cổ điển, tối giản đến thiết kế riêng',
  },
  {
    code: 'BƯỚC 03',
    number: '03',
    title: 'CUNG CẤP THÔNG TIN THIỆP CƯỚI',
    paragraphs: ['Khách gửi thông tin gồm:'],
    bullets: [
      'Tên cô dâu và chú rể.',
      'Tên cha mẹ hai bên (nếu muốn đưa lên thiệp).',
      'Ngày, giờ tổ chức hôn lễ và tiệc cưới.',
      'Địa điểm tổ chức.',
      'Nội dung lời mời và các ghi chú riêng.',
    ],
    imageSrc: '/images/landing/process-calligraphy.jpg',
    imageAlt: 'Hoàn thiện nội dung lời mời và chữ viết trên thiệp cưới MORI',
    imageCaption: 'Chuẩn bị đầy đủ tên, thời gian, địa điểm và font chữ yêu thích',
  },
  {
    code: 'BƯỚC 04',
    number: '04',
    title: 'XÁC NHẬN YÊU CẦU VÀ BÁO GIÁ',
    paragraphs: [
      'Nhân viên MORI tiếp nhận thông tin, kiểm tra mẫu thiệp, số lượng, quy cách và các yêu cầu cá nhân hóa.',
      'Sau đó gửi báo giá gồm giá thiệp, chi phí thiết kế riêng nếu có, phí vận chuyển dự kiến và tổng tiền cần thanh toán.',
    ],
    imageSrc: '/images/blog/personalize-checklist.jpg',
    imageAlt: 'Kiểm tra quy cách và bảng báo giá chi tiết tại MORI',
    imageCaption: 'Minh bạch từng hạng mục trước khi chốt đơn hàng',
  },
  {
    code: 'BƯỚC 05',
    number: '05',
    title: 'THANH TOÁN ĐƠN HÀNG',
    paragraphs: [
      'Khách kiểm tra lại thông tin và thực hiện thanh toán theo hướng dẫn của MORI. Nếu đơn hàng áp dụng đặt cọc, nhân viên sẽ thông báo rõ số tiền cần cọc và thời điểm thanh toán còn lại trước khi khách xác nhận.',
    ],
    imageSrc: '/images/blog/story-couple-laptop.jpg',
    imageAlt: 'Khách hàng kiểm tra thông tin đơn hàng và thanh toán trực tuyến',
    imageCaption: 'Hỗ trợ MoMo, VNPAY, chuyển khoản QR hoặc COD linh hoạt',
  },
  {
    code: 'BƯỚC 06',
    number: '06',
    title: 'DUYỆT THIẾT KẾ',
    paragraphs: [
      'MORI gửi bản thiết kế 2D để khách kiểm tra tên, ngày giờ, địa điểm, nội dung và bố cục.',
      'Khách phản hồi những chỗ cần sửa. Sau khi khách xác nhận bản cuối, MORI mới chuyển thiệp giấy sang in ấn.',
    ],
    imageSrc: '/images/products/editorial/editorial-flat-02.jpg',
    imageAlt: 'Bản thiết kế thiệp cưới 2D trước khi chuyển sang xưởng in',
    imageCaption: 'Duyệt kỹ bản 2D trước khi in ấn hàng loạt',
  },
  {
    code: 'BƯỚC 07',
    number: '07',
    title: 'SẢN XUẤT VÀ HOÀN THIỆN',
    paragraphs: [
      'Đối với thiệp giấy, MORI tiến hành in thiệp, in phong bì đồng bộ, gia công, kiểm tra chất lượng và đóng gói.',
      'Đối với thiệp online, MORI hoàn thiện nội dung website, kiểm tra đường link và gửi khách xem trước.',
    ],
    imageSrc: '/images/landing/craft-wax-sealing.jpg',
    imageAlt: 'Gia công, đóng dấu sáp và hoàn thiện thiệp cưới tại xưởng MORI',
    imageCaption: 'Gia công tỉ mỉ và kiểm tra chất lượng từng bộ thiệp',
  },
  {
    code: 'BƯỚC 08',
    number: '08',
    title: 'BÀN GIAO VÀ CHĂM SÓC SAU MUA',
    paragraphs: [
      'Thiệp giấy được gửi đến địa chỉ nhận hàng. Thiệp online được bàn giao qua đường link để khách chia sẻ cho người thân, bạn bè.',
      'Nếu gặp vấn đề về sản phẩm, khách có thể liên hệ MORI để được hỗ trợ.',
    ],
    imageSrc: '/images/landing/close-sealed-envelopes.jpg',
    imageAlt: 'Bộ thiệp cưới MORI được đóng gói cẩn thận sẵn sàng bàn giao',
    imageCaption: 'Giao thiệp toàn quốc và đồng hành hỗ trợ sau khi bàn giao',
  },
]
