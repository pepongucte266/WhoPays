import { vi } from 'vitest'
// Đặt vi.mock lên đầu file, không có biến top-level để tránh lỗi hoisting!
const supabaseFromMock = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
}
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => supabaseFromMock),
  },
}))
const mockUserId = 'user-123'
const mockBankInfo = { bankCode: 'TCB', caiValue: '970407', bankShortName: 'Techcombank' }
vi.mock('./auth', () => ({
  useAuthStore: () => ({
    get userId() {
      return mockUserId
    },
    get user() {
      return { id: mockUserId, email: 'test@example.com' }
    },
    get isLoggedIn() {
      return true
    },
  }),
}))
vi.mock('./banks', () => ({
  useBanksStore: () => ({
    getBankByBin: vi.fn((bin) => (bin === '970407' ? mockBankInfo : null)),
  }),
}))

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

type AccountStore = ReturnType<typeof import('../account').useAccountStore>
interface MockAuthStore {
  userId: string
}
interface MockBanksStore {
  getBankByBin: (bin: string) => typeof mockBankInfo | null
}

let useAccountStore: () => AccountStore

describe('useAccountStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    Object.values(supabaseFromMock).forEach(
      (fn) => typeof fn.mockReset === 'function' && fn.mockReset(),
    )
    // Xóa cache module để đảm bảo mock áp dụng đúng
    const mod = await import('../account')
    useAccountStore = mod.useAccountStore
  })

  it('fetchAccounts thành công', async () => {
    supabaseFromMock.select.mockReturnThis()
    supabaseFromMock.eq.mockReturnThis()
    supabaseFromMock.order.mockImplementationOnce(async () => ({
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
    }))
    const store = useAccountStore()
    // Truyền mock authStore vào action
    const mockAuthStore: MockAuthStore = {
      userId: mockUserId,
    }
    await store.fetchAccounts(mockAuthStore)
    expect(store.accounts.length).toBe(1)
    expect(store.accounts[0].account_number).toBe('123')
  })

  it('addAccount thành công', async () => {
    supabaseFromMock.insert.mockReturnThis()
    supabaseFromMock.select.mockReturnThis()
    supabaseFromMock.single.mockImplementationOnce(async () => ({
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
    }))
    const store = useAccountStore()
    store.accounts = []
    // Truyền mock authStore và banksStore vào action
    const mockAuthStore: MockAuthStore = {
      userId: mockUserId,
    }
    const mockBanksStore: MockBanksStore = {
      getBankByBin: () => mockBankInfo,
    }
    const ok = await store.addAccount(
      {
        bank_bin: '970407',
        account_number: '456',
        nickname: 'B',
      },
      mockAuthStore,
      mockBanksStore,
    )
    expect(ok).toBe(true)
    expect(store.accounts.length).toBe(1)
    expect(store.accounts[0].nickname).toBe('B')
  })

  it('addAccount báo lỗi khi trùng lặp', async () => {
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
    // Truyền mock authStore và banksStore vào action
    const mockAuthStore: MockAuthStore = {
      userId: mockUserId,
    }
    const mockBanksStore: MockBanksStore = {
      getBankByBin: () => mockBankInfo,
    }
    const ok = await store.addAccount(
      {
        bank_bin: '970407',
        account_number: '123',
        nickname: 'A',
      },
      mockAuthStore,
      mockBanksStore,
    )
    expect(ok).toBe(false)
    expect(store.error).toContain('đã được lưu')
  })

  it('deleteAccount thành công', async () => {
    supabaseFromMock.delete.mockReturnThis()
    supabaseFromMock.eq.mockReturnThis()
    supabaseFromMock.order.mockReturnThis()
    supabaseFromMock.eq.mockImplementationOnce(() => ({
      eq: () => Promise.resolve({ error: null }),
    }))
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
    // Truyền mock authStore vào action
    const mockAuthStore: MockAuthStore = {
      userId: mockUserId,
    }
    const ok = await store.deleteAccount(1, mockAuthStore)
    expect(ok).toBe(true)
    expect(store.accounts.length).toBe(0)
  })
})
