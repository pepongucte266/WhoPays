# progress.md

## Tiến độ & trạng thái dự án

Tài liệu này ghi nhận tiến độ, trạng thái hiện tại, những phần đã hoàn thành, còn lại, vấn đề tồn đọng và lịch sử quyết định.

### Đã hoàn thành

- Khởi tạo Memory Bank với đầy đủ các file cốt lõi.
- Đã ghi nhận bối cảnh, mục tiêu, kiến trúc, công nghệ và trạng thái hoạt động.
- Thay thế Heroicons bằng PrimeIcons trong toàn bộ dự án và gỡ bỏ dependency không cần thiết.
- Tích hợp API VietQR để tạo mã QR thay thế cho việc tạo cục bộ.
- Cập nhật các store và utils liên quan.
- Dọn dẹp code tạo QR cục bộ không còn sử dụng.
- Cập nhật Memory Bank (systemPatterns, techContext, activeContext).

### Còn lại

- Cập nhật chi tiết tiến độ khi phát triển từng tính năng.
- Ghi nhận các vấn đề phát sinh, quyết định mới.
- Kiểm tra lại luồng nhập Excel để đảm bảo `nickname` được cung cấp cho API.

### Trạng thái hiện tại

- Chức năng tạo QR đã chuyển sang sử dụng API VietQR.
- Memory Bank đã được cập nhật.

### Vấn đề tồn đọng

- Cần xác nhận luồng nhập Excel cung cấp đủ dữ liệu `nickname` cho API VietQR.

### Lịch sử quyết định

- Xóa file memory-bank lỗi, tạo lại đúng là thư mục.
- Chuẩn hóa quy trình cập nhật Memory Bank.
