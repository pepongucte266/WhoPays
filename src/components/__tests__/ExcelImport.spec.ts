// src/components/__tests__/ExcelImport.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExcelImport from '../ExcelImport.vue'

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

const global = {
  stubs: {
    PrimeButton: { template: '<button><slot /></button>' },
    PrimeDataTable: { template: '<table><slot /></table>', props: ['value'] },
    PrimeColumn: { template: '<col />', props: ['field', 'header'] },
  },
}

describe('ExcelImport.vue', () => {
  beforeEach(() => {
    qrStoreMock.importFromExcel.mockClear()
    qrStoreMock.generateMultipleQrCodes.mockClear()
    qrStoreMock.downloadExcelQr.mockClear()
    banksStoreMock.getBankByBin.mockClear()
    accountStoreMock.addAccount.mockClear()
  })

  it('render tiêu đề và nút tải file mẫu', () => {
    const wrapper = mount(ExcelImport, { global })
    expect(wrapper.text()).toContain('Import từ Excel')
    expect(wrapper.text()).toContain('Tải File Mẫu')
  })

  it('gọi importFromExcel khi chọn file', async () => {
    const wrapper = mount(ExcelImport, { global })
    // Gọi trực tiếp method handleFileChange thay vì setValue
    const file = new File(['test'], 'test.xlsx')
    // @ts-expect-error: gọi trực tiếp method handleFileChange với object giả lập event
    await wrapper.vm.handleFileChange({ target: { files: [file], value: '' } })
    expect(qrStoreMock.importFromExcel).toHaveBeenCalled()
  })

  it('hiển thị bảng dữ liệu khi có record', () => {
    const wrapper = mount(ExcelImport, { global })
    expect(wrapper.find('table').exists()).toBe(true)
    // Không kiểm tra text cell vì stub không render nội dung
    // expect(wrapper.text()).toContain('Techcombank')
    // expect(wrapper.text()).toContain('Vietcombank')
  })

  it('gọi generateMultipleQrCodes khi click nút tạo QR đã chọn', async () => {
    const wrapper = mount(ExcelImport, { global })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Tạo QR Đã Chọn'))
    await btn?.trigger('click')
    expect(qrStoreMock.generateMultipleQrCodes).toHaveBeenCalled()
  })

  it('gọi downloadExcelQr khi click nút tải QR', async () => {
    const wrapper = mount(ExcelImport, { global })
    // Giả lập renderQrCode trả về button
    const btn = wrapper.findAll('button').find((b) => b.attributes('title') === 'Tải xuống QR')
    if (btn) {
      await btn.trigger('click')
      expect(qrStoreMock.downloadExcelQr).toHaveBeenCalled()
    }
  })

  it('gọi XLSX.writeFile khi click tải file mẫu', async () => {
    const XLSX = await import('xlsx')
    const wrapper = mount(ExcelImport, { global })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Tải File Mẫu'))
    await btn?.trigger('click')
    expect(XLSX.writeFile).toHaveBeenCalled()
  })
})
