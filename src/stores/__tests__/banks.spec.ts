// src/stores/__tests__/banks.spec.ts
import { vi } from 'vitest'
// Đặt vi.mock lên đầu file, không có biến top-level để tránh lỗi hoisting!
vi.mock('@/utils/vietqr', () => {
  const fetchBankListFromAPI = vi.fn()
  const mockBankData = [
    {
      id: '1',
      bankCode: 'TCB',
      bankName: 'Techcombank',
      bankShortName: 'Techcombank',
      imageId: 'img1',
      status: 1,
      caiValue: '970407',
      unlinkedType: 0,
    },
    {
      id: '2',
      bankCode: 'VCB',
      bankName: 'Vietcombank',
      bankShortName: 'Vietcombank',
      imageId: 'img2',
      status: 1,
      caiValue: '970436',
      unlinkedType: 0,
    },
  ]
  return {
    fetchBankListFromAPI,
    fallbackBankData: mockBankData,
  }
})

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBanksStore } from '../banks'

describe('useBanksStore', () => {
  let fetchBankListFromAPI: ReturnType<typeof vi.fn>
  let mockBankData: {
    id: string
    bankCode: string
    bankName: string
    bankShortName: string
    imageId: string
    status: number
    caiValue: string
    unlinkedType: number
  }[]

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    // Lấy lại mock từ vi.mock bằng import động ESM, chờ kết quả trước khi test chạy
    const mod = await import('@/utils/vietqr')
    fetchBankListFromAPI = mod.fetchBankListFromAPI as ReturnType<typeof vi.fn>
    mockBankData = mod.fallbackBankData as typeof mockBankData
  })

  it('fetchBanks thành công', async () => {
    fetchBankListFromAPI.mockResolvedValueOnce(mockBankData)
    const store = useBanksStore()
    await store.fetchBanks(true)
    expect(Object.keys(store.banksMap).length).toBe(2)
    expect(store.banksMap['970407'].bankCode).toBe('TCB')
    expect(store.banksArray.length).toBe(2)
    expect(store.error).toBeNull()
    expect(store.isLoading).toBe(false)
  })

  it('fetchBanks fallback khi API lỗi', async () => {
    fetchBankListFromAPI.mockRejectedValueOnce(new Error('API error'))
    const store = useBanksStore()
    await store.fetchBanks(true)
    expect(Object.keys(store.banksMap).length).toBe(2)
    expect(store.banksMap['970407'].bankCode).toBe('TCB')
    expect(store.error).toContain('API error')
    expect(store.isLoading).toBe(false)
  })

  it('getBankByBin trả về đúng bank', async () => {
    const store = useBanksStore()
    store.banksMap = {
      '970407': {
        id: '1',
        bankCode: 'TCB',
        bankName: 'Techcombank',
        bankShortName: 'Techcombank',
        imageId: 'img1',
        status: 1,
        caiValue: '970407',
        unlinkedType: 0,
        logoUrl: 'url',
      },
    }
    const bank = store.getBankByBin('970407')
    expect(bank?.bankCode).toBe('TCB')
    expect(store.getBankByBin('notfound')).toBeUndefined()
  })

  it('getBankByCode trả về đúng bank', async () => {
    const store = useBanksStore()
    store.banksMap = {
      '970407': {
        id: '1',
        bankCode: 'TCB',
        bankName: 'Techcombank',
        bankShortName: 'Techcombank',
        imageId: 'img1',
        status: 1,
        caiValue: '970407',
        unlinkedType: 0,
        logoUrl: 'url',
      },
    }
    const bank = store.getBankByCode('TCB')
    expect(bank?.caiValue).toBe('970407')
    expect(store.getBankByCode('notfound')).toBeUndefined()
  })

  it('bankSelectOptions trả về đúng array', async () => {
    const store = useBanksStore()
    store.banksArray = [
      { label: 'Techcombank (970407)', value: '970407' },
      { label: 'Vietcombank (970436)', value: '970436' },
    ]
    expect(store.bankSelectOptions.length).toBe(2)
    expect(store.bankSelectOptions[0].label).toContain('Techcombank')
  })

  // Bỏ test processBankData vì không expose ra ngoài store
})
