# Active Context (2025-04-20)

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
