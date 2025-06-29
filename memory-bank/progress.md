## 2025-06-08: Debug responsive DataTable & PrimeVue, cấu hình typescript, xác định nguyên nhân layout

- **Vấn đề:** DataTable PrimeVue không responsive trên mobile dù đã bỏ min-width, thử mọi cấu hình component.
- **Các bước kiểm tra & giải pháp:**
  - Tạo view trắng (PrimeTableTest.vue) chỉ chứa DataTable, không layout, để loại trừ ảnh hưởng layout cha.
  - Thêm route test vào router, xác nhận DataTable vẫn không responsive.
  - Kiểm tra toàn bộ CSS global (base.css, main.css), xác nhận không có overflow, width cố định, hoặc max-w gây lỗi.
  - Kiểm tra meta viewport trong index.html, xác nhận đã đúng.
  - Sửa khai báo module "\*.vue" trong env.d.ts để loại bỏ lỗi import .vue khi dùng typescript.
  - Import và đăng ký DataTable, Column đúng chuẩn trong script setup.
  - Xác định nguyên nhân cuối cùng: layout cha (App.vue, main) dùng flex, thiếu w-full/min-w-0, hoặc justify-center khiến DataTable không thể scroll ngang hoặc co giãn đúng.
- **Kết luận:** Responsive DataTable phụ thuộc vào layout cha. Nếu cha dùng flex hoặc justify-center mà thiếu w-full/min-w-0 thì DataTable sẽ không scroll ngang được. Đã hướng dẫn sửa layout App.vue để khắc phục triệt để.
- **Kết quả:** Đã xác định và hướng dẫn giải pháp chuẩn để mọi DataTable PrimeVue responsive đúng trên mobile, không còn lỗi import .vue, không còn lỗi type typescript.

---

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
  - `tailwind.config.js`: Cập nhật thuộc tính `content` để bao gồm tất cả các tệp nguồn cần thiết. (Đã thực hiện)
  - Đổi tên `postcss.config.js` thành `postcss.config.cjs` để khắc phục lỗi build "ReferenceError: module is not defined in ES module scope". (Đã thực hiện)
  - `postcss.config.cjs`: Cập nhật để sử dụng plugin `@tailwindcss/postcss` (thay vì `tailwindcss` trực tiếp) theo yêu cầu của phiên bản Tailwind CSS hiện tại, nhằm khắc phục lỗi build "[postcss] It looks like you're trying to use `tailwindcss` directly...".
- **Mục tiêu:** Đảm bảo ứng dụng hiển thị toàn màn hình trên thiết bị di động, loại bỏ cuộn không mong muốn ở cấp độ layout gốc, duy trì khoảng đệm cho nội dung và sửa lỗi cấu hình Tailwind CSS & PostCSS để các lớp tiện ích hoạt động và quá trình build thành công.

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

---

## 2025-06-29: Cập nhật chức năng tải file mẫu Excel & dọn dẹp code

- Đã hoàn thành cập nhật chức năng tải file mẫu trong `ExcelImport.vue`: Khi bấm nút "Tải File Mẫu" sẽ tải trực tiếp file tĩnh `WhoPays_Import_QR.xlsx` từ `src/assets`, không còn tạo file động bằng code.
- Đã loại bỏ import `XLSX` không còn sử dụng trong file này.
- Đã kiểm tra lại toàn bộ luồng import Excel, xác nhận không ảnh hưởng đến các chức năng khác.
- Đã xác nhận không còn file SavedAccounts.vue trong src/components/.
- Đã kiểm tra toàn bộ mã nguồn, không còn bất kỳ reference (import, sử dụng) nào đến SavedAccounts.vue.
- Đã dọn sạch hoàn toàn code liên quan, đảm bảo không còn code thừa hoặc nhầm lẫn về popup chọn tài khoản.
- Memory Bank đã cập nhật để phản ánh trạng thái này.

**Ghi chú:** File SavedAccounts.vue đã deprecated, có thể xóa khỏi project để tránh nhầm lẫn hoặc code thừa.
