import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { generateVietQRString, type VietQRData, bankBins } from '@/utils/vietqr'
import QRCode from 'qrcode' // Thư viện tạo hình ảnh QR
import * as XLSX from 'xlsx' // Thư viện đọc Excel (sheetjs)

// Định nghĩa cấu trúc dữ liệu cho một bản ghi từ Excel
export interface ExcelRecord extends VietQRData {
  id: number // Để định danh duy nhất mỗi dòng
  selected?: boolean // Trạng thái chọn
  qrDataUrl?: string // Data URL của QR code tương ứng
  error?: string // Lỗi nếu có khi tạo QR cho dòng này
}

export const useQrStore = defineStore('qr', () => {
  // --- State ---

  // Manual Input Form
  const manualInput = reactive<VietQRData>({
    bankBin: '',
    accountNumber: '',
    amount: undefined,
    purpose: '',
  })
  const generatedQrString = ref<string | null>(null)
  const generatedQrDataUrl = ref<string | null>(null) // Data URL for the single generated QR

  // Excel Import
  const excelRecords = ref<ExcelRecord[]>([])
  const isProcessingExcel = ref<boolean>(false)
  const excelError = ref<string | null>(null)

  // Loading/Error for single QR generation
  const isGeneratingQr = ref<boolean>(false)
  const generationError = ref<string | null>(null)

  // --- Actions ---

  /**
   * Tạo mã QR từ dữ liệu nhập thủ công.
   */
  async function generateSingleQrCode() {
    isGeneratingQr.value = true
    generationError.value = null
    generatedQrString.value = null
    generatedQrDataUrl.value = null

    try {
      if (!manualInput.bankBin || !manualInput.accountNumber) {
        throw new Error('Vui lòng nhập Mã Ngân hàng (BIN) và Số tài khoản.')
      }
      if (manualInput.amount !== undefined && manualInput.amount < 0) {
        throw new Error('Số tiền phải là số dương.')
      }
      if (!bankBins[manualInput.bankBin]) {
        // Cân nhắc: Có thể không cần check cứng nếu danh sách BIN không đầy đủ
        console.warn(`Bank BIN ${manualInput.bankBin} not in known list.`)
      }

      const qrString = generateVietQRString(manualInput)
      generatedQrString.value = qrString

      // Tạo Data URL từ chuỗi VietQR
      const dataUrl = await QRCode.toDataURL(qrString, { errorCorrectionLevel: 'M' }) // Mức sửa lỗi trung bình
      generatedQrDataUrl.value = dataUrl
    } catch (error: unknown) {
      console.error('Error generating single QR code:', error)
      generationError.value =
        error instanceof Error ? error.message : 'Lỗi không xác định khi tạo QR.'
    } finally {
      isGeneratingQr.value = false
    }
  }

  /**
   * Xóa dữ liệu trên form nhập thủ công.
   */
  function clearManualForm() {
    manualInput.bankBin = ''
    manualInput.accountNumber = ''
    manualInput.amount = undefined
    manualInput.purpose = ''
    generatedQrString.value = null
    generatedQrDataUrl.value = null
    generationError.value = null
  }

  /**
   * Xử lý file Excel được tải lên.
   * @param file File Excel (.xlsx hoặc .xls)
   */
  async function importFromExcel(file: File) {
    isProcessingExcel.value = true
    excelError.value = null
    excelRecords.value = []

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          if (!data) throw new Error('Không thể đọc file.')

          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          // Chuyển sheet thành JSON, giả sử dòng đầu là header
          // header: 1 nghĩa là dòng 1 là header, không phải 0
          // defval: '' để ô trống là chuỗi rỗng thay vì undefined
          // Sử dụng unknown[][] và kiểm tra kiểu sau đó sẽ an toàn hơn,
          // nhưng any[][] thường được chấp nhận cho bước chuyển đổi ban đầu này.
          // Nếu ESLint vẫn báo lỗi, có thể cần cấu hình lại rule hoặc dùng // eslint-disable-next-line
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          }) as string[][] // Hoặc unknown[][]

          if (!jsonData || !Array.isArray(jsonData) || jsonData.length < 2) {
            // Cần ít nhất 1 dòng header và 1 dòng dữ liệu
            throw new Error('File Excel trống hoặc không có dữ liệu.')
          }

          // Xác định header (dòng đầu tiên)
          const headers = jsonData[0].map((h) => String(h).trim().toLowerCase())
          // Tìm index của các cột cần thiết (linh hoạt với tên cột)
          const binIndex = headers.findIndex(
            (h) => h.includes('bin') || h.includes('ngan hang') || h.includes('ngân hàng'),
          )
          const accIndex = headers.findIndex(
            (h) => h.includes('tai khoan') || h.includes('tài khoản') || h.includes('stk'),
          )
          const amountIndex = headers.findIndex(
            (h) => h.includes('tien') || h.includes('tiền') || h.includes('amount'),
          )
          const descIndex = headers.findIndex(
            (h) =>
              h.includes('noi dung') ||
              h.includes('nội dung') ||
              h.includes('description') ||
              h.includes('dien giai') ||
              h.includes('diễn giải'),
          )

          if (binIndex === -1 || accIndex === -1) {
            throw new Error("File Excel phải chứa cột 'Mã Ngân hàng (BIN)' và 'Số tài khoản'.")
          }

          const records: ExcelRecord[] = []
          // Bắt đầu từ dòng thứ 2 (index 1) để lấy dữ liệu
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            const bankBin = String(row[binIndex] || '').trim()
            const accountNumber = String(row[accIndex] || '').trim()

            // Chỉ thêm dòng nếu có cả BIN và Số tài khoản
            if (bankBin && accountNumber) {
              const amountRaw =
                amountIndex !== -1 ? String(row[amountIndex] || '').trim() : undefined
              const amount = amountRaw ? parseFloat(amountRaw.replace(/,/g, '')) : undefined // Xử lý dấu phẩy nếu có
              const purpose = descIndex !== -1 ? String(row[descIndex] || '').trim() : undefined

              records.push({
                id: i, // Dùng index dòng làm ID tạm thời
                bankBin,
                accountNumber,
                amount: amount !== undefined && !isNaN(amount) && amount >= 0 ? amount : undefined, // Validate amount cơ bản
                purpose: purpose?.substring(0, 70), // Giới hạn nội dung
                selected: true, // Mặc định chọn tất cả
              })
            }
          }

          if (records.length === 0) {
            throw new Error(
              'Không tìm thấy dữ liệu hợp lệ (cần Mã Ngân hàng và Số tài khoản) trong file Excel.',
            )
          }

          excelRecords.value = records
        } catch (parseError: unknown) {
          console.error('Error parsing Excel data:', parseError)
          excelError.value =
            parseError instanceof Error ? parseError.message : 'Lỗi xử lý dữ liệu Excel.'
          excelRecords.value = [] // Xóa dữ liệu nếu lỗi
        } finally {
          isProcessingExcel.value = false
        }
      }

      reader.onerror = (e) => {
        console.error('FileReader error:', e)
        excelError.value = 'Lỗi đọc file.'
        isProcessingExcel.value = false
      }

      reader.readAsArrayBuffer(file) // Đọc file dưới dạng ArrayBuffer
    } catch (error: unknown) {
      console.error('Error initiating Excel import:', error)
      excelError.value =
        error instanceof Error ? error.message : 'Lỗi không xác định khi bắt đầu import.'
      isProcessingExcel.value = false
    }
  }

  /**
   * Tạo mã QR cho các bản ghi đã chọn từ Excel.
   */
  async function generateMultipleQrCodes() {
    isProcessingExcel.value = true // Dùng chung cờ loading
    const selectedRecords = excelRecords.value.filter((r) => r.selected)

    if (selectedRecords.length === 0) {
      excelError.value = 'Vui lòng chọn ít nhất một dòng để tạo QR.'
      isProcessingExcel.value = false
      return
    }

    // Tạo QR cho từng dòng đã chọn
    await Promise.all(
      selectedRecords.map(async (record) => {
        try {
          record.error = undefined // Reset lỗi cũ
          record.qrDataUrl = undefined // Reset QR cũ
          const qrString = generateVietQRString(record)
          record.qrDataUrl = await QRCode.toDataURL(qrString, { errorCorrectionLevel: 'M' })
        } catch (error: unknown) {
          console.error(`Error generating QR for record ${record.id}:`, error)
          record.error = error instanceof Error ? error.message : 'Lỗi tạo QR.'
        }
      }),
    )

    // Cập nhật lại ref để Vue nhận biết thay đổi sâu trong mảng object
    excelRecords.value = [...excelRecords.value]
    isProcessingExcel.value = false
  }

  /**
   * Helper function to trigger download
   */
  function triggerDownload(dataUrl: string, filename: string) {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Tải xuống mã QR đơn lẻ.
   */
  function downloadSingleQr() {
    if (!generatedQrDataUrl.value || !manualInput.accountNumber) return

    const filename = `VietQR_${manualInput.accountNumber}${manualInput.amount ? '_' + manualInput.amount : ''}.png`
    triggerDownload(generatedQrDataUrl.value, filename)
  }

  /**
   * Tải xuống mã QR cho một bản ghi Excel cụ thể.
   * @param recordId ID của bản ghi Excel
   */
  function downloadExcelQr(recordId: number) {
    const record = excelRecords.value.find((r) => r.id === recordId)
    if (!record || !record.qrDataUrl) return

    const filename = `VietQR_${record.accountNumber}${record.amount ? '_' + record.amount : ''}.png`
    triggerDownload(record.qrDataUrl, filename)
  }

  // --- Return ---
  return {
    // Manual Input
    manualInput,
    generatedQrString,
    generatedQrDataUrl,
    isGeneratingQr,
    generationError,
    generateSingleQrCode,
    clearManualForm,
    downloadSingleQr,

    // Excel Import
    excelRecords,
    isProcessingExcel,
    excelError,
    importFromExcel,
    generateMultipleQrCodes,
    downloadExcelQr,
  }
})
