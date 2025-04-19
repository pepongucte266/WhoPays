// src/utils/vietqr.ts

/**
 * Represents the data needed to generate a VietQR string.
 */
export interface VietQRData {
  bankBin: string // Mã BIN ngân hàng
  accountNumber: string // Số tài khoản
  amount?: number // Số tiền (tùy chọn)
  purpose?: string // Nội dung chuyển khoản (tùy chọn, max 70 chars recommended)
}

// Constants for VietQR fields based on NAPAS specification
const PAYLOAD_FORMAT_INDICATOR = '00'
const INITIATION_METHOD = '01' // 11 for dynamic QR, 12 for static QR (reusable)
const MERCHANT_ACCOUNT_INFO = '38'
const MERCHANT_INFO_GUID = '00' // GUID for VietQR
const MERCHANT_INFO_GUID_VALUE = 'A000000727'
const MERCHANT_INFO_BANK_INFO = '01' // Contains Bank BIN and Account Number
const MERCHANT_INFO_BANK_BIN = '00'
const MERCHANT_INFO_ACCOUNT_NUMBER = '01'
const TRANSACTION_CURRENCY = '53'
const TRANSACTION_CURRENCY_VALUE = '704' // VND
const TRANSACTION_AMOUNT = '54'
const COUNTRY_CODE = '58'
const COUNTRY_CODE_VALUE = 'VN'
const ADDITIONAL_DATA = '62'
const ADDITIONAL_DATA_PURPOSE = '08'
const CRC16 = '63'

/**
 * Builds a TLV (Tag-Length-Value) string segment.
 * @param tag The tag number (string).
 * @param value The value (string).
 * @returns The TLV formatted string.
 */
function buildTLV(tag: string, value: string): string {
  const length = value.length.toString().padStart(2, '0')
  return `${tag}${length}${value}`
}

/**
 * Generates the VietQR payload string (before CRC calculation).
 * @param data The VietQR data.
 * @param isDynamic Whether the QR is for a single transaction (dynamic) or reusable (static). Defaults to true (dynamic).
 * @returns The VietQR payload string.
 */
function generateVietQRPayload(data: VietQRData, isDynamic: boolean = true): string {
  const { bankBin, accountNumber, amount, purpose } = data

  if (!bankBin || !accountNumber) {
    throw new Error('Bank BIN and Account Number are required.')
  }

  // Merchant Account Information block
  const bankInfo =
    buildTLV(MERCHANT_INFO_BANK_BIN, bankBin) +
    buildTLV(MERCHANT_INFO_ACCOUNT_NUMBER, accountNumber)
  const merchantAccountInfoValue =
    buildTLV(MERCHANT_INFO_GUID, MERCHANT_INFO_GUID_VALUE) +
    buildTLV(MERCHANT_INFO_BANK_INFO, bankInfo)
  const merchantAccountInfoTLV = buildTLV(MERCHANT_ACCOUNT_INFO, merchantAccountInfoValue)

  // Initiation Method
  const initiationMethodValue = isDynamic ? '11' : '12' // 11 for one-time payment, 12 for reusable
  const initiationMethodTLV = buildTLV(INITIATION_METHOD, initiationMethodValue)

  // Start building the payload
  let payload =
    buildTLV(PAYLOAD_FORMAT_INDICATOR, '01') + initiationMethodTLV + merchantAccountInfoTLV

  // Add mandatory fields
  payload += buildTLV(TRANSACTION_CURRENCY, TRANSACTION_CURRENCY_VALUE)

  // Add optional amount if provided and dynamic
  if (amount !== undefined && amount > 0 && isDynamic) {
    payload += buildTLV(TRANSACTION_AMOUNT, amount.toString())
  }

  // Add country code
  payload += buildTLV(COUNTRY_CODE, COUNTRY_CODE_VALUE)

  // Add optional additional data (purpose)
  if (purpose) {
    // Ensure purpose doesn't exceed recommended length (though standard allows more)
    const truncatedPurpose = purpose.substring(0, 70)
    const additionalDataValue = buildTLV(ADDITIONAL_DATA_PURPOSE, truncatedPurpose)
    payload += buildTLV(ADDITIONAL_DATA, additionalDataValue)
  }

  // Add CRC tag placeholder (will be calculated later)
  payload += buildTLV(CRC16, '04') // Placeholder '04' for length

  return payload
}

