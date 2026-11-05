export const statusLabel: Record<string, string> = {
  SUBMITTED: 'Đã gửi yêu cầu',
  CONFIRMED: 'Đã xác nhận',
  IN_FULFILLMENT: 'Đang thực hiện',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
  PENDING: 'Chờ xử lý',
  IN_PRODUCTION: 'Đang in ấn & chế tác',
  QUALITY_CHECK: 'Đang kiểm định chất lượng',
  READY_TO_SHIP: 'Sẵn sàng giao hàng',
  SHIPPED: 'Đang vận chuyển',
  DELIVERED: 'Đã giao thành công',
  IN_PROGRESS: 'Đang dựng bản thiệp số',
  READY_FOR_HANDOVER: 'Sẵn sàng bàn giao thiệp số',
  HANDED_OVER: 'Đã bàn giao thiệp số',
  REQUESTED: 'Đang chờ xưởng duyệt hủy',
  APPROVED: 'Đã chấp thuận hủy',
  DENIED: 'Xưởng từ chối hủy',
}

export function formatVnd(val: string | null, fallback = '0 ₫'): string {
  if (!val) return fallback
  const num = Number(val)
  return isNaN(num) ? fallback : `${num.toLocaleString('vi-VN')} ₫`
}
