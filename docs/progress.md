tiếp tục đi


Chủ thiệp đã chuyển lời mời đang mở sang danh sách khách, và lời đáp cũ vẫn giữ nguyên.

Không xác nhận thì cách trả lời không đổi. Sau khi chuyển, khách đã tự ghi lời đáp không sửa được nữa. Nhóm có trong danh sách vẫn trả lời được. Số người đã ghi trước đó vẫn còn. Trang soạn thiệp có ô xác nhận và nút Chuyển sang danh sách khách khi thiệp đang mở.

Đã kiểm trên Postgres. Khi chưa đăng nhập, trang vẫn hiện Đăng nhập để soạn thiệp của bạn.

Chủ thiệp đã loại được một nhóm khách khỏi số đếm, và lời đáp cũ của nhóm đó vẫn còn.

Loại nhóm cần một lý do. Người khác không loại hộ được. Lời đáp đã ghi không bị xóa, nhưng chỗ của nhóm đó được trả lại cho buổi. Nhóm trong danh sách được đánh dấu đã loại. Trang soạn thiệp có nút Loại khỏi số đếm cạnh từng nhóm.

Đã kiểm trên Postgres. Khi chưa đăng nhập, trang vẫn hiện Đăng nhập để soạn thiệp của bạn.

Chủ thiệp đã mở lại được lời đáp sau khi hạn đã qua, với một hạn mới nằm trước giờ buổi.

Hạn sau giờ buổi thì không được ghi. Khi lời đáp đang đóng, khách không sửa được số người. Sau khi mở lại, khách ghi được lời đáp mới, và hệ thống lưu một dòng kiểm tra cho lần mở lại đó. Trang soạn thiệp có mục Hạn lời đáp và nút Mở lại lời đáp.

Đã kiểm trên Postgres. Khi chưa đăng nhập, trang vẫn hiện Đăng nhập để soạn thiệp của bạn.

Chủ thiệp đã gỡ được một buổi, và lời đáp đã ghi cho buổi đó vẫn còn.

Người khác không gỡ được. Gỡ trên một thiệp khác cũng không tìm thấy buổi. Sau khi gỡ, khách không sửa lời đáp của buổi đó nữa, số người đã ghi vẫn là 2 và trạng thái vẫn là tham dự. Trang soạn thiệp có nút Gỡ buổi cạnh từng buổi còn đang dùng.

Đã kiểm trên Postgres. Khi chưa đăng nhập, trang vẫn hiện Đăng nhập để soạn thiệp của bạn.

Chủ thiệp đã đổi được đường dẫn công khai, và đường dẫn cũ không mở được nữa.

Đường dẫn mới vẫn hiện đúng nội dung thiệp đã xuất bản. Chỉ còn một đường dẫn đang dùng. Gửi lại cùng khóa thì trả về đúng đường dẫn mới, không tạo thêm. Trang soạn thiệp hiện đường dẫn hiện tại và nút Đổi đường dẫn.

Đã kiểm trên Postgres. Khi chưa đăng nhập, trang vẫn hiện Đăng nhập để soạn thiệp của bạn.

Chủ thiệp đã sửa được lời đáp của một nhóm sau khi hạn đã qua, và lần sửa được lưu lại cùng lý do.

Khách không tự đổi số người khi lời đáp đã đóng. Chủ thiệp ghi lại trạng thái và số người mới. Bản ghi giữ trạng thái cũ, số người cũ và lý do. Trang soạn thiệp có nút Sửa thành không tham dự cạnh nhóm đã trả lời.

Đã kiểm trên Postgres. Khi chưa đăng nhập, trang vẫn hiện Đăng nhập để soạn thiệp của bạn.

Chủ thiệp đã tải được danh sách lời đáp, và mỗi lần tải được ghi lại.

Tệp gồm tên nhóm, trạng thái và số người. Nhân viên không có quyền xem lời đáp thì không tải được. Tiêu đề nội bộ không nằm trong tệp. Trang soạn thiệp có liên kết Tải lời đáp khi đã đăng nhập.

Đã kiểm trên Postgres. Khi chưa đăng nhập, trang vẫn hiện Đăng nhập để soạn thiệp của bạn.