# Active Context (2025-06-29)

## Cập nhật chức năng tải file mẫu Excel (ExcelImport.vue)

- Đã sửa hàm `downloadSampleExcel` trong `src/components/ExcelImport.vue` để khi bấm nút "Tải File Mẫu" sẽ tải trực tiếp file tĩnh `WhoPays_Import_QR.xlsx` từ `src/assets` thay vì tạo file động bằng thư viện XLSX.
- Đã loại bỏ import `XLSX` không còn sử dụng trong file này.
- Đảm bảo trải nghiệm tải file mẫu nhanh, đúng định dạng, không phát sinh lỗi runtime.
- Đã kiểm tra lại toàn bộ luồng import Excel, không ảnh hưởng đến các chức năng khác.

## Xóa hoàn toàn SavedAccounts.vue & dọn sạch reference

- Đã xác nhận không còn file SavedAccounts.vue trong src/components/.
- Đã kiểm tra toàn bộ mã nguồn, không còn bất kỳ reference (import, sử dụng) nào đến SavedAccounts.vue.
- Đã dọn sạch hoàn toàn code liên quan, đảm bảo không còn code thừa hoặc nhầm lẫn về popup chọn tài khoản.
- Memory Bank đã cập nhật để phản ánh trạng thái này.

# Active Context (2025-05-18)

## Khắc phục lỗi hiển thị toàn màn hình trên Mobile (SPA Fullscreen)

- **Vấn đề:** Ứng dụng SPA không hiển thị toàn màn hình trên thiết bị di động, xuất hiện thanh cuộn không mong muốn.
- **Nguyên nhân:**
  - `padding` được áp dụng cho thẻ `#app` trong `src/assets/main.css`, tạo khoảng trống xung quanh nội dung chính.
- **Giải pháp:**
  - Loại bỏ `padding` khỏi `#app` trong `src/assets/main.css`.
  - Đảm bảo `#app` trong `src/assets/main.css` có `min-height: 100vh`, `display: flex`, `flex-direction: column` để chiếm toàn bộ chiều cao và cho phép `#app-container` (trong `App.vue`) co giãn đúng cách.
  - Đảm bảo `html` và `body` trong `src/assets/base.css` có `height: 100%` (hoặc `min-height: 100%`) để tạo nền tảng cho layout toàn màn hình.
  - Áp dụng padding `p-4 md:p-8` (tương đương `1rem` và `2rem`) vào thẻ `main` bên trong `src/App.vue` để tạo khoảng đệm cho nội dung chính, thay vì áp dụng padding cho `#app` gốc.
- **Khắc phục sự cố Tailwind CSS không áp dụng class tiện ích:**
  - **Vấn đề:**
    1. Các class tiện ích của Tailwind (ví dụ: `p-4`, `md:p-8`) không có hiệu lực.
    2. Lỗi build "ReferenceError: module is not defined in ES module scope" khi xử lý `postcss.config.js`.
    3. Lỗi build "[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin..." sau khi sửa lỗi (2).
  - **Nguyên nhân & Giải pháp:**
    - Cập nhật `tailwind.config.js`: Đảm bảo thuộc tính `content` bao gồm các đường dẫn đến tệp nguồn (`./index.html`, `./src/**/*.{vue,js,ts,jsx,tsx}`). (Đã thực hiện)
    - Đổi tên `postcss.config.js` thành `postcss.config.cjs`: Để xử lý lỗi "module is not defined" do dự án sử dụng ES Modules (`"type": "module"` trong `package.json`) trong khi tệp cấu hình PostCSS sử dụng cú pháp CommonJS. (Đã thực hiện)
    - Cập nhật `postcss.config.cjs`: Sử dụng đúng tên plugin `@tailwindcss/postcss` theo yêu cầu của phiên bản Tailwind CSS hiện tại, thay vì `tailwindcss` trực tiếp. Gói `@tailwindcss/postcss` đã có sẵn trong `devDependencies`.
- **Kết quả:** Ứng dụng giờ đây hiển thị toàn màn hình trên thiết bị di động, đồng thời duy trì khoảng đệm hợp lý cho nội dung chính thông qua padding trong `main`. Cấu hình Tailwind CSS và PostCSS đã được điều chỉnh để phù hợp với yêu cầu của phiên bản và kiểu module của dự án, nhằm mục tiêu khắc phục các lỗi build và đảm bảo các lớp tiện ích hoạt động.

---

## Unit test & kiểm thử

- Đã hoàn thiện unit test cho các component: QrDisplay, ManualInputForm, ExcelImport.
- Đã test store (qr), utils (vietqr), kiểm tra action, pure function, mock API/fetch, mock QRCode, mock XLSX.
- Đã mock/stub toàn bộ dependency PrimeVue (PrimeButton, PrimeInputText, PrimeInputNumber, PrimeDialog, PrimeDataTable, PrimeColumn, PrimeSelect).
- Đã xử lý sạch lỗi typescript trong file test (khai báo đúng kiểu, không còn any/jest.Mock, dùng ReturnType<typeof vi.fn>).
- Đã tối ưu test cho môi trường CI/CD: không phụ thuộc DOM thực, không phụ thuộc file thật, không lỗi khi chạy trên môi trường headless.
- Đã kiểm tra lại coverage, các case chính đều pass, không còn failed case hoặc lỗi typescript.
- Sẵn sàng mở rộng test cho các component, store, utils còn lại nếu cần.

---

## Popup chọn tài khoản đã lưu & Quick Add

- Danh sách tài khoản đã lưu không còn xuất hiện ở HomeView.vue.
- Nút "Chọn nhanh tài khoản đã lưu" (quick add, icon user-plus) đã được chuyển vào ManualInputForm.vue.
- Khi bấm nút này, popup PrimeDialog mở ra, hiển thị danh sách tài khoản đã lưu (PrimeDataTable).
- Khi chọn tài khoản, popup tự đóng và dữ liệu được bind xuống form tạo QR thủ công.
- Không còn code popup chọn tài khoản hoặc SavedAccounts ở ngoài ManualInputForm.vue.
- File SavedAccounts.vue đã được đánh dấu là deprecated, có thể xóa khỏi project nếu muốn.
- Đã dọn dẹp code thừa, loại bỏ các biến, hàm, import, template không còn sử dụng liên quan đến popup tài khoản.

## Tổng quan luồng tạo QR thủ công

- Người dùng nhập thông tin hoặc chọn nhanh tài khoản đã lưu từ popup.
- Dữ liệu bind trực tiếp vào qrStore.manualInput.
- Nhấn "Tạo QR" sẽ gọi generateSingleQrCode, hiển thị popup QR.
- Giao diện sử dụng PrimeVue cho dialog, button, datatable, input.

## Phân quyền & Tự động cập nhật tài khoản (2025-04-26)

- **Phân quyền:**
  - User thường chỉ xem/quản lý tài khoản của mình.
  - User có role 'manager' (lưu trong `app_metadata.role` trên Supabase) có thể xem tất cả tài khoản.
  - Logic kiểm tra role được thực hiện trong `accountStore.fetchAccounts`.
- **Tự động cập nhật:**
  - `accountStore` giờ đây có `watch` theo dõi `authStore.userId`.
  - Khi user đăng nhập/thay đổi, `fetchAccounts` được gọi tự động để lấy đúng danh sách tài khoản (theo quyền).
  - Khi user đăng xuất, state `accounts` được clear.
  - Điều này giải quyết lỗi không hiển thị đúng danh sách tài khoản khi đổi user.
