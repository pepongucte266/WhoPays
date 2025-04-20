import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from './auth' // Import authStore để lấy user ID
import { useBanksStore } from './banks' // Import banksStore

// Định nghĩa cấu trúc dữ liệu cho một tài khoản đã lưu
// Bao gồm cả bank_bin và bank_code
export interface SavedAccount {
  id: number // ID tự tăng từ Supabase
  user_id: string // Khóa ngoại liên kết với bảng auth.users
  bank_bin: string // Giữ lại để tương thích và điền form (caiValue)
  bank_code: string // Mã chữ của ngân hàng (TCB, VCB...) (bankCode)
  account_number: string
  nickname?: string // Tên gợi nhớ / Chủ TK (tùy chọn)
  created_at: string // Thời gian tạo (Supabase tự quản lý)
}

// Kiểu dữ liệu cho việc thêm tài khoản mới (chỉ cần bank_bin ban đầu)
export type NewSavedAccountInput = Omit<SavedAccount, 'id' | 'user_id' | 'created_at' | 'bank_code'>

export const useAccountStore = defineStore('account', () => {
  // --- Dependencies ---
  const authStore = useAuthStore()
  const banksStore = useBanksStore() // Khởi tạo banksStore

  // --- State ---
  const accounts = ref<SavedAccount[]>([]) // Sử dụng interface đã cập nhật
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
      // Lấy tất cả các cột, bao gồm cả bank_bin và bank_code
      const { data, error: fetchError } = await supabase
        .from('user_accounts')
        .select('*') // Lấy tất cả các cột
        .eq('user_id', authStore.userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Đảm bảo dữ liệu trả về khớp với interface SavedAccount
      accounts.value = (data || []).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        bank_bin: item.bank_bin,
        bank_code: item.bank_code || '', // Gán giá trị mặc định nếu bank_code null/undefined
        account_number: item.account_number,
        nickname: item.nickname,
        created_at: item.created_at,
      })) as SavedAccount[] // Ép kiểu để đảm bảo type safety

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
   * @param newAccountInput Dữ liệu tài khoản mới từ form (chỉ chứa bank_bin, account_number, nickname)
   */
  async function addAccount(newAccountInput: NewSavedAccountInput): Promise<boolean> {
    if (!authStore.userId) {
      error.value = 'Bạn cần đăng nhập để lưu tài khoản.'
      return false
    }

    // Tìm thông tin ngân hàng đầy đủ từ bank_bin (caiValue)
    const bankInfo = banksStore.getBankByBin(newAccountInput.bank_bin)
    if (!bankInfo || !bankInfo.bankCode) {
      error.value = `Không tìm thấy thông tin hoặc mã ngân hàng (bankCode) cho BIN ${newAccountInput.bank_bin}. Không thể lưu.`
      return false
    }
    const bankCode = bankInfo.bankCode // Lấy bankCode từ BankInfo
    const bankBin = bankInfo.caiValue // Lấy caiValue từ BankInfo

    // Kiểm tra trùng lặp (cùng BIN, số tài khoản và nickname)
    const exists = accounts.value.some(
      (acc) =>
        acc.bank_bin === bankBin &&
        acc.account_number === newAccountInput.account_number &&
        acc.nickname === newAccountInput.nickname,
    )
    if (exists) {
      error.value = 'Tài khoản với thông tin này đã được lưu trước đó.'
      return false
    }

    loading.value = true
    error.value = null
    try {
      // Dữ liệu để insert vào DB, bao gồm cả bank_code và bank_bin
      const accountToInsert = {
        bank_bin: bankBin,
        account_number: newAccountInput.account_number,
        nickname: newAccountInput.nickname,
        bank_code: bankCode,
        user_id: authStore.userId,
      }

      const { data, error: insertError } = await supabase
        .from('user_accounts')
        .insert([accountToInsert])
        .select() // Trả về bản ghi đã thêm (bao gồm cả bank_code)
        .single()

      if (insertError) throw insertError

      if (data) {
        // Map dữ liệu trả về để khớp với SavedAccount interface
        const addedAccount: SavedAccount = {
          id: data.id,
          user_id: data.user_id,
          bank_bin: data.bank_bin,
          bank_code: data.bank_code || '',
          account_number: data.account_number,
          nickname: data.nickname,
          created_at: data.created_at,
        }
        accounts.value.unshift(addedAccount) // Thêm vào đầu danh sách
        console.log('Account added successfully:', addedAccount)
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
