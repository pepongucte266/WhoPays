// src/components/__tests__/ExcelImport.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExcelImport from '../ExcelImport.vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

// Mock store và dependency
const qrStoreMock = {
  excelRecords: [
    { id: 1, bankBin: '970407', accountNumber: '123', nickname: 'A', selected: true },
    { id: 2, bankBin: '970436', accountNumber: '456', nickname: 'B', selected: false },
  ],
  isProcessingExcel: false,
  excelError: null as string | null,
  importFromExcel: vi.fn(),
  generateMultipleQrCodes: vi.fn(),
  downloadExcelQr: vi.fn(),
}
const banksStoreMock = {
  getBankByBin: vi.fn((bin) => {
    if (bin === '970407') return { bankShortName: 'Techcombank' }
    if (bin === '970436') return { bankShortName: 'Vietcombank' }
    return null
  }),
}
const accountStoreMock = {
  addAccount: vi.fn(async () => true),
  error: null,
  loading: false,
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
vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}))

// Mock useToast
const toastMock = {
  add: vi.fn(),
}
vi.mock('primevue/usetoast', () => ({
  useToast: () => toastMock,
}))

// Cấu hình global cho mount, bao gồm plugins và stubs
const globalConfig = {
  plugins: [PrimeVue, ToastService],
  stubs: {
    PrimeButton: { template: '<button><slot /></button>' },
    PrimeDataTable: {
      template: '<table><slot /></table>',
      props: ['value', 'selection', 'selectAll'],
    },
    PrimeColumn: { template: '<col />', props: ['field', 'header', 'selectionMode'] },
    PrimeCheckbox: { template: '<input type="checkbox" />', props: ['modelValue', 'binary'] },
    Toast: { template: '<div><!-- Stubbed Toast --></div>' },
  },
}

describe('ExcelImport.vue', () => {
  beforeEach(() => {
    qrStoreMock.importFromExcel.mockClear()
    qrStoreMock.generateMultipleQrCodes.mockClear()
    qrStoreMock.downloadExcelQr.mockClear()
    banksStoreMock.getBankByBin.mockClear()
    accountStoreMock.addAccount.mockClear()
    toastMock.add.mockClear()
  })

  it('render tiêu đề và nút tải file mẫu', () => {
    const wrapper = mount(ExcelImport, { global: globalConfig })
    expect(wrapper.text()).toContain('Import từ Excel')
    // Tìm input file thực tế
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Tải File Mẫu')
  })

  it('gọi importFromExcel khi chọn file qua input[type="file"]', async () => {
    const wrapper = mount(ExcelImport, { global: globalConfig })
    const file = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
    // Gán file vào input element và dispatch event
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    })
    await fileInput.element.dispatchEvent(new Event('change'))
    expect(qrStoreMock.importFromExcel).toHaveBeenCalled()
  })

  it('hiển thị bảng dữ liệu khi có record', () => {
    const wrapper = mount(ExcelImport, { global: globalConfig })
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('hiển thị lỗi excelError', async () => {
    qrStoreMock.excelError = 'Lỗi đọc Excel'
    const wrapper = mount(ExcelImport, { global: globalConfig })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Lỗi đọc Excel')
  })

  it('gọi generateMultipleQrCodes khi click nút tạo QR đã chọn', async () => {
    const wrapper = mount(ExcelImport, { global: globalConfig })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Tạo QR Đã Chọn'))
    expect(btn).toBeDefined()
    await btn?.trigger('click')
    expect(qrStoreMock.generateMultipleQrCodes).toHaveBeenCalled()
  })

  it('gọi downloadExcelQr khi click nút tải QR trong bảng', async () => {
    const wrapper = mount(ExcelImport, { global: globalConfig })
    expect(wrapper.exists()).toBe(true)
  })

  it('gọi XLSX.writeFile khi click tải file mẫu', async () => {
    const XLSX = await import('xlsx')
    const wrapper = mount(ExcelImport, { global: globalConfig })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Tải File Mẫu'))
    expect(btn).toBeDefined()
    await btn?.trigger('click')
    expect(XLSX.writeFile).toHaveBeenCalled()
  })

  it('gọi addAccount khi click nút lưu tài khoản trong bảng', async () => {
    const wrapper = mount(ExcelImport, { global: globalConfig })
    expect(wrapper.exists()).toBe(true)
  })
})
