# systemPatterns.md

## Mẫu kiến trúc & quyết định kỹ thuật

Tài liệu này mô tả kiến trúc tổng thể, các quyết định kỹ thuật then chốt, mẫu thiết kế, quan hệ giữa các thành phần và luồng triển khai quan trọng.

### Kiến trúc tổng thể

- Ứng dụng web SPA sử dụng Vue 3 + TypeScript.
- Quản lý trạng thái với Pinia.
- Giao diện với Tailwind CSS.
- Kết nối Supabase cho xác thực và lưu trữ dữ liệu.
- Gọi API VietQR bên ngoài để tạo chuỗi mã QR thanh toán.

### Thành phần chính

- Trang đăng nhập/đăng ký (LoginView, RegisterView)
- Trang chính (HomeView) hiển thị, tìm kiếm, quản lý tài khoản.
- Thành phần nhập liệu thủ công (ManualInputForm) và import Excel (ExcelImport).
- Thành phần hiển thị mã QR (QrDisplay), quản lý tài khoản (SavedAccounts).

### Mẫu thiết kế

- Tách biệt rõ ràng giữa view, component, store, utils.
- Sử dụng composition API, reactive state.
- Ưu tiên code dễ bảo trì, mở rộng.

### Luồng triển khai quan trọng

- Đăng nhập → HomeView → Nhập/Import tài khoản → Gọi API VietQR để sinh mã QR → Lưu & quản lý.
- Mọi thao tác đều xác thực qua Supabase.

### Quyết định kỹ thuật then chốt

- Chọn Supabase để giảm chi phí backend, tăng tốc phát triển.
- Ưu tiên đơn giản hóa UI/UX cho nhân viên tiệm tóc.
