import { vi, type Mock } from 'vitest' // Sử dụng type-only import cho Mock
// Đặt vi.mock lên đầu file, không có biến top-level để tránh lỗi hoisting!
const supabaseFromMock = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(), // Thêm mock cho 'in' nếu cần cho deleteAccounts
}
// Mock supabase client và export nó để sử dụng trong test
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => supabaseFromMock),
  },
}))
import { supabase } from '@/lib/supabaseClient' // Import supabase từ mock

const mockUserId = 'user-123'
const mockBankInfo = { bankCode: 'TCB', caiValue: '970407', bankShortName: 'Techcombank' }

// Mock useAuthStore để trả về cả userId và userRole
vi.mock('./auth', () => ({
  useAuthStore: () => ({
    userId: mockUserId,
    userRole: 'user', // Mặc định role là 'user' cho các test
    user: { id: mockUserId, email: 'test@example.com' },
    isLoggedIn: true,
  }),
}))

vi.mock('./banks', () => ({
  useBanksStore: () => ({
    getBankByBin: vi.fn((bin) => (bin === '970407' ? mockBankInfo : null)),
  }),
}))

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { FetchAuthStore, MinimalAuthStore } from '../account' // Import các kiểu đã export

type AccountStore = ReturnType<typeof import('../account').useAccountStore>

interface MockBanksStore {
  getBankByBin: (bin: string) => typeof mockBankInfo | null
}

let useAccountStore: () => AccountStore

