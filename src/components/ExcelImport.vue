<script setup lang="ts">
import { ref, computed, watch } from 'vue' // Xóa 'h' không còn dùng
import ExcelRowActions from './ExcelRowActions.vue'
// PrimeSkeleton đã được đăng ký global trong main.ts
import { useQrStore } from '@/stores/qr'
import { useBanksStore } from '@/stores/banks'
import * as XLSX from 'xlsx'
// import QrDisplay from './QrDisplay.vue' // Không còn dùng

const qrStore = useQrStore()
const banksStore = useBanksStore()
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

// Sử dụng watch để cập nhật thuộc tính 'selected' trên từng record khi selectedRecords thay đổi
// Điều này hữu ích nếu bạn cần thuộc tính 'selected' cho các logic khác ngoài PrimeDataTable
watch(selectedRecords, (newSelection) => {
  const selectedIds = newSelection.map(item => item.id);
  records.value.forEach(r => {
    r.selected = selectedIds.includes(r.id);
  });
  // console.log('Selected records (watched):', newSelection);
}, { deep: true });

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


const isLoading = computed(() => qrStore.isProcessingExcel)
const error = computed(() => qrStore.excelError)

// Dữ liệu giả cho skeleton
const skeletonRecords = ref(Array(5).fill({ id: -1 })); // id: -1 để phân biệt với id thật nếu cần

const tableData = computed(() => {
  return isLoading.value && records.value.length === 0 ? skeletonRecords.value : records.value;
});


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

</script>

<template>
  <div class="excel-import bg-gray-800 p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4 gap-4">
      <h2 class="text-lg font-semibold text-green-400">Import từ Excel</h2>
      <div class="flex gap-2">
        <PrimeButton size="small" @click="downloadSampleExcel" title="Tải file Excel mẫu"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition duration-200 ease-in-out flex items-center text-sm">
          <i class="pi pi-download mr-2"></i>
          Tải File Mẫu
        </PrimeButton>
        <input type="file" ref="fileInput" @change="handleFileChange" accept=".xlsx, .xls" class="hidden" />
        <PrimeButton size="small" @click="triggerFileInput" :disabled="isLoading" title="Chọn file Excel"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm">
          <i class="pi pi-upload mr-2"></i>
          Chọn File (.xlsx, .xls)
        </PrimeButton>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error && !isLoading" class="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 text-sm rounded-md">
      {{ error }}
    </div>

    <!-- Data Table -->
    <div class="flex justify-end mb-2 mt-4">
      <PrimeButton @click="generateSelectedQrCodes" :disabled="!canGenerateMultiple || isLoading"
        title="Tạo mã QR cho các mục đã chọn" class="p-button-success p-button-sm">
        <i class="pi pi-qrcode mr-1"></i>
        Tạo QR Đã Chọn
      </PrimeButton>
    </div>
    <PrimeDataTable :value="tableData" dataKey="id" v-model:selection="selectedRecords"
      :loading="isLoading && records.length === 0" scrollable scrollHeight="470px" responsiveLayout="scroll"
      class="bg-gray-800 text-gray-200 excel-import-table">
      <PrimeColumn selectionMode="multiple" headerStyle="width: 3rem" :exportable="false">
        <template #body v-if="isLoading && records.length === 0">
          <PrimeSkeleton shape="circle" size="1.5rem"></PrimeSkeleton>
        </template>
        <!-- Khi không loading skeleton, không cung cấp template #body, PrimeVue sẽ tự render checkbox -->
      </PrimeColumn>
      <PrimeColumn field="bankBin" header="Bank" :sortable="!isLoading">
        <template #body="slotProps">
          <PrimeSkeleton v-if="isLoading && records.length === 0" height="1.5rem"></PrimeSkeleton>
          <span v-else>{{ renderBankName(slotProps.data) }}</span>
        </template>
      </PrimeColumn>
      <PrimeColumn field="accountNumber" header="STK" :sortable="!isLoading">
        <template #body="slotProps">
          <PrimeSkeleton v-if="isLoading && records.length === 0" height="1.5rem"></PrimeSkeleton>
          <span v-else>{{ slotProps.data.accountNumber }}</span>
        </template>
      </PrimeColumn>
      <PrimeColumn field="nickname" header="Tên TK" :sortable="!isLoading">
        <template #body="slotProps">
          <PrimeSkeleton v-if="isLoading && records.length === 0" height="1.5rem"></PrimeSkeleton>
          <span v-else>{{ renderNickname(slotProps.data) }}</span>
        </template>
      </PrimeColumn>
      <PrimeColumn field="amount" header="Số tiền" :sortable="!isLoading" style="text-align: right;">
        <template #body="slotProps">
          <PrimeSkeleton v-if="isLoading && records.length === 0" height="1.5rem"></PrimeSkeleton>
          <span v-else>{{ renderAmount(slotProps.data) }}</span>
        </template>
      </PrimeColumn>
      <PrimeColumn field="purpose" header="Nội dung"
        style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; position: relative;"
        bodyClass="purpose-cell-actions-container">
        <template #body="slotProps">
          <PrimeSkeleton v-if="isLoading && records.length === 0" height="1.5rem"></PrimeSkeleton>
          <span v-else>{{ renderPurpose(slotProps.data) }}</span>
          <!-- Actions sẽ được chèn vào đây khi không loading và không phải skeleton record -->
          <div v-if="!(isLoading && records.length === 0) && slotProps.data.id !== -1" class="dynamic-row-actions">
            <ExcelRowActions :data="slotProps.data" />
          </div>
        </template>
      </PrimeColumn>
      <template #empty>
        <div class="text-center text-gray-400 py-6">
          Chọn file Excel để bắt đầu import dữ liệu. File cần có cột chứa Mã BIN/Tên ngân hàng, Số tài khoản và Tên gợi
          nhớ/Chủ TK.
        </div>
      </template>
    </PrimeDataTable>
  </div>
