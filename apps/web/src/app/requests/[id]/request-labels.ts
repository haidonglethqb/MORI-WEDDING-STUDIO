export const quoteStateLabel: Record<string, string> = {
  ISSUED: 'Chờ bạn xác nhận',
  ACCEPTED: 'Đã chấp nhận',
  WITHDRAWN: 'Xưởng đã rút',
  EXPIRED: 'Đã hết hạn',
  SUPERSEDED: 'Đã có bản mới',
}

export const proofStateLabel: Record<string, string> = {
  WORKING: 'Xưởng đang chuẩn bị',
  IN_REVIEW: 'Chờ bạn duyệt',
  APPROVED: 'Đã duyệt',
  CHANGES_REQUESTED: 'Cần chỉnh sửa',
  SUPERSEDED: 'Đã có bản mới',
}
