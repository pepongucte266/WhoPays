<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useQrStore } from '@/stores/qr'
import { useBanksStore } from '@/stores/banks'
import { useAccountStore } from '@/stores/account'
import * as XLSX from 'xlsx'
// import QrDisplay from './QrDisplay.vue' // Không còn dùng

const qrStore = useQrStore()
const banksStore = useBanksStore()
const accountStore = useAccountStore()
const fileInput = ref<HTMLInputElement | null>(null)

interface ExcelRecord {
  id: number
  selected?: boolean
  qrDataUrl?: string
  error?: string
  bankBin: string
  accountNumber: string
  nickname?: string
  amount?: number
  purpose?: string
  // Thuộc tính mở rộng cho thao tác lưu
  _saveStatus?: 'success' | 'error'
  _saveError?: string
}

const records = computed<ExcelRecord[]>(() => qrStore.excelRecords as ExcelRecord[])

// Xử lý selection cho PrimeDataTable
const selectedRecords = ref<ExcelRecord[]>([])
function onSelectionChange(e: { value: ExcelRecord[] }) {
  const selected = e.value.map(item => item.id)
  records.value.forEach(r => { r.selected = selected.includes(r.id) })
  selectedRecords.value = e.value
}

// Các hàm render cell cho PrimeColumn
function renderBankName(row: ExcelRecord) {
  return getBankDisplayName(row.bankBin)
}
function renderNickname(row: ExcelRecord) {
  return row.nickname || '-'
}
function renderAmount(row: ExcelRecord) {
  return row.amount ? row.amount.toLocaleString('vi-VN') : '-'
}
function renderPurpose(row: ExcelRecord) {
  return row.purpose || '-'
}
function renderQrCode(row: ExcelRecord) {
  if (row.qrDataUrl) {
    return h('button', {
      class: 'text-blue-400 hover:text-blue-300',
      title: 'Tải xuống QR',
      onClick: () => qrStore.downloadExcelQr(row.id)
    }, [h('i', { class: 'pi pi-download mx-auto' })])
  }
  if (row.error) {
    return h('span', { class: 'text-red-500 text-xs italic' }, 'Lỗi')
  }
  return h('span', { class: 'text-gray-500 text-xs italic' }, 'Chưa tạo')
}
function renderError(row: ExcelRecord) {
  return row.error || '-'
}
const isLoading = computed(() => qrStore.isProcessingExcel)
const error = computed(() => qrStore.excelError)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    qrStore.importFromExcel(file)
  }
  if (target) target.value = ''
}

function generateSelectedQrCodes() {
  qrStore.generateMultipleQrCodes()
}

const canGenerateMultiple = computed(() => {
  return records.value.length > 0 && records.value.some(r => r.selected) && !isLoading.value;
});

/**
 * Tạo và tải xuống file Excel mẫu.
 */
function downloadSampleExcel() {
  const sampleData = [
    ['Mã Ngân hàng (BIN)/Tên NH', 'Số tài khoản', 'Tên gợi nhớ/Chủ TK', 'Số tiền', 'Nội dung'],
    ['970436', '0123456789', 'NGUYEN VAN A', '50000', 'Thanh toán hóa đơn ABC'],
    ['Vietinbank', '9876543210', 'TRAN THI B', '', 'Chuyển tiền học phí'],
    ['970422', '1122334455', 'LE VAN C', '1000000', ''],
  ];

  try {
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DuLieuMau');
    XLSX.writeFile(wb, 'Mau_Import_QR.xlsx');
  } catch (error) {
    console.error("Error generating sample Excel file:", error);
    alert("Đã xảy ra lỗi khi tạo file mẫu. Vui lòng thử lại.");
  }
}

function getBankDisplayName(bin: string): string {
  const bankInfo = banksStore.getBankByBin(bin)
  return bankInfo?.bankShortName || bankInfo?.bankName || bin
}

/**
 * Lưu tài khoản vào Supabase từ record Excel.
 */
