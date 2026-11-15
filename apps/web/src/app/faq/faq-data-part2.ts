import type { FaqCategory } from './faq-types'

export const FAQ_CATEGORIES_PART2: FaqCategory[] = [
  {
    id: 'orders',
    title: 'Đặt hàng, thanh toán và vận chuyển',
    items: [
      {
        number: 13,
        question: '13. Tôi có thể đặt thiệp MORI bằng cách nào?',
        answers: [
          'Bạn truy cập website MORI, vào Bộ sưu tập để lựa chọn mẫu thiệp, chọn số lượng và thêm sản phẩm vào giỏ hàng. Sau đó nhập thông tin khách hàng, kiểm tra đơn và xác nhận đặt hàng.',
          'Nếu muốn thiết kế riêng, bạn có thể sử dụng Trợ lý AI để tìm ý tưởng hoặc liên hệ nhân viên MORI để được tư vấn.',
        ],
      },
      {
        number: 14,
        question: '14. Tôi cần cung cấp những thông tin gì khi đặt thiệp?',
        answers: [
          'Bạn cần chuẩn bị tên cô dâu – chú rể, ngày giờ tổ chức, địa điểm, nội dung lời mời, số lượng thiệp dự kiến và địa chỉ nhận hàng.',
          'Nếu chưa thống nhất nội dung, bạn có thể bổ sung trong quá trình trao đổi với nhân viên trước khi duyệt thiết kế.',
        ],
      },
      {
        number: 15,
        question: '15. MORI hỗ trợ những phương thức thanh toán nào?',
        answers: [
          'Các phương thức thanh toán sẽ được hiển thị tại bước xác nhận đơn, tùy theo hình thức MORI đang hỗ trợ.',
          'Nếu thanh toán bằng chuyển khoản hoặc mã QR, khách thực hiện giao dịch đến tài khoản chính thức được MORI cung cấp. Nếu có hỗ trợ thanh toán trực tiếp hoặc COD, hệ thống sẽ hiển thị phương thức tương ứng.',
        ],
      },
      {
        number: 16,
        question: '16. Tôi thanh toán bằng chuyển khoản hoặc QR như thế nào?',
        answers: ['Bạn thực hiện theo các bước:'],
        bullets: [
          'Bước 1: Kiểm tra mã đơn và số tiền cần thanh toán.',
          'Bước 2: Mở ứng dụng ngân hàng và quét mã QR hoặc nhập tài khoản nhận.',
          'Bước 3: Kiểm tra tên người nhận, số tiền và nhập nội dung chuyển khoản theo hướng dẫn của MORI.',
          'Bước 4: Xác nhận chuyển khoản và lưu biên lai.',
          'Bước 5: Kiểm tra trạng thái thanh toán hoặc gửi biên lai cho nhân viên nếu được yêu cầu.',
        ],
      },
      {
        number: 17,
        question: '17. Tôi có cần đặt cọc trước khi in thiệp không?',
        answers: [
          'MORI sẽ thông báo điều kiện đặt cọc hoặc thanh toán khi xác nhận đơn hàng. Bạn sẽ được biết rõ số tiền cần thanh toán trước, thời điểm thanh toán phần còn lại và các điều kiện liên quan trước khi đồng ý.',
        ],
      },
      {
        number: 18,
        question: '18. Làm sao để biết MORI đã nhận được tiền?',
        answers: [
          'Sau khi kiểm tra giao dịch, MORI sẽ xác nhận khoản thanh toán và cập nhật trạng thái đơn hàng. Nếu thanh toán chưa được ghi nhận, bạn có thể gửi mã đơn và biên lai để nhân viên kiểm tra.',
        ],
      },
      {
        number: 19,
        question: '19. Nếu chuyển khoản sai nội dung hoặc sai số tiền thì sao?',
        answers: [
          'Bạn vui lòng liên hệ MORI, cung cấp mã đơn hàng và hình ảnh giao dịch. Nhân viên sẽ kiểm tra khoản tiền nhận được và hướng dẫn xử lý trường hợp chênh lệch hoặc thiếu thông tin.',
        ],
      },
      {
        number: 20,
        question: '20. Giá combo thiệp giấy và online được tính như thế nào?',
        answers: [
          'Tổng tiền combo gồm giá thiệp giấy theo số lượng và 50% giá bán của thiệp online. Phí vận chuyển hoặc chi phí phát sinh khác, nếu có, được thể hiện riêng.',
          'Ví dụ minh họa: Nếu thiệp online có giá 200.000 đồng, khi mua combo phần online còn 100.000 đồng. Giá trị thiệp giấy được tính riêng theo đơn hàng.',
        ],
      },
      {
        number: 21,
        question: '21. MORI có giao hàng toàn quốc không?',
        answers: [
          'MORI nhận đơn hàng trên toàn quốc. Thiệp giấy được đóng gói và giao qua đơn vị vận chuyển đến địa chỉ khách cung cấp. Thiệp online được bàn giao thông qua đường link.',
        ],
      },
      {
        number: 22,
        question: '22. Phí vận chuyển được tính như thế nào?',
        answers: [
          'Phí vận chuyển tùy thuộc vào địa chỉ nhận hàng, số lượng thiệp, khối lượng đơn hàng và dịch vụ vận chuyển. MORI sẽ thông báo phí cụ thể trước khi khách xác nhận.',
        ],
      },
      {
        number: 23,
        question: '23. Bao lâu tôi sẽ nhận được thiệp cưới?',
        answers: [
          'Thời gian hoàn thiện phụ thuộc vào mẫu thiệp, số lượng, thời gian duyệt thiết kế và công đoạn in ấn. Sau khi xác nhận đơn, nhân viên MORI sẽ thông báo thời gian hoàn thành và giao hàng dự kiến.',
        ],
      },
      {
        number: 24,
        question: '24. Tôi có thể kiểm tra tiến độ đơn hàng không?',
        answers: [
          'Có. Bạn vào mục Kiểm tra đơn hàng, nhập mã đơn và số điện thoại hoặc email đã dùng khi đặt để xem thông tin và trạng thái xử lý.',
        ],
      },
    ],
  },
  {
    id: 'aftercare',
    title: 'Chỉnh sửa và chăm sóc sau mua',
    items: [
      {
        number: 25,
        question: '25. Tôi có thể thay đổi thông tin sau khi đã duyệt thiết kế không?',
        answers: [
          'Bạn vui lòng liên hệ MORI sớm nhất có thể. Nếu thiệp chưa được in, nhân viên sẽ kiểm tra khả năng chỉnh sửa. Nếu đã chuyển sang sản xuất, MORI sẽ thông báo phương án và chi phí phát sinh nếu có.',
        ],
      },
      {
        number: 26,
        question: '26. Nếu thiệp bị in sai hoặc hư hỏng thì phải làm sao?',
        answers: [
          'Bạn cung cấp mã đơn, hình ảnh sản phẩm và mô tả vấn đề. MORI sẽ đối chiếu bản thiết kế đã duyệt, kiểm tra nguyên nhân và đề xuất hướng xử lý phù hợp.',
        ],
      },
      {
        number: 27,
        question: '27. Nếu đường link thiệp online bị lỗi thì sao?',
        answers: [
          'Bạn liên hệ nhân viên MORI và cung cấp đường link đang gặp vấn đề. MORI sẽ kiểm tra lỗi truy cập hoặc hiển thị và hỗ trợ khắc phục theo phạm vi dịch vụ.',
        ],
      },
      {
        number: 28,
        question: '28. Tôi có thể gửi đánh giá sản phẩm ở đâu?',
        answers: [
          'Bạn có thể gửi phản hồi qua website hoặc các kênh liên hệ chính thức của MORI. Những góp ý của bạn sẽ giúp MORI cải thiện sản phẩm và dịch vụ.',
        ],
      },
    ],
  },
]
