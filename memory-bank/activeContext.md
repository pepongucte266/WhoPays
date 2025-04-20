# activeContext.md

## Bối cảnh hoạt động hiện tại

Tài liệu này ghi nhận trạng thái công việc, thay đổi gần đây, bước tiếp theo, quyết định quan trọng, mẫu thiết kế, và các ghi chú học được trong quá trình phát triển.

### Trạng thái hiện tại

- Đã tích hợp API VietQR để tạo mã QR thay vì tạo cục bộ.
- Đã dọn dẹp code tạo QR cục bộ không còn sử dụng.
- Memory Bank đã được cập nhật để phản ánh thay đổi.

### Thay đổi gần đây

- Thêm hàm `fetchVietQRStringFromAPI` vào `src/utils/vietqr.ts` để gọi API VietQR.
- Cập nhật các actions `generateSingleQrCode` và `generateMultipleQrCodes` trong `src/stores/qr.ts` để sử dụng hàm API mới.
- Xóa các hàm và hằng số liên quan đến việc tạo QR cục bộ trong `src/utils/vietqr.ts`.
- Cập nhật `systemPatterns.md` và `techContext.md`.

### Bước tiếp theo

- Cập nhật `progress.md` để ghi nhận hoàn thành tác vụ tích hợp API VietQR.
- Kiểm tra lại luồng nhập liệu từ Excel để đảm bảo cột `nickname` (hoặc tương đương) được xử lý đúng cách cho API.
- Tiếp tục phát triển các tính năng theo kế hoạch.

### Quyết định & lưu ý quan trọng

- Memory Bank là nguồn tham chiếu duy nhất về tiến trình và kiến thức dự án.
- Mọi thay đổi lớn đều phải cập nhật vào đây.
- API VietQR yêu cầu trường `userBankName` (ánh xạ từ `nickname`). Cần đảm bảo trường này luôn có giá trị khi gọi API, đặc biệt là từ nguồn Excel.

### Mẫu thiết kế & ưu tiên

- Ưu tiên đơn giản, rõ ràng, dễ tra cứu.
- Ghi chú ngắn gọn, tập trung vào thông tin quan trọng.

### Ghi chú học được

- Luôn kiểm tra loại file/thư mục trước khi thao tác hệ thống.
- Cần chuẩn hóa quy trình cập nhật Memory Bank.
