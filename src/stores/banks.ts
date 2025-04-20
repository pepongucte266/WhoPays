import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchBankListFromAPI,
  fallbackBankData,
  type BankData, // Import kiểu BankData gốc từ API
} from '@/utils/vietqr'

// Định nghĩa kiểu dữ liệu cho thông tin ngân hàng đã xử lý trong store
// Sử dụng tên trường gốc từ API và thêm logoUrl
export interface BankInfo {
  id: string
  bankCode: string // Mã chữ (TCB, VCB)
  bankName: string // Tên đầy đủ
  bankShortName: string // Tên ngắn
  imageId: string // ID ảnh logo
  status: number
  caiValue: string // Mã BIN (970...)
  unlinkedType: number
  logoUrl: string // URL logo được xây dựng
}

// Định nghĩa kiểu dữ liệu cho một item trong dropdown
export interface BankSelectItem {
  label: string // Tên hiển thị (vd: "Techcombank (970407)")
  value: string // Giá trị thực sự (caiValue/BIN - vd: "970407")
}

export const useBanksStore = defineStore('banks', () => {
  // State
  // Key của map là caiValue (BIN)
  const banksMap = ref<Record<string, BankInfo>>({})
  const banksArray = ref<BankSelectItem[]>([]) // Array for dropdowns
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)

  // Getters
  // Đổi tên getter cho rõ ràng: nhận BIN (caiValue)
  const getBankByBin = computed(() => {
    return (bin: string): BankInfo | undefined => banksMap.value[bin]
  })

  // Getter mới để tìm bank bằng bankCode (mã chữ)
  const getBankByCode = computed(() => {
    return (code: string): BankInfo | undefined => {
      if (!code) return undefined
      const upperCaseCode = code.toUpperCase()
      // Duyệt qua map để tìm bank có bankCode khớp
      return Object.values(banksMap.value).find(
        (bank) => bank.bankCode.toUpperCase() === upperCaseCode,
      )
    }
  })

  const bankSelectOptions = computed(() => banksArray.value)

  // Actions
  async function fetchBanks(force = false) {
    const now = Date.now()
    if (!force && lastFetched.value && now - lastFetched.value < 3600 * 1000) {
      console.log('Using cached bank list.')
      return
    }

    isLoading.value = true
    error.value = null
    console.log('Fetching bank list from API...')

    try {
      // fetchBankListFromAPI trả về BankData[] hoặc null
      const data = (await fetchBankListFromAPI()) || []
      processBankData(data) // Truyền BankData[] vào process
      lastFetched.value = Date.now()
      console.log('Successfully fetched and processed bank list.')
    } catch (err: unknown) {
      console.error('Failed to fetch bank list from API, using fallback data.', err)
      error.value =
        err instanceof Error ? err.message : 'Lỗi không xác định khi tải danh sách ngân hàng.'
      if (Object.keys(banksMap.value).length === 0) {
        console.log('Initializing with fallback bank data.')
        // fallbackBankData cũng là BankData[]
        processBankData(fallbackBankData)
      }
    } finally {
      isLoading.value = false
    }
  }

  // Hàm xử lý dữ liệu thô BankData[] từ API
  function processBankData(data: BankData[]) {
    const newBanksMap: Record<string, BankInfo> = {}
    const newBanksArray: BankSelectItem[] = []

    data.forEach((bank) => {
      // Kiểm tra các trường thiết yếu từ API
      if (bank?.caiValue && bank?.bankCode && bank?.bankShortName && bank?.bankName) {
        // Xây dựng URL logo (giả định) - Cần thay đổi nếu URL thực tế khác
        const logoUrl = `https://api.vietqr.org/logo/${bank.bankCode}.png` // Hoặc dùng imageId nếu cần

        const bankInfo: BankInfo = {
          id: bank.id,
          bankCode: bank.bankCode,
          bankName: bank.bankName,
          bankShortName: bank.bankShortName,
          imageId: bank.imageId,
          status: bank.status,
          caiValue: bank.caiValue, // Đây là BIN
          unlinkedType: bank.unlinkedType,
          logoUrl: logoUrl, // Lưu URL logo đã xây dựng
        }
        // Key của map là caiValue (BIN)
        newBanksMap[bank.caiValue] = bankInfo

        // Tạo item cho dropdown
        newBanksArray.push({
          // Hiển thị tên ngắn và BIN (caiValue)
          label: `${bank.bankShortName} (${bank.caiValue})`,
          value: bank.caiValue, // Giá trị là BIN (caiValue)
        })
      } else {
        console.warn(
          'Skipping bank due to missing essential data (caiValue, bankCode, bankShortName, bankName):',
          bank,
        )
      }
    })

    // Sắp xếp danh sách cho dropdown theo tên ngắn (bankShortName)
    newBanksArray.sort((a, b) => {
      // Lấy bankShortName từ map để sort chính xác hơn
      const shortNameA = newBanksMap[a.value]?.bankShortName || ''
      const shortNameB = newBanksMap[b.value]?.bankShortName || ''
      return shortNameA.localeCompare(shortNameB)
    })

    banksMap.value = newBanksMap
    banksArray.value = newBanksArray
  }

  return {
    banksMap,
    banksArray,
    isLoading,
    error,
    lastFetched,
    getBankByBin, // Giữ tên getter nhưng giờ nó nhận BIN (caiValue)
    getBankByCode,
    bankSelectOptions,
    fetchBanks,
  }
})
