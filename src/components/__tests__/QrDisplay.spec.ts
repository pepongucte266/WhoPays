// src/components/__tests__/QrDisplay.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import QrDisplay from '../QrDisplay.vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

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

// Mock useToast
const toastMock = {
  add: vi.fn(),
}
vi.mock('primevue/usetoast', () => ({
  useToast: () => toastMock,
}))

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

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

  // Cấu hình global cho mount, bao gồm plugins và stubs
  const globalConfig = {
    plugins: [PrimeVue, ToastService],
    stubs: {
      PrimeButton: {
        template:
          '<button v-bind="$attrs" :aria-label="ariaLabel || $attrs[\'aria-label\']"><slot /></button>',
        props: ['icon', 'severity', 'text', 'disabled', 'ariaLabel', 'rounded'],
      },
      Toast: { template: '<div><!-- Stubbed Toast --></div>' },
    },
  }

  beforeEach(() => {
    qrStoreMock.downloadSingleQr.mockClear()
    qrStoreMock.downloadExcelQr.mockClear()
    toastMock.add.mockClear()
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('render đúng QR và thông tin tài khoản', () => {
    const wrapper = mount(QrDisplay, { props: baseProps, global: globalConfig })
    expect(wrapper.text()).toContain('123456789')
    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(wrapper.find('img[alt="VietQR Code"]').exists()).toBe(true)
    expect(wrapper.find('img[alt="Logo ngân hàng"]').attributes('src')).toContain(
      'https://mocked.logo/test-img-id',
    )
  })

  it('hiển thị số tiền đúng định dạng', () => {
    const wrapper = mount(QrDisplay, { props: baseProps, global: globalConfig })
    expect(wrapper.text()).toContain('1.000.000 ₫')
  })

  it('hiển thị nội dung chuyển khoản', () => {
    const wrapper = mount(QrDisplay, { props: baseProps, global: globalConfig })
    expect(wrapper.text()).toContain('Chuyen tien test')
  })

  it('hiển thị placeholder khi không có qrDataUrl', () => {
    const wrapper = mount(QrDisplay, {
      props: { ...baseProps, qrDataUrl: null },
      global: globalConfig,
    })
    expect(wrapper.text()).toContain('Nhập thông tin và nhấn "Tạo QR" để hiển thị mã tại đây.')
  })

  it('gọi downloadHandler khi click nút tải xuống', async () => {
    const downloadHandler = vi.fn()
    const wrapper = mount(QrDisplay, {
      props: { ...baseProps, downloadHandler },
      global: globalConfig,
    })
    const btn = wrapper.find('button[title="Tải xuống mã QR"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(downloadHandler).toHaveBeenCalled()
  })

  it('gọi qrStore.downloadSingleQr nếu không có downloadHandler và recordId', async () => {
    const wrapper = mount(QrDisplay, {
      props: { ...baseProps, downloadHandler: undefined, recordId: undefined },
      global: globalConfig,
    })
    const btn = wrapper.find('button[title="Tải xuống mã QR"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(qrStoreMock.downloadSingleQr).toHaveBeenCalled()
  })

  it('gọi qrStore.downloadExcelQr nếu có recordId', async () => {
    const wrapper = mount(QrDisplay, {
      props: { ...baseProps, recordId: 5, downloadHandler: undefined },
      global: globalConfig,
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
      global: globalConfig,
    })
    // Kiểm tra có ít nhất 3 nút (tải + 2 nav)
    expect(wrapper.findAll('button').length).toBeGreaterThanOrEqual(3)
  })

  // Không test copy clipboard vì QrDisplay không có div/cơ chế click copy
})
