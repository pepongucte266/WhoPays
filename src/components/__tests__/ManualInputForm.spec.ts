// src/components/__tests__/ManualInputForm.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ManualInputForm from '../ManualInputForm.vue'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

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
  deleteAccount: vi.fn().mockResolvedValue(true),
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

// Mock useConfirm và useToast
const confirmMock = {
  require: vi.fn(),
}
const toastMock = {
  add: vi.fn(),
}
vi.mock('primevue/usetoast', () => ({
  useToast: () => toastMock,
}))
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => confirmMock,
}))

// Cấu hình global cho mount, bao gồm plugins và stubs
const globalConfig = {
  plugins: [PrimeVue, ConfirmationService, ToastService],
  stubs: {
    PrimeButton: {
      template: '<button :title="title"><slot /></button>',
      props: ['title', 'icon', 'severity', 'text', 'disabled'],
    },
    PrimeSelect: {
      template: '<select data-testid="prime-select"><slot /></select>',
      props: ['modelValue', 'options'],
    },
    PrimeInputText: { template: '<input />', props: ['modelValue'] },
    PrimeInputNumber: { template: '<input type="number" />', props: ['modelValue'] },
    PrimeDialog: {
      template: '<div><slot name="header" /><slot /></div>',
      props: ['visible', 'modal', 'header'],
    },
    PrimeDataTable: {
      template: '<table><slot /></table>',
      props: ['value', 'selectionMode', 'selection'],
    },
    PrimeColumn: { template: '<col />', props: ['field', 'header', 'selectionMode'] },
    ConfirmDialog: { template: '<div><!-- Stubbed ConfirmDialog --></div>' },
    Toast: { template: '<div><!-- Stubbed Toast --></div>' },
    ListSaveAccount: true,
  },
}

describe('ManualInputForm.vue', () => {
  beforeEach(() => {
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
    accountStoreMock.deleteAccount.mockClear()
    confirmMock.require.mockClear()
    toastMock.add.mockClear()
  })

  it('render form và các trường nhập', () => {
    const wrapper = mount(ManualInputForm, { global: globalConfig })
    expect(wrapper.text()).toContain('Tạo QR Thủ Công')
    expect(wrapper.find('input[id="account-number"]').exists()).toBe(true)
    expect(wrapper.find('input[id="nickname"]').exists()).toBe(true)
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.find('input[id="purpose"]').exists()).toBe(true)
    expect(wrapper.findAll('button').length).toBeGreaterThanOrEqual(3)
  })

  it('gọi generateSingleQrCode khi submit form hợp lệ', async () => {
    const wrapper = mount(ManualInputForm, { global: globalConfig })
    // Điền dữ liệu hợp lệ
    const select = wrapper.find('select[data-testid="prime-select"]')
    expect(select.exists()).toBe(true)
    await select.setValue('970407')
    await wrapper.find('input[id="account-number"]').setValue('123456')
    await wrapper.find('input[id="nickname"]').setValue('TK1')
    await wrapper.find('form').trigger('submit.prevent')
    expect(qrStoreMock.generateSingleQrCode).toHaveBeenCalled()
  })

  it('gọi clearManualForm khi click nút Xóa', async () => {
    const wrapper = mount(ManualInputForm, { global: globalConfig })
    const clearButton = wrapper
      .findAll('button')
      .filter((btn) => btn.text().includes('Xóa'))
      .at(0)
    expect(clearButton).toBeDefined()
    await clearButton?.trigger('click')
    expect(qrStoreMock.clearManualForm).toHaveBeenCalled()
  })

  it('hiển thị lỗi khi có generationError', async () => {
    qrStoreMock.generationError = 'Lỗi test'
    const wrapper = mount(ManualInputForm, { global: globalConfig })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Lỗi test')
  })

  it('mở dialog chọn tài khoản khi click nút "Chọn TK"', async () => {
    const wrapper = mount(ManualInputForm, { global: globalConfig })
    // Tìm nút "Chọn TK" bằng title
    const selectAccountButton = wrapper
      .findAll('button')
      .find((btn) => btn.attributes('title') === 'Chọn nhanh tài khoản đã lưu')
    expect(selectAccountButton).toBeDefined()
    await selectAccountButton?.trigger('click')
    expect(accountStoreMock.fetchAccounts).toHaveBeenCalled()
    // Không kiểm tra dialog vì đã stub
  })
})
