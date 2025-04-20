## 2025-04-20: Dọn dẹp code, popup chọn tài khoản, quick add

- Đã loại bỏ hoàn toàn phần danh sách tài khoản đã lưu khỏi HomeView.vue.
- Đã chuyển nút "Chọn nhanh tài khoản đã lưu" (quick add) vào trong ManualInputForm.vue, sử dụng PrimeButton.
- Popup chọn tài khoản đã lưu (PrimeDialog + PrimeDataTable) chỉ còn trong ManualInputForm.vue, khi chọn sẽ bind dữ liệu xuống form.
- Đã xóa toàn bộ code popup chọn tài khoản khỏi HomeView.vue (biến, hàm, template).
- Đã kiểm tra và loại bỏ các import, biến, hàm, component không còn sử dụng liên quan đến SavedAccounts và popup tài khoản trong toàn bộ project.
- File SavedAccounts.vue đã được đánh dấu là deprecated và có thể xóa khỏi project nếu muốn.
- Đảm bảo không còn code thừa, không còn popup chọn tài khoản ở ngoài ManualInputForm.vue.
