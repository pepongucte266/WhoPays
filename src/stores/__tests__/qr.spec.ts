// src/stores/__tests__/qr.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQrStore } from '../qr'
import type { VietQRAPIResponse } from '@/utils/vietqr'

// Mock các dependency
vi.mock('@/utils/vietqr', () => ({
  fetchVietQRStringFromAPI: vi.fn(async () => ({
    qrCode: 'MOCKED_QR_STRING',
    userBankName: 'Test User',
    imgId: 'img123',
    bankCode: 'TCB',
    bankName: 'Techcombank',
    bankAccount: '123456789',
    amount: '1000000',
    content: 'Test',
  })),
}))
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(async () => 'data:image/png;base64,MOCKED'),
  },
}))
vi.mock('@/stores/banks', () => ({
  useBanksStore: () => ({
    getBankByBin: vi.fn((bin) => {
      if (bin === '970407')
        return {
          bankCode: 'TCB',
          bankShortName: 'Techcombank',
          caiValue: '970407',
          imageId: 'img123',
        }
      return null
    }),
    banksMap: {
      TCB: { bankShortName: 'Techcombank', bankCode: 'TCB', caiValue: '970407', imageId: 'img123' },
    },
  }),
}))

describe('useQrStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('clearManualForm đặt lại state về mặc định', () => {
    const store = useQrStore()
    store.manualInput.bankBin = '970407'
    store.manualInput.accountNumber = '123456789'
    store.manualInput.nickname = 'Test'
    store.manualInput.amount = 1000
    store.manualInput.purpose = 'abc'
    store.generatedQrString = 'abc'
    store.generatedQrDataUrl = 'def'
    store.generationError = 'err'
    store.generatedQrResponse = {
      bankCode: 'TCB',
      bankName: 'Techcombank',
      bankAccount: '123456789',
      userBankName: 'Test User',
      amount: '1000000',
      content: 'Test',
      qrCode: 'MOCKED_QR_STRING',
      imgId: 'img123',
    } as VietQRAPIResponse

    store.clearManualForm()
    expect(store.manualInput.bankBin).toBe('')
    expect(store.manualInput.accountNumber).toBe('')
    expect(store.manualInput.nickname).toBeUndefined()
    expect(store.manualInput.amount).toBeUndefined()
    expect(store.manualInput.purpose).toBe('')
    expect(store.generatedQrString).toBeNull()
    expect(store.generatedQrDataUrl).toBeNull()
    expect(store.generationError).toBeNull()
    expect(store.generatedQrResponse).toBeNull()
  })

  it('generateSingleQrCode thành công', async () => {
    const store = useQrStore()
    store.manualInput.bankBin = '970407'
    store.manualInput.accountNumber = '123456789'
    store.manualInput.nickname = 'Test User'
    store.manualInput.amount = 1000000
    store.manualInput.purpose = 'Test'

    await store.generateSingleQrCode()
    expect(store.generatedQrString).toBe('MOCKED_QR_STRING')
    expect(store.generatedQrDataUrl).not.toBeNull()
    if (store.generatedQrDataUrl) {
      expect(store.generatedQrDataUrl).toContain('data:image/png;base64,MOCKED')
    }
    expect(store.generatedQrResponse?.userBankName).toBe('Test User')
    expect(store.generationError).toBeNull()
    expect(store.isGeneratingQr).toBe(false)
    expect(store.showQrDialog).toBe(true)
  })

  it('generateSingleQrCode báo lỗi khi thiếu trường bắt buộc', async () => {
    const store = useQrStore()
    store.manualInput.bankBin = ''
    store.manualInput.accountNumber = ''
    store.manualInput.nickname = undefined
    store.manualInput.amount = 1000
    store.manualInput.purpose = 'Test'
    await store.generateSingleQrCode()
    expect(store.generationError).toBeDefined()
    expect(store.generatedQrString).toBeNull()
    expect(store.generatedQrDataUrl).toBeNull()
    expect(store.isGeneratingQr).toBe(false)
  })

  it('generateSingleQrCode báo lỗi khi bankBin không hợp lệ', async () => {
    const store = useQrStore()
    store.manualInput.bankBin = 'INVALID'
    store.manualInput.accountNumber = '123456789'
    store.manualInput.nickname = 'Test'
    store.manualInput.amount = 1000
    store.manualInput.purpose = 'Test'
    await store.generateSingleQrCode()
    expect(store.generationError).toContain('Không tìm thấy thông tin hoặc mã ngân hàng')
    expect(store.generatedQrString).toBeNull()
    expect(store.generatedQrDataUrl).toBeNull()
    expect(store.isGeneratingQr).toBe(false)
  })

  it('nextQr và prevQr thay đổi currentQrIndex', () => {
    const store = useQrStore()
    store.excelRecords = [
      {
        id: 1,
        bankBin: '970407',
        accountNumber: '1',
        nickname: 'A',
        selected: true,
        qrDataUrl: 'url1',
      },
      {
        id: 2,
        bankBin: '970407',
        accountNumber: '2',
        nickname: 'B',
        selected: true,
        qrDataUrl: 'url2',
      },
    ] as unknown as typeof store.excelRecords
    store.currentQrIndex = 0
    store.nextQr()
    expect(store.currentQrIndex).toBe(1)
    store.prevQr()
    expect(store.currentQrIndex).toBe(0)
  })
})
