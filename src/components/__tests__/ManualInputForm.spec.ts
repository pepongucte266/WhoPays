// src/components/__tests__/ManualInputForm.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ManualInputForm from '../ManualInputForm.vue'

// Mock store và dependency
const qrStoreMock = {
  manualInput: {
    bankBin: '',
    accountNumber: '',
    nickname: '',
    amount: undefined,
    purpose: '',
  },
  isGeneratingQr: false,
  generationError: null as string | null,
  generateSingleQrCode: vi.fn(),
  clearManualForm: vi.fn(),
}
const banksStoreMock = {
  bankSelectOptions: [
    { label: 'Techcombank', value: '970407' },
    { label: 'Vietcombank', value: '970436' },
  ],
  isLoading: false,
  error: null,
}
const accountStoreMock = {
  accounts: [
    { id: 1, bank_bin: '970407', account_number: '123456', nickname: 'TK1' },
    { id: 2, bank_bin: '970436', account_number: '654321', nickname: 'TK2' },
  ],
  fetchAccounts: vi.fn(),
}

vi.mock('@/stores/qr', () => ({
  useQrStore: () => qrStoreMock,
}))
vi.mock('@/stores/banks', () => ({
  useBanksStore: () => banksStoreMock,
}))
vi.mock('@/stores/account', () => ({
  useAccountStore: () => accountStoreMock,
}))

// Stub PrimeVue components
const global = {
  stubs: {
    PrimeButton: { template: '<button><slot /></button>' },
    PrimeSelect: { template: '<select><slot /></select>', props: ['modelValue', 'options'] },
    PrimeInputText: { template: '<input />', props: ['modelValue'] },
    PrimeInputNumber: { template: '<input type="number" />', props: ['modelValue'] },
    PrimeDialog: { template: '<div><slot /></div>', props: ['visible'] },
    PrimeDataTable: { template: '<table><slot /></table>', props: ['value'] },
    PrimeColumn: { template: '<col />', props: ['field', 'header'] },
  },
}

describe('ManualInputForm.vue', () => {
  beforeEach(() => {
    // Reset store state before each test
    qrStoreMock.manualInput.bankBin = ''
    qrStoreMock.manualInput.accountNumber = ''
    qrStoreMock.manualInput.nickname = ''
    qrStoreMock.manualInput.amount = undefined
    qrStoreMock.manualInput.purpose = ''
    qrStoreMock.isGeneratingQr = false
    qrStoreMock.generationError = null
    qrStoreMock.generateSingleQrCode.mockClear()
    qrStoreMock.clearManualForm.mockClear()
    accountStoreMock.fetchAccounts.mockClear()
  })

  it('render form và các trường nhập', () => {
    const wrapper = mount(ManualInputForm, { global })
    expect(wrapper.text()).toContain('Tạo QR Thủ Công')
    expect(wrapper.find('input[id="account-number"]').exists()).toBe(true)
    expect(wrapper.find('input[id="nickname"]').exists()).toBe(true)
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.find('input[id="purpose"]').exists()).toBe(true)
  })

  it('gọi generateSingleQrCode khi submit', async () => {
    qrStoreMock.manualInput.bankBin = '970407'
    qrStoreMock.manualInput.accountNumber = '123456'
    qrStoreMock.manualInput.nickname = 'TK1'
    const wrapper = mount(ManualInputForm, { global })
    await wrapper.find('form').trigger('submit.prevent')
    expect(qrStoreMock.generateSingleQrCode).toHaveBeenCalled()
  })

  it('gọi clearManualForm khi click nút Xóa', async () => {
    const wrapper = mount(ManualInputForm, { global })
    const btn = wrapper.find('button[type="button"]')
    await btn.trigger('click')
    expect(qrStoreMock.clearManualForm).toHaveBeenCalled()
  })

  it('hiển thị lỗi khi có generationError', () => {
    qrStoreMock.generationError = 'Lỗi test'
    const wrapper = mount(ManualInputForm, { global })
    expect(wrapper.text()).toContain('Lỗi test')
  })

  it('mở dialog chọn tài khoản khi click PrimeButton', async () => {
    const wrapper = mount(ManualInputForm, { global })
    const btn = wrapper.findAll('button').at(0)
    await btn?.trigger('click')
    expect(accountStoreMock.fetchAccounts).toHaveBeenCalled()
  })
})