describe('useAccountStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    // Reset tất cả các mock function trong supabaseFromMock và supabase.from
    ;(supabase.from as Mock).mockClear() // Clear mock supabase.from
    Object.values(supabaseFromMock).forEach((fn) => {
      if (typeof fn.mockReset === 'function') {
        fn.mockReset()
      }
      // Đảm bảo các mock trả về 'this' được thiết lập lại
      if ('mockReturnThis' in fn) {
        fn.mockReturnThis()
      }
    })
    // Xóa cache module để đảm bảo mock áp dụng đúng
    const mod = await import('../account')
    useAccountStore = mod.useAccountStore
  })

  it('fetchAccounts thành công (role user)', async () => {
    // Mock chuỗi query: from -> select -> order -> eq -> Promise
    const mockEqResult = {
      data: [
        {
          id: 1,
          user_id: mockUserId,
          bank_bin: '970407',
          bank_code: 'TCB',
          account_number: '123',
          nickname: 'A',
          created_at: '2024-01-01',
        },
      ],
      error: null,
    }
    // Thiết lập lại mock cho chuỗi này
    supabaseFromMock.select.mockReturnThis()
    supabaseFromMock.order.mockReturnThis()
    supabaseFromMock.eq.mockResolvedValueOnce(mockEqResult) // eq là phương thức cuối cùng trả về Promise

    const store = useAccountStore()
    // Truyền mock authStore vào action (bao gồm cả userRole)
    const mockAuthStore: FetchAuthStore = {
      // Sử dụng FetchAuthStore
      userId: mockUserId,
      userRole: 'user',
    }
    await store.fetchAccounts(mockAuthStore)

    expect(supabase.from).toHaveBeenCalledWith('user_accounts') // Kiểm tra supabase.from
    expect(supabaseFromMock.select).toHaveBeenCalledWith('*')
    expect(supabaseFromMock.order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(supabaseFromMock.eq).toHaveBeenCalledWith('user_id', mockUserId) // Đảm bảo eq được gọi đúng
    expect(store.accounts.length).toBe(1)
    expect(store.accounts[0].account_number).toBe('123')
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchAccounts thành công (role manager)', async () => {
    // Mock chuỗi query: from -> select -> order -> Promise (không có eq)
    const mockOrderResult = {
      data: [
        {
          id: 1,
          user_id: 'user-123',
          bank_bin: '970407',
          bank_code: 'TCB',
          account_number: '123',
          nickname: 'A',
          created_at: '2024-01-01',
        },
        {
          id: 2,
          user_id: 'user-456',
          bank_bin: '970436',
          bank_code: 'VCB',
          account_number: '456',
          nickname: 'B',
          created_at: '2024-01-02',
        },
      ],
      error: null,
    }
    // Thiết lập lại mock cho chuỗi này
    supabaseFromMock.select.mockReturnThis()
    // order là phương thức cuối cùng trả về Promise
    supabaseFromMock.order.mockResolvedValueOnce(mockOrderResult)
    // Đảm bảo eq không được gọi lại từ test trước
    supabaseFromMock.eq.mockClear()

    const store = useAccountStore()
    const mockAuthStore: FetchAuthStore = {
      userId: 'manager-id', // ID của manager
      userRole: 'manager',
    }
    await store.fetchAccounts(mockAuthStore)

    expect(supabase.from).toHaveBeenCalledWith('user_accounts') // Kiểm tra supabase.from
    expect(supabaseFromMock.select).toHaveBeenCalledWith('*')
    expect(supabaseFromMock.order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(supabaseFromMock.eq).not.toHaveBeenCalled() // Đảm bảo eq KHÔNG được gọi
    expect(store.accounts.length).toBe(2)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchAccounts lỗi', async () => {
    const mockError = new Error('Lỗi Supabase')
    // Mock chuỗi query: from -> select -> order -> eq -> Promise (rejected)
    supabaseFromMock.select.mockReturnThis()
    supabaseFromMock.order.mockReturnThis()
    supabaseFromMock.eq.mockRejectedValueOnce(mockError) // eq trả về Promise bị reject

    const store = useAccountStore()
    const mockAuthStore: FetchAuthStore = {
      userId: mockUserId,
      userRole: 'user',
    }
    await store.fetchAccounts(mockAuthStore)

    expect(store.accounts.length).toBe(0)
    expect(store.loading).toBe(false)
    expect(store.error).toBe(mockError.message)
  })

  it('addAccount thành công', async () => {
    // Mock: insert -> select -> single -> Promise
    const mockSingleResult = {
      data: {
        id: 2,
        user_id: mockUserId,
        bank_bin: '970407',
        bank_code: 'TCB',
        account_number: '456',
        nickname: 'B',
        created_at: '2024-01-02',
      },
      error: null,
    }
    supabaseFromMock.insert.mockReturnThis()
    supabaseFromMock.select.mockReturnThis()
    supabaseFromMock.single.mockResolvedValueOnce(mockSingleResult) // single trả về Promise

    const store = useAccountStore()
    store.accounts = [] // Reset state trước khi test
    // Truyền mock authStore và banksStore vào action (chỉ cần userId cho addAccount)
    const mockAuthStoreMinimal: MinimalAuthStore = {
      // Sử dụng MinimalAuthStore
      userId: mockUserId,
    }
    const mockBanksStore: MockBanksStore = {
      getBankByBin: () => mockBankInfo,
    }
    const ok = await store.addAccount(
      {
        bank_bin: '970407', // Đây là caiValue
        account_number: '456',
        nickname: 'B',
      },
      mockAuthStoreMinimal,
      mockBanksStore,
    )
    expect(ok).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('user_accounts') // Kiểm tra supabase.from
    expect(supabaseFromMock.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        bank_bin: '970407', // caiValue
        account_number: '456',
        nickname: 'B',
        bank_code: 'TCB', // bankCode từ mockBankInfo
        user_id: mockUserId,
      }),
    ])
    expect(store.accounts.length).toBe(1)
    expect(store.accounts[0].nickname).toBe('B')
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('addAccount báo lỗi khi trùng lặp', async () => {
    const store = useAccountStore()
    // Thiết lập state ban đầu có tài khoản trùng
    store.accounts = [
      {
        id: 1,
        user_id: mockUserId,
        bank_bin: '970407', // caiValue
        bank_code: 'TCB',
        account_number: '123',
        nickname: 'A',
        created_at: '2024-01-01',
      },
    ]
    // Truyền mock authStore và banksStore vào action (chỉ cần userId)
    const mockAuthStoreMinimal: MinimalAuthStore = {
      userId: mockUserId,
    }
    const mockBanksStore: MockBanksStore = {
      getBankByBin: () => mockBankInfo, // Giả sử tìm thấy bank info
    }
    const ok = await store.addAccount(
      {
        bank_bin: '970407', // caiValue trùng
        account_number: '123', // số tài khoản trùng
        nickname: 'A', // nickname trùng
      },
      mockAuthStoreMinimal,
      mockBanksStore,
    )
    expect(ok).toBe(false)
    expect(supabaseFromMock.insert).not.toHaveBeenCalled() // Không gọi insert
    expect(store.error).toContain('đã được lưu')
    expect(store.loading).toBe(false) // Đảm bảo loading là false
  })

  it('addAccount báo lỗi khi không tìm thấy bank info', async () => {
    const store = useAccountStore()
    store.accounts = []
    const mockAuthStoreMinimal: MinimalAuthStore = {
      userId: mockUserId,
    }
    const mockBanksStoreNoInfo: MockBanksStore = {
      getBankByBin: () => null, // Giả lập không tìm thấy bank info
    }
    const ok = await store.addAccount(
      {
        bank_bin: 'INVALID_BIN',
        account_number: '789',
        nickname: 'C',
      },
      mockAuthStoreMinimal,
      mockBanksStoreNoInfo,
    )
    expect(ok).toBe(false)
    expect(supabaseFromMock.insert).not.toHaveBeenCalled()
    expect(store.error).toContain('Không tìm thấy thông tin')
    expect(store.loading).toBe(false)
  })

  it('deleteAccount thành công', async () => {
    // Mock: delete -> eq (id) -> eq (user_id) -> Promise
    const mockEqUserIdResult = { error: null } // Kết quả cuối cùng
    const mockEqIdResult = {
      // Kết quả của eq(id)
      eq: vi.fn().mockResolvedValueOnce(mockEqUserIdResult), // eq(user_id) trả về Promise
    }
    supabaseFromMock.delete.mockReturnThis() // delete trả về this
    supabaseFromMock.eq.mockReturnValueOnce(mockEqIdResult) // eq(id) trả về đối tượng có eq(user_id)

    const store = useAccountStore()
    // Thiết lập state ban đầu
    store.accounts = [
      {
        id: 1,
        user_id: mockUserId,
        bank_bin: '970407',
        bank_code: 'TCB',
        account_number: '123',
        nickname: 'A',
        created_at: '2024-01-01',
      },
      {
        id: 2, // Tài khoản khác không bị xóa
        user_id: mockUserId,
        bank_bin: '970436',
        bank_code: 'VCB',
        account_number: '456',
        nickname: 'B',
        created_at: '2024-01-02',
      },
    ]
    // Truyền mock authStore vào action (chỉ cần userId)
    const mockAuthStoreMinimal: MinimalAuthStore = {
      userId: mockUserId,
    }
    const ok = await store.deleteAccount(1, mockAuthStoreMinimal) // Xóa tài khoản có id = 1

    expect(ok).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('user_accounts') // Kiểm tra supabase.from
    expect(supabaseFromMock.delete).toHaveBeenCalled()
    // Kiểm tra eq(id) được gọi đúng
    expect(supabaseFromMock.eq).toHaveBeenCalledWith('id', 1)
    // Kiểm tra eq(user_id) được gọi đúng trên kết quả của eq(id)
    expect(mockEqIdResult.eq).toHaveBeenCalledWith('user_id', mockUserId)
    expect(store.accounts.length).toBe(1) // Còn lại 1 tài khoản
    expect(store.accounts[0].id).toBe(2) // Tài khoản còn lại là id=2
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('deleteAccount lỗi', async () => {
    const mockError = new Error('Lỗi xóa Supabase')
    // Mock: delete -> eq (id) -> eq (user_id) -> Promise (rejected)
    const mockEqIdResult = {
      eq: vi.fn().mockRejectedValueOnce(mockError), // eq(user_id) trả về Promise bị reject
    }
    supabaseFromMock.delete.mockReturnThis()
    supabaseFromMock.eq.mockReturnValueOnce(mockEqIdResult)

    const store = useAccountStore()
    store.accounts = [
      {
        id: 1,
        user_id: mockUserId,
        bank_bin: '970407',
        bank_code: 'TCB',
        account_number: '123',
        nickname: 'A',
        created_at: '2024-01-01',
      },
    ]
    const mockAuthStoreMinimal: MinimalAuthStore = {
      userId: mockUserId,
    }
    const ok = await store.deleteAccount(1, mockAuthStoreMinimal)

    expect(ok).toBe(false)
    expect(store.accounts.length).toBe(1) // Không xóa khỏi state nếu lỗi
    expect(store.loading).toBe(false)
    expect(store.error).toBe(mockError.message)
  })

  // Có thể thêm test cho deleteAccounts tương tự deleteAccount
  it('deleteAccounts thành công', async () => {
    // Mock: delete -> in (ids) -> eq (user_id) -> Promise
    const mockEqUserIdResult = { error: null }
    const mockInResult = {
      eq: vi.fn().mockResolvedValueOnce(mockEqUserIdResult),
    }
    supabaseFromMock.delete.mockReturnThis()
    supabaseFromMock.in.mockReturnValueOnce(mockInResult) // in trả về đối tượng có eq

    const store = useAccountStore()
    store.accounts = [
      {
        id: 1,
        user_id: mockUserId,
        bank_bin: '970407',
        bank_code: 'TCB',
        account_number: '123',
        nickname: 'A',
        created_at: '2024-01-01',
      },
      {
        id: 2,
        user_id: mockUserId,
        bank_bin: '970436',
        bank_code: 'VCB',
        account_number: '456',
        nickname: 'B',
        created_at: '2024-01-02',
      },
      {
        id: 3,
        user_id: mockUserId,
        bank_bin: '970415',
        bank_code: 'VIB',
        account_number: '789',
        nickname: 'C',
        created_at: '2024-01-03',
      },
    ]
    const idsToDelete = [1, 3]
    const mockAuthStoreMinimal: MinimalAuthStore = { userId: mockUserId }

    const ok = await store.deleteAccounts(idsToDelete, mockAuthStoreMinimal)

    expect(ok).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('user_accounts') // Kiểm tra supabase.from
    expect(supabaseFromMock.delete).toHaveBeenCalled()
    expect(supabaseFromMock.in).toHaveBeenCalledWith('id', idsToDelete)
    expect(mockInResult.eq).toHaveBeenCalledWith('user_id', mockUserId)
    expect(store.accounts.length).toBe(1)
    expect(store.accounts[0].id).toBe(2) // Chỉ còn lại tài khoản id=2
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })
})