async function saveAccountFromExcel(record: ExcelRecord) {
  // Chuẩn hóa dữ liệu đầu vào cho addAccount
  const input = {
    bank_bin: record.bankBin,
    account_number: record.accountNumber,
    nickname: record.nickname,
  }
  const success = await accountStore.addAccount(input)
  if (success) {
    record._saveStatus = 'success'
    setTimeout(() => { record._saveStatus = undefined }, 2000)
  } else {
    record._saveStatus = 'error'
    record._saveError = accountStore.error ?? undefined
    setTimeout(() => { record._saveStatus = undefined; record._saveError = undefined }, 4000)
  }
}
</script>

<template>
  <div class="excel-import bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
    <div class="flex justify-between items-center mb-4 gap-4">
      <h2 class="text-lg font-semibold text-green-400">Import từ Excel</h2>
      <div class="flex gap-2">
        <button @click="downloadSampleExcel" title="Tải file Excel mẫu"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition duration-200 ease-in-out flex items-center text-sm">
          <i class="pi pi-download mr-2"></i>
          Tải File Mẫu
        </button>
        <input type="file" ref="fileInput" @change="handleFileChange" accept=".xlsx, .xls" class="hidden" />
        <button @click="triggerFileInput" :disabled="isLoading" title="Chọn file Excel"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm">
          <i class="pi pi-upload mr-2"></i>
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
    <div v-if="records.length > 0 && !isLoading" class="mt-4">
      <div class="flex justify-end mb-2">
        <PrimeButton @click="generateSelectedQrCodes" :disabled="!canGenerateMultiple"
          title="Tạo mã QR cho các mục đã chọn" class="p-button-success p-button-sm">
          <i class="pi pi-qrcode mr-1"></i>
          Tạo QR Đã Chọn
        </PrimeButton>
      </div>
      <PrimeDataTable :value="records" dataKey="id" :selection="selectedRecords" @selection-change="onSelectionChange"
        scrollable scrollHeight="400px" stripedRows responsiveLayout="scroll"
        class="p-datatable-sm bg-gray-800 text-gray-200">
        <PrimeColumn selectionMode="multiple" headerStyle="width: 3rem" :exportable="false" />
        <PrimeColumn field="bankBin" header="Ngân hàng" :sortable="true" :body="renderBankName" />
        <PrimeColumn field="accountNumber" header="Số tài khoản" :sortable="true" />
        <PrimeColumn field="nickname" header="Tên gợi nhớ/Chủ TK" :sortable="true" :body="renderNickname" />
        <PrimeColumn field="amount" header="Số tiền" :sortable="true" :body="renderAmount" style="text-align: right;" />
        <PrimeColumn field="purpose" header="Nội dung" :body="renderPurpose"
          style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;" />
        <PrimeColumn header="QR Code" :body="renderQrCode" style="text-align: center;" />
        <PrimeColumn field="error" header="Lỗi" :body="renderError" style="max-width: 200px; color: #f87171;" />
        <PrimeColumn header="Thao tác" style="text-align: center;">
          <template #body="slotProps">
            <button v-if="slotProps.data._saveStatus === undefined"
              class="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition disabled:opacity-50"
              :disabled="accountStore.loading" title="Lưu tài khoản vào Supabase"
              @click="() => saveAccountFromExcel(slotProps.data)">
              <i class="pi pi-save mr-1"></i>Lưu
            </button>
            <span v-else-if="slotProps.data._saveStatus === 'success'" class="text-green-400 text-xs font-semibold">
              Đã lưu
            </span>
            <span v-else-if="slotProps.data._saveStatus === 'error'" class="text-red-400 text-xs font-semibold"
              :title="slotProps.data._saveError">
              Lỗi
            </span>
          </template>
        </PrimeColumn>
      </PrimeDataTable>
    </div>
    <div v-else-if="!isLoading && records.length === 0" class="text-center text-gray-400 py-6">
      Chọn file Excel để bắt đầu import dữ liệu. File cần có cột chứa Mã BIN/Tên ngân hàng, Số tài khoản và Tên gợi
      nhớ/Chủ TK.
    </div>

    <!-- Display generated QR codes from Excel (đã bỏ, dùng popup chung) -->
    <!--
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
    -->
  </div>
</template>
