export function WeddingEstimator() {
  return (
    <div className="estimator-result-card">
      <div className="estimator-result-top">
        <span className="estimator-summary-tag">BÁO GIÁ THEO MẪU</span>
        <h3 className="estimator-summary-title">Cùng xưởng chốt quy cách phù hợp</h3>
        <p className="estimator-summary-subtitle">
          Giá phụ thuộc vào mẫu, số lượng và phần hoàn thiện. MORI sẽ xác nhận từng hạng mục trước khi bạn quyết định.
        </p>
      </div>
      <div className="estimator-breakdown-lines">
        <div className="breakdown-line"><span>Chọn phong cách</span><strong>Xem các mẫu hiện có</strong></div>
        <div className="breakdown-line"><span>Chốt số lượng và quy cách</span><strong>Theo nhu cầu của bạn</strong></div>
        <div className="breakdown-line"><span>Nhận thông tin chi phí</span><strong>Sau khi xưởng xác nhận</strong></div>
      </div>
      <div className="estimator-grand-total">
        <span className="grand-total-label">Giá và thời gian thực hiện</span>
        <span className="grand-total-vnd">Đang cập nhật</span>
      </div>
      <p className="estimator-notice-note">Thông tin được xác nhận theo mẫu và lịch sản xuất thực tế.</p>
      <a href="/assistant" className="estimator-cta-btn">Trao đổi với MORI <span aria-hidden="true">→</span></a>
    </div>
  )
}
