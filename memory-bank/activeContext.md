# Active Context: Quản lý danh sách ngân hàng, import Excel và tối ưu UI

## 1. Field name đồng bộ với API

- Toàn bộ hệ thống sử dụng field name gốc từ API VietQR: `bankCode`, `bankName`, `bankShortName`, `caiValue`, `imageId`, ...
- Không còn ánh xạ sang các trường nội bộ như `code`, `name`, `shortName`, `bin`.
- Khi lưu tài khoản, `bank_bin` là `caiValue`, `bank_code` là `bankCode`.

## 2. Store banks và fetch API

- Store `banks.ts` chỉ xử lý dữ liệu đúng với field name gốc.
- Getter `getBankByBin` nhận `caiValue` (BIN), `getBankByCode` nhận `bankCode`.
- Danh sách ngân hàng cho dropdown là `bankSelectOptions` (mỗi item `{ label, value }`).
- Hàm `fetchBanks()` chỉ nên được gọi một lần khi app khởi động (ví dụ trong `App.vue`).
- Các component con (ví dụ: `ManualInputForm.vue`) chỉ lấy dữ liệu từ store, KHÔNG tự gọi lại `fetchBanks()`.

## 3. Tránh gọi API lặp lại

- Nếu gọi `fetchBanks()` ở nhiều nơi (App.vue, component con), API sẽ bị gọi nhiều lần khi reload.
- Đã tối ưu: chỉ gọi ở `App.vue`, các component khác không gọi lại.
- Khi reload trang, API bank-type chỉ được gọi một lần.

## 4. Dropdown ngân hàng

- Dropdown sử dụng đúng `bankSelectOptions` từ store.
- Bind đúng `optionLabel="label"` và `optionValue="value"`.

## 5. Lưu tài khoản

- Khi lưu tài khoản, lấy `bankCode` và `caiValue` từ store để lưu vào DB.
- Đảm bảo không bị trùng lặp tài khoản.

## 6. SQL Supabase

- Để lưu `bank_code` (mã chữ), thêm cột:
  ```sql
  ALTER TABLE user_accounts
  ADD COLUMN bank_code TEXT;
  ```

## 7. Kinh nghiệm debug

- Nếu không hiển thị dropdown ngân hàng: kiểm tra biến lấy từ store, kiểm tra fetchBanks có được gọi đúng chỗ không.
- Nếu API bị gọi nhiều lần: kiểm tra các nơi gọi fetchBanks, chỉ giữ lại ở App.vue hoặc layout cha.

---

## 8. Import tài khoản từ Excel & PrimeVue DataTable

- Đã chuyển toàn bộ bảng danh sách import tài khoản từ Excel sang sử dụng PrimeVue DataTable, PrimeColumn.
- Xử lý selection, thao tác lưu từng dòng, tạo QR, hiển thị lỗi đều qua DataTable.
- Đã sửa lỗi không hiển thị nút "Lưu" khi dùng PrimeVue DataTable (chuyển sang dùng v-slot cho cột thao tác).
- Giao diện đồng bộ theme tối, thao tác trực quan, nút "Lưu" luôn hiển thị đúng.
- Đảm bảo mọi thao tác lưu tài khoản vào Supabase đều hoạt động ổn định, feedback rõ ràng cho người dùng.
