export type OnlineStepMockupKind =
  | 'nav-collections'
  | 'browse-grid'
  | 'select-variant'
  | 'add-to-cart'
  | 'review-cart'
  | 'customer-info'
  | 'checkout-confirm'
  | 'approve-and-track'

export interface OnlineOrderingStep {
  code: string
  number: string
  title: string
  paragraphs: string[]
  actionTargetLabel: string
  mockupKind: OnlineStepMockupKind
}

export const ONLINE_ORDERING_INTRO =
  '“Chỉ với vài bước đơn giản, bạn có thể lựa chọn mẫu thiệp yêu thích và gửi yêu cầu đặt hàng trực tiếp trên website MORI. Cùng MORI xem cách thực hiện nhé!”'

export const ONLINE_ORDERING_STEPS: OnlineOrderingStep[] = [
  {
    code: 'BƯỚC 01',
    number: '01',
    title: 'TRUY CẬP WEBSITE',
    paragraphs: [
      'Truy cập website chính thức của MORI và chọn Bộ sưu tập trên thanh menu.',
    ],
    actionTargetLabel: 'Nhấn vào mục “Bộ sưu tập” trên thanh điều hướng',
    mockupKind: 'nav-collections',
  },
  {
    code: 'BƯỚC 02',
    number: '02',
    title: 'LỰA CHỌN MẪU THIỆP',
    paragraphs: [
      'Xem các mẫu thiệp cưới giấy bã mía, thiệp online, combo hoặc Gói Thiết Kế Thiệp Cưới trong bộ sưu tập, chọn mẫu yêu thích để mở trang chi tiết sản phẩm.',
    ],
    actionTargetLabel: 'Chọn mẫu thiệp ưng ý để xem ảnh 2D & bảng giá chi tiết',
    mockupKind: 'browse-grid',
  },
  {
    code: 'BƯỚC 03',
    number: '03',
    title: 'CHỌN QUY CÁCH VÀ SỐ LƯỢNG',
    paragraphs: [
      'Khách xem mô tả, ảnh thực tế 2D, giá theo số lượng, lựa chọn kiểu thiệp phẳng hoặc gấp và số lượng muốn đặt.',
      'Nếu mua thiệp online hoặc combo thiệp giấy kèm thiệp online, khách lựa chọn sản phẩm tương ứng. Giá combo hiển thị rõ phần ưu đãi giảm 50% dành cho thiệp online.',
    ],
    actionTargetLabel: 'Chọn kiểu thiệp, số lượng & tùy chọn Combo giảm 50%',
    mockupKind: 'select-variant',
  },
  {
    code: 'BƯỚC 04',
    number: '04',
    title: 'THÊM VÀO GIỎ HÀNG',
    paragraphs: [
      'Sau khi chọn sản phẩm, khách bấm Thêm vào giỏ hàng (hoặc Đặt thiệp).',
      'Website hiển thị thông báo “Đã thêm sản phẩm vào giỏ hàng” và cập nhật số lượng ngay trên biểu tượng giỏ hàng.',
    ],
    actionTargetLabel: 'Bấm nút “Thêm vào giỏ hàng” để lưu vào đơn',
    mockupKind: 'add-to-cart',
  },
  {
    code: 'BƯỚC 05',
    number: '05',
    title: 'KIỂM TRA GIỎ HÀNG',
    paragraphs: [
      'Khách mở giỏ hàng để kiểm tra tên sản phẩm, hình ảnh, loại thiệp, số lượng, đơn giá, giảm giá combo và tổng tiền.',
      'Có thể thay đổi số lượng hoặc xóa sản phẩm trước khi tiếp tục bấm Thanh toán.',
    ],
    actionTargetLabel: 'Kiểm tra danh sách thiệp và bấm “Thanh toán”',
    mockupKind: 'review-cart',
  },
  {
    code: 'BƯỚC 06',
    number: '06',
    title: 'ĐIỀN THÔNG TIN KHÁCH HÀNG',
    paragraphs: [
      'Khách nhập họ tên, số điện thoại, email, địa chỉ nhận thiệp giấy và ghi chú đặt hàng.',
      'Thông tin cần in trên thiệp được nhập tại biểu mẫu có sẵn hoặc bổ sung qua bước xác nhận với nhân viên.',
    ],
    actionTargetLabel: 'Điền thông tin liên hệ, địa chỉ & mã font chữ (nếu có)',
    mockupKind: 'customer-info',
  },
  {
    code: 'BƯỚC 07',
    number: '07',
    title: 'KIỂM TRA VÀ XÁC NHẬN ĐƠN',
    paragraphs: [
      'Khách kiểm tra tổng tiền, lựa chọn hình thức thanh toán được hỗ trợ (MoMo, VNPAY, Chuyển khoản QR hoặc COD) và nhấn Xác nhận đặt hàng.',
      'Website hiển thị thông báo tiếp nhận đơn cùng mã đơn hàng để tiện tra cứu.',
    ],
    actionTargetLabel: 'Chọn phương thức thanh toán & nhấn “Xác nhận đặt hàng”',
    mockupKind: 'checkout-confirm',
  },
  {
    code: 'BƯỚC 08',
    number: '08',
    title: 'DUYỆT THIẾT KẾ VÀ NHẬN THIỆP',
    paragraphs: [
      'Sau khi đặt hàng, nhân viên MORI liên hệ xác nhận thông tin và gửi bản thiết kế 2D để khách duyệt trước khi in.',
      'Khách có thể dùng mã đơn hàng tra cứu tiến độ bất cứ lúc nào tại trang Kiểm tra đơn hàng.',
    ],
    actionTargetLabel: 'Duyệt bản 2D cùng nhân viên & theo dõi tiến độ đơn',
    mockupKind: 'approve-and-track',
  },
]
