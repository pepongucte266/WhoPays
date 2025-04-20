// src/components/__tests__/QrDisplay.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import QrDisplay from '../QrDisplay.vue'

// Mock store và utils
interface QrStoreMock {
  downloadSingleQr: ReturnType<typeof vi.fn>
  downloadExcelQr: ReturnType<typeof vi.fn>
}
const qrStoreMock: QrStoreMock = {
  downloadSingleQr: vi.fn(),
  downloadExcelQr: vi.fn(),
}
vi.mock('@/stores/qr', () => ({
  useQrStore: () => qrStoreMock,
}))
vi.mock('@/stores/banks', () => ({
  useBanksStore: () => ({
    getBankByBin: vi.fn(() => ({
      imageId: 'test-img-id',
    })),
  }),
}))
vi.mock('@/utils/vietqr', () => ({
  getBankLogoUrl: (imgId: string) => `https://mocked.logo/${imgId}`,
}))

describe('QrDisplay.vue', () => {
  const baseProps = {
    qrDataUrl: 'data:image/png;base64,abc',
    accountNumber: '123456789',
    amount: 1000000,
    purpose: 'Chuyen tien test',
    userBankName: 'Nguyen Van A',
    imgId: 'test-img-id',
    showNav: false,
  }

  const global = {
    stubs: {
      PrimeButton: {
        template: '<button><slot /></button>',
        props: ['icon', 'severity', 'text', 'disabled', 'ariaLabel', 'rounded'],
      },
    },
  }

  it('render đúng QR và thông tin tài khoản', () => {
    const wrapper = mount(QrDisplay, { props: baseProps, global })
    expect(wrapper.text()).toContain('123456789')
    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(wrapper.find('img[alt="VietQR Code"]').exists()).toBe(true)
    expect(wrapper.find('img[alt="Logo ngân hàng"]').attributes('src')).toContain(
      'https://mocked.logo/test-img-id',
    )
  })

  it('hiển thị số tiền đúng định dạng', () => {
    const wrapper = mount(QrDisplay, { props: baseProps, global })
    expect(wrapper.text()).toContain('1.000.000 ₫')
  })

  it('hiển thị nội dung chuyển khoản', () => {
    const wrapper = mount(QrDisplay, { props: baseProps, global })
    expect(wrapper.text()).toContain('Chuyen tien test')
  })

  it('hiển thị placeholder khi không có qrDataUrl', () => {
    const wrapper = mount(QrDisplay, { props: { ...baseProps, qrDataUrl: null }, global })
    expect(wrapper.text()).toContain('Nhập thông tin và nhấn "Tạo QR" để hiển thị mã tại đây.')
  })

  it('gọi downloadHandler khi click nút tải xuống', async () => {
    const downloadHandler = vi.fn()
    const wrapper = mount(QrDisplay, { props: { ...baseProps, downloadHandler }, global })
    const btn = wrapper.find('button[title="Tải xuống mã QR"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(downloadHandler).toHaveBeenCalled()
  })

  it('gọi qrStore.downloadSingleQr nếu không có downloadHandler và recordId', async () => {
    qrStoreMock.downloadSingleQr.mockClear()
    const wrapper = mount(QrDisplay, {
      props: { ...baseProps, downloadHandler: undefined, recordId: undefined },
      global,
    })
    const btn = wrapper.find('button[title="Tải xuống mã QR"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(qrStoreMock.downloadSingleQr).toHaveBeenCalled()
  })

  it('gọi qrStore.downloadExcelQr nếu có recordId', async () => {
    qrStoreMock.downloadExcelQr.mockClear()
    const wrapper = mount(QrDisplay, {
      props: { ...baseProps, recordId: 5, downloadHandler: undefined },
      global,
    })
    const btn = wrapper.find('button[title="Tải xuống mã QR"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(qrStoreMock.downloadExcelQr).toHaveBeenCalledWith(5)
  })

  it('hiển thị navigation khi showNav=true', () => {
    const wrapper = mount(QrDisplay, {
      props: {
        ...baseProps,
        showNav: true,
        canPrev: true,
        canNext: true,
        onPrev: vi.fn(),
        onNext: vi.fn(),
      },
      global,
    })
    // Kiểm tra có ít nhất 2 nút navigation (button)
    expect(wrapper.findAll('button').length).toBeGreaterThanOrEqual(2)
  })
})
