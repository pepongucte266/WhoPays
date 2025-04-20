// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Lấy thông tin từ biến môi trường của Vite
// Các biến này cần được định nghĩa trong file .env (cho local)
// và trong Environment Variables trên Vercel (cho production)
// Lưu ý: Biến môi trường phía client trong Vite phải bắt đầu bằng VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Kiểm tra xem biến môi trường đã được cung cấp chưa
if (!supabaseUrl || !supabaseAnonKey) {
  // Thông báo lỗi rõ ràng hơn
  const errorMessage = `Supabase URL and Anon Key are required.
  Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your .env file (for local development) or Environment Variables (for production).`
  console.error(errorMessage) // Log lỗi ra console để dễ debug
  // Có thể hiển thị lỗi này cho người dùng hoặc dừng ứng dụng tùy theo yêu cầu
  // Ví dụ đơn giản là throw Error:
  throw new Error(errorMessage)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: Xử lý thay đổi trạng thái xác thực toàn cục
// supabase.auth.onAuthStateChange((event, session) => {
//   console.log('Supabase auth state change:', event, session)
//   // Cập nhật trạng thái người dùng trong Pinia store tại đây
// })
