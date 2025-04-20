// src/utils/__tests__/vietqr.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getBankLogoUrl,
  fetchVietQRStringFromAPI,
  fetchBankListFromAPI,
  fallbackBankData,
} from '../vietqr'

describe('vietqr utils', () => {
  it('getBankLogoUrl trả về đúng URL', () => {
    expect(getBankLogoUrl('abc123')).toBe('https://api.vietqr.org/vqr/api/images/abc123')
  })

  it('fallbackBankData chứa dữ liệu mẫu', () => {
    expect(Array.isArray(fallbackBankData)).toBe(true)
    expect(fallbackBankData.length).toBeGreaterThan(0)
    expect(fallbackBankData[0]).toHaveProperty('bankCode')
    expect(fallbackBankData[0]).toHaveProperty('caiValue')
  })

  describe('fetchVietQRStringFromAPI', () => {
    const originalFetch = global.fetch

    beforeEach(() => {
      global.fetch = vi.fn(async () =>
        Promise.resolve({
          ok: true,
          json: async () =>
            ({
              qrCode: 'QR_STRING',
              userBankName: 'Test User',
              bankCode: 'TCB',
              bankAccount: '123456789',
              amount: '1000000',
              content: 'Test',
            }) as {
              qrCode: string
              userBankName: string
              bankCode: string
              bankAccount: string
              amount: string
              content: string
            },
        } as Partial<Response> as Response),
      )
    })

    afterEach(() => {
      global.fetch = originalFetch
    })

    it('trả về dữ liệu đúng khi gọi API thành công', async () => {
      const data = await fetchVietQRStringFromAPI({
        bankCode: 'TCB',
        bankAccount: '123456789',
        userBankName: 'Test User',
        amount: '1000000',
        content: 'Test',
      })
      expect(data.qrCode).toBe('QR_STRING')
      expect(data.userBankName).toBe('Test User')
    })

    it('báo lỗi khi API trả về lỗi', async () => {
      global.fetch = vi.fn(async () =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({ message: 'Sai dữ liệu' }),
        } as Partial<Response> as Response),
      )
      await expect(
        fetchVietQRStringFromAPI({
          bankCode: 'TCB',
          bankAccount: '123456789',
          userBankName: 'Test User',
        }),
      ).rejects.toThrow('Lỗi API VietQR: Sai dữ liệu')
    })
  })

  describe('fetchBankListFromAPI', () => {
    const originalFetch = global.fetch

    afterEach(() => {
      global.fetch = originalFetch
    })

    it('trả về danh sách bank khi fetch thành công', async () => {
      global.fetch = vi.fn(async () =>
        Promise.resolve({
          ok: true,
          json: async () => [
            {
              bankCode: 'TCB',
              caiValue: '970407',
              bankShortName: 'Techcombank',
              imageId: 'img123',
              id: '1',
              bankName: 'Techcombank',
              status: 0,
              unlinkedType: 0,
            },
          ],
        } as Partial<Response> as Response),
      )
      const data = await fetchBankListFromAPI()
      expect(Array.isArray(data)).toBe(true)
      expect(data?.[0].bankCode).toBe('TCB')
    })

    it('trả về null khi fetch lỗi', async () => {
      global.fetch = vi.fn(async () =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({}),
        } as Partial<Response> as Response),
      )
      const data = await fetchBankListFromAPI()
      expect(data).toBeNull()
    })
  })
})
