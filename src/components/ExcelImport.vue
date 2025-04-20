<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQrStore } from '@/stores/qr'
// import { bankBins } from '@/utils/vietqr' // Xóa import bankBins
import { useBanksStore } from '@/stores/banks' // Import banks store
import * as XLSX from 'xlsx' // Import xlsx
// import type { VietQRData } from '@/utils/vietqr' // Xóa import không sử dụng
// import { ArrowUpTrayIcon, QrCodeIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/solid' // Xóa import Heroicons
import QrDisplay from './QrDisplay.vue'

const qrStore = useQrStore()
const banksStore = useBanksStore() // Khởi tạo banks store
const fileInput = ref<HTMLInputElement | null>(null)

const records = computed(() => qrStore.excelRecords)
const isLoading = computed(() => qrStore.isProcessingExcel)
const error = computed(() => qrStore.excelError)

// Xóa hàm findBinByName không sử dụng
// function findBinByName(name: string): string | undefined { ... }

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // Gọi action trong store để xử lý file
    // Lưu ý: Action importFromExcel trong store cần được cập nhật để sử dụng banksStore
    qrStore.importFromExcel(file)
  }
  // Reset input để có thể chọn lại cùng file
  if (target) target.value = ''
}

function generateSelectedQrCodes() {
  qrStore.generateMultipleQrCodes()
}

// Tính toán để bật/tắt nút "Tạo QR"
const canGenerateMultiple = computed(() => {
  return records.value.length > 0 && records.value.some(r => r.selected) && !isLoading.value;
});

// Checkbox chọn tất cả
const allSelected = computed({
  get: () => records.value.length > 0 && records.value.every(r => r.selected),
  set: (value) => records.value.forEach(r => r.selected = value)
});

/**
 * Tạo và tải xuống file Excel mẫu.
 */
