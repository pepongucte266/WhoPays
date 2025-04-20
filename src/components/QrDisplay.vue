<script setup lang="ts">
import { computed } from 'vue'
import { useQrStore } from '@/stores/qr'
// import { ArrowDownTrayIcon } from '@heroicons/vue/24/solid' // Removed Heroicon

const qrStore = useQrStore()

// Props để nhận dữ liệu QR từ component cha (ví dụ: HomeView)
// Điều này giúp component linh hoạt hơn, có thể hiển thị QR đơn lẻ hoặc QR từ Excel
const props = defineProps<{
  qrDataUrl: string | null | undefined
  accountNumber: string | undefined
  amount: number | undefined
  purpose?: string | undefined
  downloadHandler?: () => void // Hàm xử lý download tùy chỉnh (ví dụ: downloadSingleQr hoặc downloadExcelQr)
  recordId?: number // ID của bản ghi Excel (nếu có, để dùng cho downloadExcelQr)
}>()

const displayAmount = computed(() => {
  if (props.amount === undefined || props.amount === null) return 'Không cố định'
  return props.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
})

const displayPurpose = computed(() => props.purpose || 'Không có')

const canDownload = computed(() => !!props.qrDataUrl && !!props.downloadHandler)

function handleDownload() {
  if (props.downloadHandler) {
    props.downloadHandler()
  } else if (props.recordId !== undefined) {
    // Fallback nếu không có handler nhưng có recordId (trường hợp QR từ Excel)
    qrStore.downloadExcelQr(props.recordId)
  } else {
    // Fallback cho QR đơn lẻ nếu không có handler
    qrStore.downloadSingleQr()
  }
}
</script>

<template>
  <div v-if="qrDataUrl"
    class="qr-display bg-gray-700 p-4 rounded-lg shadow border border-gray-600 text-center flex flex-col items-center">
    <h3 class="text-md font-medium mb-3 text-gray-200">Mã VietQR</h3>
    <img :src="qrDataUrl" alt="VietQR Code"
      class="w-48 h-48 md:w-56 md:h-56 object-contain bg-white p-1 rounded mb-4" />

    <div class="text-xs text-gray-300 space-y-1 mb-4 text-left w-full px-2">
      <p><span class="font-medium text-gray-400">Số TK:</span> {{ accountNumber || 'N/A' }}</p>
      <p><span class="font-medium text-gray-400">Số tiền:</span> {{ displayAmount }}</p>
      <p><span class="font-medium text-gray-400">Nội dung:</span> <span class="break-words">{{ displayPurpose }}</span>
      </p>
    </div>

    <button v-if="canDownload" @click="handleDownload" title="Tải xuống mã QR"
      class="mt-auto px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition duration-200 ease-in-out flex items-center">
      <i class="pi pi-download h-4 w-4 mr-1"></i> <!-- Replaced with PrimeIcon -->
      Tải xuống (PNG)
    </button>
    <p v-else class="mt-auto text-xs text-gray-500 italic">Không thể tải xuống</p>
  </div>
  <div v-else
    class="qr-display-placeholder bg-gray-700 p-6 rounded-lg shadow border border-gray-600 text-center flex flex-col items-center justify-center min-h-[300px]">
    <p class="text-gray-400">Nhập thông tin và nhấn "Tạo QR" để hiển thị mã tại đây.</p>
  </div>
</template>
