// src/utils/vietqr.ts

/**
 * Represents the data needed to generate a VietQR string and potentially store account info.
 * Uses internal field names like bankBin.
 */
export interface VietQRData {
  bankBin: string // Mã BIN ngân hàng (sẽ là caiValue từ API bank list)
  accountNumber: string // Số tài khoản
  nickname?: string // Tên gợi nhớ / Chủ TK (dùng cho lưu trữ, không vào QR payload)
  amount?: number // Số tiền (tùy chọn)
  purpose?: string // Nội dung chuyển khoản (tùy chọn, max 70 chars recommended)
}

/**
 * Interface for data required by the VietQR API endpoint for QR generation.
 * Uses API field names like bankCode.
 */
export interface VietQRAPIData {
  bankCode: string // Mã chữ của ngân hàng (TCB, VCB...)
  bankAccount: string // Số tài khoản
  userBankName: string // Tên gợi nhớ / Chủ tài khoản (Bắt buộc)
  amount?: string // API expects string, even for numbers
  content?: string // Nội dung chuyển khoản
}

/**
 * Interface for the response from the VietQR API.
 */
export interface VietQRAPIResponse {
  bankCode: string
  bankName: string
  bankAccount: string
  userBankName: string
  amount: string
  content: string
  qrCode: string
  imgId: string
  existing?: number
  transactionId?: string
  transactionRefId?: string
  qrLink?: string
  terminalCode?: string
  subTerminalCode?: string | null
  serviceCode?: string | null
  orderId?: string | null
  additionalData?: unknown[]
}

/**
 * Fetches the VietQR string from the external VietQR API.
 * @param data Data required for the API call (using API field names).
 * @returns The full API response (including qrCode, userBankName, ...).
 * @throws Throws an error if the API call fails or returns an error message.
 */
export async function fetchVietQRStringFromAPI(data: VietQRAPIData): Promise<VietQRAPIResponse> {
  const apiUrl = 'https://api.vietqr.org/vqr/api/qr/generate/unauthenticated'

  // Prepare the request body, ensuring amount is a string if present
  const requestBody = {
    bankAccount: data.bankAccount,
    userBankName: data.userBankName,
    bankCode: data.bankCode, // API này yêu cầu bankCode (mã chữ)
    amount: data.amount !== undefined ? String(data.amount) : '',
    content: data.content || '',
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
        Referer: 'https://vietqr.vn/',
      },
      body: JSON.stringify(requestBody),
    })

    const responseData = await response.json()

    if (!response.ok || !responseData.qrCode) {
      const errorMessage =
        responseData?.message || responseData?.desc || 'Failed to generate VietQR string.'
      throw new Error(`Lỗi API VietQR: ${errorMessage} (Status: ${response.status})`)
    }

    return responseData as VietQRAPIResponse
  } catch (error) {
    console.error('Error fetching VietQR from API:', error)
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('Lỗi không xác định khi gọi API tạo QR.')
    }
  }
}

// --- Bank List Fetching ---

// Type matching the structure from https://api.vietqr.org/vqr/api/bank-type
export interface BankData {
  id: string
  bankCode: string // Mã chữ (TCB, VCB)
  bankName: string // Tên đầy đủ
  bankShortName: string // Tên ngắn
  imageId: string // ID ảnh logo
  status: number
  caiValue: string // Mã BIN (970...)
  unlinkedType: number
}

/**
 * Helper to get bank logo URL from imgId (VietQR API).
 */
export function getBankLogoUrl(imgId: string): string {
  return `https://api.vietqr.org/vqr/api/images/${imgId}`
}

// Fallback data using the raw API structure
export const fallbackBankData: BankData[] = [
  {
    id: '04df3963-2fa7-476d-b4b5-2cedb3218b5a',
    bankCode: 'TCB',
    bankName: 'Ngân hàng TMCP Kỹ thương Việt Nam',
    bankShortName: 'Techcombank',
    imageId: '97c7b39e-812c-48b5-8126-16e187cfe91b',
    status: 0,
    caiValue: '970407',
    unlinkedType: 0,
  },
  {
    id: '089cb1a5-39b4-4244-b80e-bbe3104c3e2f',
    bankCode: 'ACB',
    bankName: 'Ngân hàng TMCP Á Châu',
    bankShortName: 'ACB',
    imageId: 'e917e05e-c370-4ae7-82c9-e16c9200b3fe',
    status: 0,
    caiValue: '970416',
    unlinkedType: 0,
  },
  {
    id: 'f44cbe47-cb2b-427e-98b5-10afa0375690',
    bankCode: 'BIDV',
    bankName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    bankShortName: 'BIDV',
    imageId: 'cb18c1b3-d661-4695-b2e8-dba8e887abd6',
    status: 1,
    caiValue: '970418',
    unlinkedType: 1,
  },
  {
    id: 'aa4e489b-254e-4351-9cd4-f62e09c63ebc',
    bankCode: 'MB',
    bankName: 'Ngân hàng TMCP Quân đội',
    bankShortName: 'MBBank',
    imageId: '58b7190b-a294-4b14-968f-cd365593893e',
    status: 1,
    caiValue: '970422',
    unlinkedType: 0,
  },
  {
    id: 'ebd51e4f-6036-431d-a5c8-0dbde770ea0f',
    bankCode: 'VCB',
    bankName: 'Ngân hàng TMCP Ngoại Thương Việt Nam',
    bankShortName: 'Vietcombank',
    imageId: 'd0e196fc-3d4c-4501-b453-ac8c3df968cf',
    status: 0,
    caiValue: '970436',
    unlinkedType: 0,
  },
  {
    id: '3ed1ce8f-0d30-40fd-968b-0b101ae33f7d',
    bankCode: 'ICB',
    bankName: 'Ngân hàng TMCP Công thương Việt Nam',
    bankShortName: 'Vietinbank',
    imageId: '22abf9a2-6ede-4e48-8b8a-9c8fc1303c22',
    status: 0,
    caiValue: '970415',
    unlinkedType: 0,
  },
  {
    id: '969be03c-4676-42f9-b110-f0bce4268e1d',
    bankCode: 'VBA',
    bankName: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam',
    bankShortName: 'Agribank',
    imageId: '6cbf8835-7615-4f87-bbdb-56ee7ad7839a',
    status: 0,
    caiValue: '970405',
    unlinkedType: 0,
  },
  // Add more banks if needed
]

/**
 * Fetches the list of banks from the VietQR API.
 * Returns the raw data directly from the API.
 * @returns An array of BankData objects or null if the fetch fails.
 */
export async function fetchBankListFromAPI(): Promise<BankData[] | null> {
  const apiUrl = 'https://api.vietqr.org/vqr/api/bank-type'
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Assume the API returns data matching the BankData interface
    const data: BankData[] = await response.json()
    // Basic validation: check if it's an array
    if (!Array.isArray(data)) {
      console.error('API response is not an array:', data)
      throw new Error('Invalid data format received from bank list API.')
    }
    return data
  } catch (error) {
    console.error('Error fetching bank list from API:', error)
    return null // Return null to indicate failure
  }
}