</template>

<style scoped>
.excel-import-table :deep(.p-datatable-tbody > tr) {
  position: relative;
  /* Cho phép định vị tuyệt đối .dynamic-row-actions */
}

/* Quan trọng: đảm bảo cell chứa actions không cắt mất nội dung khi hover */
.excel-import-table :deep(.purpose-cell-actions-container.p-cell-editing),
.excel-import-table :deep(.purpose-cell-actions-container) {
  overflow: visible !important;
}


.dynamic-row-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  /* Phân bố các nút đều nhau */
  gap: 0.2rem;

  position: absolute;
  right: 0.3rem;
  top: 50%;
  opacity: 0;
  transform: translateY(-50%) translateX(15px);
  pointer-events: none;
  transition: opacity 0.15s ease-out, transform 0.15s ease-out, width 0.15s ease-out;
  /* Thêm width vào transition */

  background-color: var(--surface-overlay);
  /* Thử với --surface-overlay */
  /* Màu nền đậm hơn */
  padding: 0.3rem 0.5rem;
  /* Padding dọc và ngang */
  border-radius: var(--border-radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 10;

  min-width: 20rem;
  /* Chiều rộng tối thiểu để dài ra */
}

.excel-import-table :deep(.p-datatable-tbody > tr:hover) .dynamic-row-actions {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
  /* Trượt vào vị trí */
  pointer-events: auto;
}

/* Đảm bảo các nút có kích thước phù hợp và nhất quán */
.dynamic-row-actions .p-button.p-button-sm {
  width: 1.75rem;
  /* Kích thước nhỏ hơn cho nút icon */
  height: 1.75rem;
}

.dynamic-row-actions .p-button.p-button-sm .p-button-icon {
  font-size: 0.875rem;
  /* Kích thước icon nhỏ hơn */
}

/* Style cho text trạng thái (Đã lưu, Lỗi) để nó không quá lớn */
.action-status-text {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  /* Padding nhỏ */
  font-size: 0.75rem;
  /* Cỡ chữ nhỏ */
  white-space: nowrap;
  /* Ngăn không cho xuống dòng */
}
</style>
