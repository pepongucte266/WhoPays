// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Lấy thông tin từ biến môi trường hoặc hardcode (ít khuyến khích hơn cho key)
// Trong thực tế, nên dùng biến môi trường (.env)
const supabaseUrl = 'https://wzcpsznsksrqiwtjuxoq.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Y3Bzem5za3NycWl3dGp1eG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjg5MDIsImV4cCI6MjA1ODkwNDkwMn0.W9rrnokCFCCcmOQ-eBsOBHJQoguMMxcKE0ww2Ha7axw'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: Xử lý thay đổi trạng thái xác thực toàn cục
// supabase.auth.onAuthStateChange((event, session) => {
//   console.log('Supabase auth state change:', event, session)
//   // Cập nhật trạng thái người dùng trong Pinia store tại đây
// })
