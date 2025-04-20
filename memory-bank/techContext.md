# techContext.md

## Ngữ cảnh công nghệ & thiết lập phát triển

Tài liệu này mô tả các công nghệ sử dụng, thiết lập môi trường phát triển, ràng buộc kỹ thuật và các dependency quan trọng.

### Công nghệ sử dụng

- Vue 3 + TypeScript (Composition API)
- Pinia (quản lý trạng thái)
- Tailwind CSS (giao diện)
- Supabase (auth & database)
- Vite (build tool)
- Vitest (unit test)

### Thiết lập phát triển

- Node.js >= 18.x
- Quản lý package bằng npm
- Cấu hình linting với ESLint, Prettier
- Tự động format code khi lưu

### Ràng buộc kỹ thuật

- Chỉ sử dụng các dependency đã được kiểm duyệt, phổ biến.
- Ưu tiên bảo mật thông tin người dùng.
- Không sử dụng backend tự triển khai, tận dụng Supabase.
- Phụ thuộc vào API VietQR bên ngoài để tạo mã QR.

### Dependency chính

- @vue, @vue-router, pinia, tailwindcss, supabase-js, xlsx, primevue, primeicons, qrcode, vitest, eslint, prettier
- Đã gỡ bỏ: @heroicons/vue

### Mẫu sử dụng công cụ

- VSCode với các extension hỗ trợ Vue, Prettier, ESLint.
- Quản lý môi trường qua file .env (nếu cần).
