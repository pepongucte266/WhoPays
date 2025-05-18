## 2025-05-18: Khắc phục lỗi hiển thị toàn màn hình trên Mobile (SPA Fullscreen)

- **Thay đổi CSS:**
  - `src/assets/main.css`:
    - Loại bỏ `padding` khỏi `#app`.
    - Thêm `min-height: 100vh`, `display: flex`, `flex-direction: column` cho `#app` để đảm bảo nó chiếm toàn bộ chiều cao và cho phép nội dung con co giãn đúng cách.
  - `src/assets/base.css`:
    - Thêm `height: 100%` cho `html`.
    - Thay đổi `min-height: 100vh` thành `height: 100%` cho `body` (trình định dạng có thể giữ lại cả hai).
  - `src/App.vue`:
    - Thêm padding `p-4 md:p-8` vào thẻ `main` để tạo khoảng đệm cho nội dung chính.
- **Khắc phục sự cố Tailwind CSS:**
  - `tailwind.config.js`: Cập nhật thuộc tính `content` để bao gồm tất cả các tệp nguồn cần thiết.
  - `postcss.config.js`: Sửa tên plugin thành `tailwindcss`.
- **Mục tiêu:** Đảm bảo ứng dụng hiển thị toàn màn hình trên thiết bị di động, loại bỏ cuộn không mong muốn ở cấp độ layout gốc, duy trì khoảng đệm cho nội dung và sửa lỗi cấu hình Tailwind CSS để các lớp tiện ích hoạt động.

---

## 2025-04-20: Dọn dẹp code, popup chọn tài khoản, quick add

- Đã loại bỏ hoàn toàn phần danh sách tài khoản đã lưu khỏi HomeView.vue.
- Đã chuyển nút "Chọn nhanh tài khoản đã lưu" (quick add) vào trong ManualInputForm.vue, sử dụng PrimeButton.
- Popup chọn tài khoản đã lưu (PrimeDialog + PrimeDataTable) chỉ còn trong ManualInputForm.vue, khi chọn sẽ bind dữ liệu xuống form.
- Đã xóa toàn bộ code popup chọn tài khoản khỏi HomeView.vue (biến, hàm, template).
- Đã kiểm tra và loại bỏ các import, biến, hàm, component không còn sử dụng liên quan đến SavedAccounts và popup tài khoản trong toàn bộ project.
- File SavedAccounts.vue đã được đánh dấu là deprecated và có thể xóa khỏi project nếu muốn.
- Đảm bảo không còn code thừa, không còn popup chọn tài khoản ở ngoài ManualInputForm.vue.

---

## 2025-04-20: Unit test coverage & typescript clean

- Đã hoàn thiện unit test cho các component chính: QrDisplay, ManualInputForm, ExcelImport.
- Đã viết test cho store (qr), utils (vietqr), kiểm tra các action, pure function, mock API/fetch, mock QRCode, mock XLSX.
- Đã mock/stub toàn bộ dependency PrimeVue (PrimeButton, PrimeInputText, PrimeInputNumber, PrimeDialog, PrimeDataTable, PrimeColumn, PrimeSelect).
- Đã xử lý sạch lỗi typescript trong toàn bộ file test (khai báo đúng kiểu, không còn any/jest.Mock, dùng ReturnType<typeof vi.fn>).
- Đã tối ưu test cho môi trường CI/CD: không phụ thuộc DOM thực, không phụ thuộc file thật, không lỗi khi chạy trên môi trường headless.
- Đã kiểm tra lại coverage, các case chính đều pass, không còn failed case hoặc lỗi typescript.
- Sẵn sàng mở rộng test cho các component, store, utils còn lại nếu cần.

---

**Ghi chú:** File SavedAccounts.vue đã deprecated, có thể xóa khỏi project để tránh nhầm lẫn hoặc code thừa.
