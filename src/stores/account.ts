import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from './auth' // Import authStore để lấy user ID

// Định nghĩa cấu trúc dữ liệu cho một tài khoản đã lưu
// Lưu ý: Cần khớp với cấu trúc bảng 'user_accounts' trên Supabase
export interface SavedAccount {
  id: number // ID tự tăng từ Supabase
  user_id: string // Khóa ngoại liên kết với bảng auth.users
  bank_bin: string
  account_number: string
  nickname?: string // Tên gợi nhớ (tùy chọn)
  created_at: string // Thời gian tạo (Supabase tự quản lý)
}

export const useAccountStore = defineStore('account', () => {
  // --- Dependencies ---
  const authStore = useAuthStore()

  // --- State ---
  const accounts = ref<SavedAccount[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // --- Actions ---

  /**
   * Lấy danh sách tài khoản đã lưu của người dùng hiện tại.
   */
  async function fetchAccounts() {
    if (!authStore.userId) {
      console.warn('User not logged in, cannot fetch accounts.')
      accounts.value = [] // Xóa danh sách nếu người dùng đăng xuất
      return
    }

    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('user_accounts') // Tên bảng đã đổi theo yêu cầu
        .select('*')
        .eq('user_id', authStore.userId) // Chỉ lấy tài khoản của user hiện tại
        .order('created_at', { ascending: false }) // Sắp xếp theo mới nhất

      if (fetchError) throw fetchError

      accounts.value = data || []
      console.log('Fetched user accounts:', accounts.value)
    } catch (err: unknown) {
      console.error('Error fetching accounts:', err)
      error.value =
        err instanceof Error ? err.message : 'Lỗi không xác định khi tải danh sách tài khoản.'
      accounts.value = [] // Clear accounts on error
    } finally {
      loading.value = false
    }
  }

  /**
   * Thêm một tài khoản mới vào danh sách lưu.
   * @param newAccount Dữ liệu tài khoản mới (không cần id, user_id, created_at)
   */
  async function addAccount(
    newAccount: Omit<SavedAccount, 'id' | 'user_id' | 'created_at'>,
  ): Promise<boolean> {
    if (!authStore.userId) {
      error.value = 'Bạn cần đăng nhập để lưu tài khoản.'
      return false
    }

    // Kiểm tra trùng lặp (cùng BIN và số tài khoản)
    const exists = accounts.value.some(
      (acc) =>
        acc.bank_bin === newAccount.bank_bin && acc.account_number === newAccount.account_number,
    )
    if (exists) {
      error.value = 'Tài khoản này đã được lưu trước đó.'
      return false
    }

    loading.value = true
    error.value = null
    try {
      const { data, error: insertError } = await supabase
        .from('user_accounts')
        .insert([{ ...newAccount, user_id: authStore.userId }]) // Thêm user_id
        .select() // Trả về bản ghi đã thêm
        .single() // Chỉ mong đợi một bản ghi trả về

      if (insertError) throw insertError

      if (data) {
        accounts.value.unshift(data) // Thêm vào đầu danh sách để hiển thị mới nhất
        console.log('Account added successfully:', data)
        return true
      }
      return false
    } catch (err: unknown) {
      console.error('Error adding account:', err)
      error.value = err instanceof Error ? err.message : 'Lỗi không xác định khi thêm tài khoản.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa một tài khoản đã lưu.
   * @param accountId ID của tài khoản cần xóa
   */
  async function deleteAccount(accountId: number): Promise<boolean> {
    if (!authStore.userId) {
      error.value = 'Bạn cần đăng nhập để xóa tài khoản.'
      return false
    }

    loading.value = true
    error.value = null
    try {
      const { error: deleteError } = await supabase
        .from('user_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', authStore.userId) // Đảm bảo chỉ user đó mới xóa được

      if (deleteError) throw deleteError

      // Xóa khỏi danh sách state sau khi xóa thành công trên DB
      accounts.value = accounts.value.filter((acc) => acc.id !== accountId)
      console.log('Account deleted successfully:', accountId)
      return true
    } catch (err: unknown) {
      console.error('Error deleting account:', err)
      error.value = err instanceof Error ? err.message : 'Lỗi không xác định khi xóa tài khoản.'
      return false
    } finally {
      loading.value = false
    }
  }

  // --- Return ---
  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    deleteAccount,
  }
})
