import { ref, computed, watch } from 'vue' // Thêm watch
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from './auth' // Import authStore để lấy user ID và role
import { useBanksStore } from './banks' // Import banksStore

// --- Exported Types ---
// Di chuyển các type ra ngoài để có thể export và sử dụng trong test

// Định nghĩa type riêng cho fetchAccounts để bao gồm userRole
export type FetchAuthStore = { userId: string | undefined; userRole: string | undefined }

// Định nghĩa type cho các hàm chỉ cần userId
export type MinimalAuthStore = { userId: string | undefined }

// Định nghĩa kiểu BankInfo cho getBankByBin
export type BankInfo = {
  bankCode: string
  caiValue: string
  bankShortName: string
}
export type MinimalBanksStore = { getBankByBin: (bin: string) => BankInfo | null }

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
  // --- State ---
  const accounts = ref<SavedAccount[]>([]) // Sử dụng interface đã cập nhật
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // --- Actions ---

  /**
   * Getter: Gom các tài khoản theo tên chủ tài khoản (nickname)
   * Trả về mảng các group: { nickname, accounts }
   */
  const groupedAccounts = computed(() => {
    // Nếu nickname null/undefined thì gán là 'Không rõ'
    const groups: Record<string, SavedAccount[]> = {}
    for (const acc of accounts.value) {
      const key = acc.nickname?.trim() || 'Không rõ'
      if (!groups[key]) groups[key] = []
      groups[key].push(acc)
    }
    // Trả về mảng để dễ render trên UI
    return Object.entries(groups).map(([nickname, accounts]) => ({
      nickname,
      accounts,
    }))
  })

  /**
   * Lấy danh sách tài khoản đã lưu.
   * Nếu truyền userId, sẽ lấy theo userId đó (dùng cho admin/manager).
   * Nếu không truyền, mặc định lấy theo user hiện tại.
   * Nếu user là 'manager', lấy tất cả tài khoản.
   */
  // Sử dụng type FetchAuthStore đã export
  async function fetchAccounts(injectedAuthStore?: FetchAuthStore, overrideUserId?: string) {
    const authStore = injectedAuthStore || useAuthStore()
    const targetUserId = overrideUserId || authStore.userId
    const userRole = authStore.userRole // Lấy role

    // Nếu chưa đăng nhập thì không fetch
    if (!targetUserId) {
      console.warn('User not logged in, cannot fetch accounts.')
      accounts.value = [] // Clear state nếu chưa đăng nhập
      return
    }

    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('user_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      // Chỉ lọc theo user_id nếu không phải manager
      if (userRole !== 'manager') {
        console.log(`Fetching accounts for user: ${targetUserId}`)
        query = query.eq('user_id', targetUserId)
      } else {
        console.log('Manager detected, fetching all accounts.')
      }

      const { data, error: fetchError } = await query // Thực thi query đã điều chỉnh

      if (fetchError) throw fetchError

      accounts.value = (data || []).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        bank_bin: item.bank_bin,
        bank_code: item.bank_code || '',
        account_number: item.account_number,
        nickname: item.nickname,
        created_at: item.created_at,
      })) as SavedAccount[]
    } catch (err: unknown) {
      console.error('Error fetching accounts:', err)
      error.value =
        err instanceof Error ? err.message : 'Lỗi không xác định khi tải danh sách tài khoản.'
      accounts.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Thêm một tài khoản mới vào danh sách lưu.
   * @param newAccountInput Dữ liệu tài khoản mới từ form (chỉ chứa bank_bin, account_number, nickname)
   */
  // Sử dụng các type MinimalAuthStore và MinimalBanksStore đã export
  async function addAccount(
    newAccountInput: NewSavedAccountInput,
    injectedAuthStore?: MinimalAuthStore,
    injectedBanksStore?: MinimalBanksStore,
  ): Promise<boolean> {
    const authStore = injectedAuthStore || useAuthStore()
    const banksStore = injectedBanksStore || useBanksStore()
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
  async function deleteAccount(
    accountId: number,
    injectedAuthStore?: MinimalAuthStore,
  ): Promise<boolean> {
    const authStore = injectedAuthStore || useAuthStore()
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

  /**
   * Xóa nhiều tài khoản đã lưu.
   * @param accountIds Mảng ID của các tài khoản cần xóa
   */
  async function deleteAccounts(
    accountIds: number[],
    injectedAuthStore?: MinimalAuthStore,
  ): Promise<boolean> {
    const authStore = injectedAuthStore || useAuthStore()
    if (!authStore.userId) {
      error.value = 'Bạn cần đăng nhập để xóa tài khoản.'
      return false
    }
    if (!Array.isArray(accountIds) || accountIds.length === 0) {
      error.value = 'Không có tài khoản nào được chọn để xóa.'
      return false
    }

    loading.value = true
    error.value = null
    try {
      const { error: deleteError } = await supabase
        .from('user_accounts')
        .delete()
        .in('id', accountIds)
        .eq('user_id', authStore.userId)

      if (deleteError) throw deleteError

      // Xóa khỏi danh sách state sau khi xóa thành công trên DB
      accounts.value = accounts.value.filter((acc) => !accountIds.includes(acc.id))
      console.log('Accounts deleted successfully:', accountIds)
      return true
    } catch (err: unknown) {
      console.error('Error deleting accounts:', err)
      error.value = err instanceof Error ? err.message : 'Lỗi không xác định khi xóa tài khoản.'
      return false
    } finally {
      loading.value = false
    }
  }

  // --- Return ---
  const returnedObject = {
    accounts,
    groupedAccounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    deleteAccount,
    deleteAccounts,
  }

  // --- Watcher ---
  // Tự động cập nhật danh sách tài khoản khi user thay đổi
  // Đặt bên trong defineStore để đảm bảo Pinia đã active
  const authStoreInstance = useAuthStore() // Lấy instance auth store
  watch(
    () => authStoreInstance.userId,
    (newUserId, oldUserId) => {
      console.log(`Auth User ID changed from ${oldUserId} to ${newUserId}`)
      // Không cần gọi useAccountStore() nữa vì đang ở trong chính store đó
      if (newUserId) {
        // Nếu có user mới (đăng nhập hoặc thay đổi), fetch lại tài khoản
        fetchAccounts() // Gọi trực tiếp action của store này
      } else {
        // Nếu không có user (đăng xuất), clear danh sách
        accounts.value = [] // Truy cập trực tiếp state ref
        error.value = null // Truy cập trực tiếp state ref
        console.log('User logged out, cleared accounts.')
      }
    },
    { immediate: false }, // Không chạy ngay khi store khởi tạo, chỉ chạy khi userId thay đổi
  )

  return returnedObject
})