/**
 * Calculates CRC16-CCITT checksum.
 * Polynomial: 0x1021
 * Initial Value: 0xFFFF
 * @param data The input string data.
 * @returns The CRC16 checksum as a 4-character uppercase hex string.
 */
function calculateCRC16CCITT(data: string): string {
  let crc = 0xffff
  const polynomial = 0x1021

  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i)
    crc ^= byte << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial
      } else {
        crc <<= 1
      }
    }
  }

  crc &= 0xffff // Ensure it's a 16-bit value
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Generates the complete VietQR string including the CRC checksum.
 * @param data The VietQR data.
 * @param isDynamic Whether the QR is for a single transaction (dynamic) or reusable (static). Defaults to true (dynamic).
 * @returns The final VietQR string ready for QR code generation.
 */
export function generateVietQRString(data: VietQRData, isDynamic: boolean = true): string {
  const payloadWithoutCRCPlaceholder = generateVietQRPayload(data, isDynamic)
  // Remove the CRC placeholder (last 4 chars: tag '63', length '04') before calculating CRC
  const payloadForCRC = payloadWithoutCRCPlaceholder.slice(0, -4)
  const crcValue = calculateCRC16CCITT(payloadForCRC)
  // Replace the placeholder with the actual CRC value
  const finalPayload = payloadForCRC + crcValue
  return finalPayload
}

// Example Usage (can be removed later)
/*
try {
  const qrData: VietQRData = {
    bankBin: '970418', // Example BIN (VietinBank)
    accountNumber: '1234567890', // Example Account
    amount: 50000,
    purpose: 'Thanh toan don hang XYZ',
  };
  const vietQRString = generateVietQRString(qrData);
  console.log('VietQR String:', vietQRString);
  // You would then pass this string to a QR code library like 'qrcode'
} catch (error) {
  console.error('Error generating VietQR:', error);
}

try {
    const staticQrData: VietQRData = {
        bankBin: '970436', // Example BIN (Vietcombank)
        accountNumber: '0987654321', // Example Account
        purpose: 'Ung ho quy ABC', // Purpose can still be added to static QR
    };
    const staticVietQRString = generateVietQRString(staticQrData, false); // Set isDynamic to false
    console.log('Static VietQR String:', staticVietQRString);
} catch (error) {
    console.error('Error generating static VietQR:', error);
}
*/

// TODO: Add a list or mechanism to validate Bank BINs
export const bankBins: { [key: string]: string } = {
  '970418': 'VietinBank',
  '970436': 'Vietcombank',
  '970415': 'BIDV',
  '970405': 'Agribank',
  '970422': 'MB Bank',
  '970432': 'Techcombank',
  '970423': 'TPBank',
  '970407': 'VPBank',
  '970441': 'VIB',
  '970429': 'Sacombank',
  '970414': 'OceanBank',
  '970419': 'NCB',
  '970425': 'An Binh Bank',
  '970428': 'Nam A Bank',
  '970431': 'Eximbank',
  '970437': 'HDBank',
  '970438': 'Bao Viet Bank',
  '970440': 'SeABank',
  '970443': 'SHB',
  '970448': 'OCB',
  '970449': 'LienVietPostBank',
  '970452': 'Kien Long Bank',
  '970454': 'VietCapital Bank',
  '970457': 'PVcomBank',
  '970458': 'VietBank',
  '970468': 'DongA Bank', // Note: DongA Bank might have issues with VietQR sometimes
  // Add more banks as needed
}
