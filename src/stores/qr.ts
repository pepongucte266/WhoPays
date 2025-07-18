import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchVietQRStringFromAPI,
  type VietQRAPIData,
  type VietQRData,
  type VietQRAPIResponse,
} from '@/utils/vietqr'
import { useBanksStore } from '@/stores/banks'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'

// Hàm loại bỏ dấu tiếng Việt khỏi chuỗi
function removeVietnameseDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[-]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
}

export interface ExcelRecord extends VietQRData {
  id: number
  selected?: boolean
  qrDataUrl?: string
  error?: string
}

export interface QrDisplayData {
  qrDataUrl: string
  accountNumber: string
  amount?: number
  purpose?: string
  userBankName?: string
  imgId?: string
  bankBin?: string
}

export const useQrStore = defineStore('qr', () => {
  const banksStore = useBanksStore()

  // --- State ---
  const manualInput = reactive<VietQRData>({
    bankBin: '',
    accountNumber: '',
    nickname: undefined,
    amount: undefined,
    purpose: '',
  })
  const generatedQrString = ref<string | null>(null)
  const generatedQrDataUrl = ref<string | null>(null)
  const generatedQrResponse = ref<VietQRAPIResponse | null>(null) // Lưu toàn bộ response từ API

  const excelRecords = ref<ExcelRecord[]>([])
  const isProcessingExcel = ref<boolean>(false)
  const excelError = ref<string | null>(null)
  const uploadedExcelFile = ref<File | null>(null) // Store uploaded file info

  const isGeneratingQr = ref<boolean>(false)
  const generationError = ref<string | null>(null)

  // --- QR Navigation State ---
  const currentQrIndex = ref<number>(0)
  const showQrDialog = ref<boolean>(false)

  // --- Computed for navigation ---
  const qrList = computed<QrDisplayData[]>(() => {
    // Nếu có QR từ excelRecords, ưu tiên hiển thị danh sách này
    const excelQrs = excelRecords.value.filter((r) => r.qrDataUrl)
    if (excelQrs.length > 0) {
      return excelQrs.map((r) => ({
        qrDataUrl: r.qrDataUrl!,
        accountNumber: r.accountNumber,
        amount: r.amount,
        purpose: r.purpose,
        userBankName: r.nickname,
        imgId: undefined, // Không có imgId từ excel, có thể bổ sung nếu cần
        bankBin: r.bankBin,
      }))
    }
    // Nếu không, chỉ có 1 QR đơn lẻ
    if (generatedQrDataUrl.value) {
      return [
        {
          qrDataUrl: generatedQrDataUrl.value,
          accountNumber: manualInput.accountNumber,
          amount: manualInput.amount,
          purpose: manualInput.purpose,
          userBankName: generatedQrResponse.value?.userBankName || manualInput.nickname,
          imgId: generatedQrResponse.value?.imgId,
          bankBin: manualInput.bankBin,
        },
      ]
    }
    return []
  })
  const totalQrCount = computed(() => qrList.value.length)
  const currentQr = computed(() => qrList.value[currentQrIndex.value] || null)

  function nextQr() {
    if (currentQrIndex.value < totalQrCount.value - 1) {
      currentQrIndex.value++
    }
  }
  function prevQr() {
    if (currentQrIndex.value > 0) {
      currentQrIndex.value--
    }
  }
  function setCurrentQr(idx: number) {
    if (idx >= 0 && idx < totalQrCount.value) {
      currentQrIndex.value = idx
    }
  }
  function openQrDialog(idx = 0) {
    setCurrentQr(idx)
    showQrDialog.value = true
  }
  function closeQrDialog() {
    showQrDialog.value = false
  }

  // --- Actions ---

  /**
   * Tạo mã QR từ dữ liệu nhập thủ công.
   */
  async function generateSingleQrCode() {
    isGeneratingQr.value = true
    generationError.value = null
    generatedQrString.value = null
    generatedQrDataUrl.value = null
    generatedQrResponse.value = null

    try {
      if (!manualInput.bankBin || !manualInput.accountNumber) {
        throw new Error('Vui lòng nhập Mã Ngân hàng (BIN) và Số tài khoản.')
      }
      if (manualInput.amount !== undefined && manualInput.amount < 0) {
        throw new Error('Số tiền phải là số dương.')
      }
      if (!manualInput.nickname) {
        throw new Error('Vui lòng nhập Tên gợi nhớ / Chủ TK.')
      }

      const bankInfo = banksStore.getBankByBin(manualInput.bankBin)
      if (!bankInfo || !bankInfo.bankCode) {
        throw new Error(
          `Không tìm thấy thông tin hoặc mã ngân hàng (bankCode) cho BIN: ${manualInput.bankBin}.`,
        )
      }
      const bankCodeForAPI = bankInfo.bankCode

      // Loại bỏ dấu khỏi nội dung chuyển khoản
      const contentNoDiacritics = manualInput.purpose
        ? removeVietnameseDiacritics(manualInput.purpose)
        : ''

      const apiData: VietQRAPIData = {
        bankCode: bankCodeForAPI,
        bankAccount: manualInput.accountNumber,
        userBankName: manualInput.nickname,
        amount: manualInput.amount !== undefined ? String(manualInput.amount) : undefined,
        content: contentNoDiacritics,
      }

      const qrResponse = await fetchVietQRStringFromAPI(apiData)
      generatedQrResponse.value = qrResponse
      generatedQrString.value = qrResponse.qrCode

      const dataUrl = await QRCode.toDataURL(qrResponse.qrCode, { errorCorrectionLevel: 'M' })
      generatedQrDataUrl.value = dataUrl

      // Mở popup QR đơn lẻ
      openQrDialog(0)
    } catch (error: unknown) {
      console.error('Error generating single QR code:', error)
      generationError.value =
        error instanceof Error ? error.message : 'Lỗi không xác định khi tạo QR.'
    } finally {
      isGeneratingQr.value = false
    }
  }

  function clearManualForm() {
    manualInput.bankBin = ''
    manualInput.accountNumber = ''
    manualInput.nickname = undefined
    manualInput.amount = undefined
    manualInput.purpose = ''
    generatedQrString.value = null
    generatedQrDataUrl.value = null
    generationError.value = null
    generatedQrResponse.value = null
  }

  async function importFromExcel(file: File) {
    isProcessingExcel.value = true
    excelError.value = null
    excelRecords.value = []
    uploadedExcelFile.value = file // Store the uploaded file

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          if (!data) throw new Error('Không thể đọc file.')

          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          }) as string[][]

          if (!jsonData || !Array.isArray(jsonData) || jsonData.length < 2) {
            throw new Error('File Excel trống hoặc không có dữ liệu.')
          }

          const headers = jsonData[1].map((h) => String(h).trim().toLowerCase())
          const bankColIndex = headers.findIndex(
            (h) => h.includes('ngân hàng') || h.includes('bank') || h.includes('bin'),
          )
          const accIndex = headers.findIndex(
            (h) => h.includes('tài khoản') || h.includes('stk') || h.includes('account'),
          )
          const nicknameIndex = headers.findIndex(
            (h) =>
              h.includes('tên gợi nhớ') ||
              h.includes('chủ tk') ||
              h.includes('nickname') ||
              h.includes('holder'),
          )
          const amountIndex = headers.findIndex((h) => h.includes('tiền') || h.includes('amount'))
          const descIndex = headers.findIndex(
            (h) =>
              h.includes('nội dung') ||
              h.includes('description') ||
              h.includes('diễn giải') ||
              h.includes('purpose'),
          )

          if (bankColIndex === -1 || accIndex === -1 || nicknameIndex === -1) {
            throw new Error(
              "File Excel phải chứa cột 'Mã Ngân hàng (BIN)/Tên NH', 'Số tài khoản' và 'Tên gợi nhớ/Chủ TK'.",
            )
          }

          const records: ExcelRecord[] = []
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            const bankInput = String(row[bankColIndex] || '').trim()
            const accountNumber = String(row[accIndex] || '').trim()
            const nickname = String(row[nicknameIndex] || '').trim()

            if (bankInput && accountNumber && nickname) {
              let bankBin: string | undefined = undefined
              const bankByBin = banksStore.getBankByBin(bankInput)
              if (bankByBin) {
                bankBin = bankInput
              } else {
                const foundBank = Object.values(banksStore.banksMap).find(
                  (b) =>
                    b.bankShortName.toLowerCase() === bankInput.toLowerCase() ||
                    b.bankCode.toLowerCase() === bankInput.toLowerCase(),
                )
                if (foundBank) {
                  bankBin = foundBank.caiValue
                }
              }

              if (!bankBin) {
                console.warn(`Dòng ${i + 1}: Không tìm thấy BIN cho '${bankInput}'. Bỏ qua.`)
                continue
              }

              const amountRaw =
                amountIndex !== -1 ? String(row[amountIndex] || '').trim() : undefined
              const amount = amountRaw ? parseFloat(amountRaw.replace(/,/g, '')) : undefined
              const purpose = descIndex !== -1 ? String(row[descIndex] || '').trim() : undefined

              records.push({
                id: i,
                bankBin: bankBin,
                accountNumber,
                nickname: nickname,
                amount: amount !== undefined && !isNaN(amount) && amount >= 0 ? amount : undefined,
                purpose: purpose?.substring(0, 70),
                selected: false, // Let PrimeVue handle selection
              })
            }
          }

          if (records.length === 0) {
            throw new Error(
              'Không tìm thấy dữ liệu hợp lệ (cần Mã Ngân hàng/Tên NH, Số tài khoản, Tên gợi nhớ) trong file Excel.',
            )
          }

          excelRecords.value = records
        } catch (parseError: unknown) {
          console.error('Error parsing Excel data:', parseError)
          excelError.value =
            parseError instanceof Error ? parseError.message : 'Lỗi xử lý dữ liệu Excel.'
          excelRecords.value = []
        } finally {
          isProcessingExcel.value = false
        }
      }

      reader.onerror = (e) => {
        console.error('FileReader error:', e)
        excelError.value = 'Lỗi đọc file.'
        isProcessingExcel.value = false
      }

      reader.readAsArrayBuffer(file)
    } catch (error: unknown) {
      console.error('Error initiating Excel import:', error)
      excelError.value =
        error instanceof Error ? error.message : 'Lỗi không xác định khi bắt đầu import.'
      isProcessingExcel.value = false
    }
  }

  async function generateMultipleQrCodes() {
    isProcessingExcel.value = true
    const selectedRecords = excelRecords.value.filter((r) => r.selected)

    if (selectedRecords.length === 0) {
      excelError.value = 'Vui lòng chọn ít nhất một dòng để tạo QR.'
      isProcessingExcel.value = false
      return
    }

    await Promise.all(
      selectedRecords.map(async (record) => {
        try {
          record.error = undefined
          record.qrDataUrl = undefined

          if (!record.nickname) {
            throw new Error(`Dòng ${record.id}: Thiếu Tên gợi nhớ / Chủ TK.`)
          }

          const bankInfo = banksStore.getBankByBin(record.bankBin)
          if (!bankInfo || !bankInfo.bankCode) {
            throw new Error(
              `Dòng ${record.id}: Không tìm thấy thông tin hoặc mã ngân hàng (bankCode) cho BIN: ${record.bankBin}.`,
            )
          }
          const bankCodeForAPI = bankInfo.bankCode

          // Loại bỏ dấu khỏi nội dung chuyển khoản
          const contentNoDiacritics = record.purpose
            ? removeVietnameseDiacritics(record.purpose)
            : ''

          const apiData: VietQRAPIData = {
            bankCode: bankCodeForAPI,
            bankAccount: record.accountNumber,
            userBankName: record.nickname,
            amount: record.amount !== undefined ? String(record.amount) : undefined,
            content: contentNoDiacritics,
          }

          const qrResponse = await fetchVietQRStringFromAPI(apiData)
          record.qrDataUrl = await QRCode.toDataURL(qrResponse.qrCode, {
            errorCorrectionLevel: 'M',
          })
        } catch (error: unknown) {
          console.error(`Error generating QR for record ${record.id}:`, error)
          record.error = error instanceof Error ? error.message : 'Lỗi tạo QR.'
        }
      }),
    )

    excelRecords.value = [...excelRecords.value]
    isProcessingExcel.value = false

    // Sau khi tạo xong, mở popup QR ở vị trí đầu tiên
    if (excelRecords.value.filter((r) => r.qrDataUrl).length > 0) {
      openQrDialog(0)
    }
  }

  function triggerDownload(dataUrl: string, filename: string) {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function downloadSingleQr() {
    if (!generatedQrDataUrl.value || !manualInput.accountNumber) return

    const filename = `VietQR_${manualInput.accountNumber}${manualInput.amount ? '_' + manualInput.amount : ''}.png`
    triggerDownload(generatedQrDataUrl.value, filename)
  }

  function downloadExcelQr(recordId: number) {
    const record = excelRecords.value.find((r) => r.id === recordId)
    if (!record || !record.qrDataUrl) return

    const filename = `VietQR_${record.accountNumber}${record.amount ? '_' + record.amount : ''}.png`
    triggerDownload(record.qrDataUrl, filename)
  }

  return {
    manualInput,
    generatedQrString,
    generatedQrDataUrl,
    generatedQrResponse,
    isGeneratingQr,
    generationError,
    generateSingleQrCode,
    clearManualForm,
    downloadSingleQr,

    excelRecords,
    isProcessingExcel,
    excelError,
    uploadedExcelFile,
    importFromExcel,
    generateMultipleQrCodes,
    downloadExcelQr,
    clearExcelImport() {
      excelRecords.value = []
      uploadedExcelFile.value = null
      excelError.value = null
      isProcessingExcel.value = false
    },

    // Action to remove a record from excelRecords
    removeExcelRecord(recordId: number) {
      const index = excelRecords.value.findIndex((r) => r.id === recordId)
      if (index !== -1) {
        excelRecords.value.splice(index, 1)
      }
    },

    // QR navigation
    currentQrIndex,
    showQrDialog,
    qrList,
    totalQrCount,
    currentQr,
    nextQr,
    prevQr,
    setCurrentQr,
    openQrDialog,
    closeQrDialog,
  }
})