function downloadSampleExcel() {
  // Cập nhật file mẫu để bao gồm cột Tên gợi nhớ/Chủ TK
  const sampleData = [
    ['Mã Ngân hàng (BIN)/Tên NH', 'Số tài khoản', 'Tên gợi nhớ/Chủ TK', 'Số tiền', 'Nội dung'],
    ['970436', '0123456789', 'NGUYEN VAN A', '50000', 'Thanh toán hóa đơn ABC'],
    ['Vietinbank', '9876543210', 'TRAN THI B', '', 'Chuyển tiền học phí'], // Dùng tên NH
    ['970422', '1122334455', 'LE VAN C', '1000000', ''], // Để trống nội dung
  ];

  try {
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    // Tùy chỉnh độ rộng cột
    ws['!cols'] = [
      { wch: 25 }, // Mã Ngân hàng/Tên NH
      { wch: 20 }, // Số tài khoản
      { wch: 25 }, // Tên gợi nhớ/Chủ TK
      { wch: 15 }, // Số tiền
      { wch: 30 }  // Nội dung
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DuLieuMau');
    XLSX.writeFile(wb, 'Mau_Import_QR.xlsx');
  } catch (error) {
    console.error("Error generating sample Excel file:", error);
    alert("Đã xảy ra lỗi khi tạo file mẫu. Vui lòng thử lại.");
  }
}

</script>

<template>
  <div class="excel-import bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
    <div class="flex justify-between items-center mb-4 gap-4"> <!-- Thêm gap -->
      <h2 class="text-lg font-semibold text-green-400">Import từ Excel</h2>
      <div class="flex gap-2"> <!-- Gom các nút lại -->
        <button @click="downloadSampleExcel" title="Tải file Excel mẫu"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition duration-200 ease-in-out flex items-center text-sm">
          <i class="pi pi-download mr-2"></i> <!-- PrimeIcon -->
          Tải File Mẫu
        </button>
        <input type="file" ref="fileInput" @change="handleFileChange" accept=".xlsx, .xls" class="hidden" />
        <button @click="triggerFileInput" :disabled="isLoading" title="Chọn file Excel"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm">
          <i class="pi pi-upload mr-2"></i> <!-- PrimeIcon -->
          Chọn File (.xlsx, .xls)
        </button>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="text-center text-gray-400 py-4">
      <svg class="animate-spin mx-auto h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
      <p class="mt-2">Đang xử lý file...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error && !isLoading" class="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 text-sm rounded-md">
      {{ error }}
    </div>

    <!-- Data Table -->
    <div v-if="records.length > 0 && !isLoading" class="mt-4 overflow-x-auto">
      <div class="flex justify-end mb-2">
        <button @click="generateSelectedQrCodes" :disabled="!canGenerateMultiple" title="Tạo mã QR cho các mục đã chọn"
          class="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm">
          <i class="pi pi-qrcode mr-1"></i> <!-- PrimeIcon -->
          Tạo QR Đã Chọn
        </button>
      </div>
      <table class="min-w-full divide-y divide-gray-600 border border-gray-600">
        <thead class="bg-gray-700">
          <tr>
            <th scope="col" class="p-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-10">
              <input type="checkbox" v-model="allSelected"
                class="rounded border-gray-500 bg-gray-600 text-blue-500 focus:ring-blue-500" />
            </th>
            <th scope="col" class="p-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ngân hàng
            </th>
            <th scope="col" class="p-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Số tài
              khoản</th>
            <th scope="col" class="p-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tên gợi
              nhớ/Chủ TK</th> {/* Thêm cột header */}
            <th scope="col" class="p-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Số tiền
            </th>
            <th scope="col" class="p-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nội dung
            </th>
            <th scope="col" class="p-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">QR Code
            </th>
            <th scope="col" class="p-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Lỗi</th>
          </tr>
        </thead>
        <tbody class="bg-gray-800 divide-y divide-gray-700">
          <tr v-for="record in records" :key="record.id" class="hover:bg-gray-700/50">
            <td class="p-3 whitespace-nowrap text-center">
              <input type="checkbox" v-model="record.selected"
                class="rounded border-gray-500 bg-gray-600 text-blue-500 focus:ring-blue-500" />
            </td>
            <td class="p-3 whitespace-nowrap text-sm text-gray-200">
              {{ banksStore.getBankByBin(record.bankBin)?.shortName || record.bankBin }} {/* Hiển thị shortName hoặc BIN
              */}
            </td>
            <td class="p-3 whitespace-nowrap text-sm text-gray-200">{{ record.accountNumber }}</td>
            <td class="p-3 whitespace-nowrap text-sm text-gray-200">{{ record.nickname || '-' }}</td> {/* Hiển thị
            nickname */}
            <td class="p-3 whitespace-nowrap text-sm text-gray-200 text-right">{{ record.amount?.toLocaleString('vi-VN')
              ?? '-' }}</td>
            <td class="p-3 text-sm text-gray-300 max-w-xs truncate" :title="record.purpose">{{ record.purpose || '-' }}
            </td>
            <td class="p-3 whitespace-nowrap text-center">
              <button v-if="record.qrDataUrl" @click="qrStore.downloadExcelQr(record.id)" title="Tải xuống QR"
                class="text-blue-400 hover:text-blue-300">
                <i class="pi pi-download mx-auto"></i> <!-- PrimeIcon -->
              </button>
              <span v-else-if="record.error" class="text-red-500 text-xs italic">Lỗi</span>
              <span v-else class="text-gray-500 text-xs italic">Chưa tạo</span>
            </td>
            <td class="p-3 text-xs text-red-400 max-w-xs truncate" :title="record.error">{{ record.error || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="!isLoading && records.length === 0" class="text-center text-gray-400 py-6">
      Chọn file Excel để bắt đầu import dữ liệu. File cần có cột chứa Mã BIN/Tên ngân hàng, Số tài khoản và Tên gợi
      nhớ/Chủ TK.
    </div>

    <!-- Display generated QR codes from Excel -->
    <div v-if="records.some(r => r.qrDataUrl)" class="mt-8">
      <h3 class="text-lg font-semibold mb-4 text-green-400">Mã QR Đã Tạo (từ Excel)</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <template v-for="record in records" :key="'qr-'+record.id">
          <QrDisplay v-if="record.qrDataUrl" :qr-data-url="record.qrDataUrl" :account-number="record.accountNumber"
            :nickname="record.nickname" :amount="record.amount" :purpose="record.purpose" :record-id="record.id"
            :download-handler="() => qrStore.downloadExcelQr(record.id)" />
        </template>
      </div>
    </div>

  </div>
</template>
