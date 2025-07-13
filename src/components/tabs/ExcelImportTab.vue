<template>
  <div class="excel-import-tab upload-section">
    <!-- Header -->
    <div class="tab-header">
      <div class="tab-title-section">
        <div class="tab-icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2v6h6" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 13H8" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 17H8" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9H8" />
          </svg>
        </div>
        <h2 class="tab-title view-title">Excel File Import</h2>
      </div>
    </div>

    <!-- Content -->
    <div class="tab-content">
      <!-- Error Message -->
      <div v-if="error && !isLoading" class="error-message">
        {{ error }}
      </div>

      <!-- Upload Area (if no records and not loading) -->
      <div v-if="!records.length && !isLoading" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent
        @dragenter="handleDragEnter" @dragleave="handleDragLeave" class="upload-dropzone"
        :class="{ 'dragover': isDragOver }">
        <div class="upload-content">
          <div class="upload-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <!-- Cloud container -->
              <path
                d="M21 17V21C21 21.5304 20.7893 22.0391 20.4142 22.4142C20.0391 22.7893 19.5304 23 19 23H5C4.46957 23 3.96086 22.7893 3.58579 22.4142C3.21071 22.0391 3 21.5304 3 21V17"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <!-- Upload arrow -->
              <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <!-- Vertical line -->
              <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
          <div class="upload-text">
            <h3 class="upload-main-text view-title">Click to browse or drag and drop your Excel file here</h3>
            <p class="upload-sub-text view-muted-text">Supports .xlsx and .xls files</p>
          </div>
        </div>
      </div>

      <!-- Generate Button (disabled state) -->
      <div v-if="!records.length && !isLoading" class="generate-button-section">
        <button class="generate-button purple-button disabled" disabled>
          <div class="generate-icon">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.59961 3.09998H4.59961C4.04732 3.09998 3.59961 3.54769 3.59961 4.09998V7.09998C3.59961 7.65226 4.04732 8.09998 4.59961 8.09998H7.59961C8.15189 8.09998 8.59961 7.65226 8.59961 7.09998V4.09998C8.59961 3.54769 8.15189 3.09998 7.59961 3.09998Z"
                stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path
                d="M20.5996 3.09998H17.5996C17.0473 3.09998 16.5996 3.54769 16.5996 4.09998V7.09998C16.5996 7.65226 17.0473 8.09998 17.5996 8.09998H20.5996C21.1519 8.09998 21.5996 7.65226 21.5996 7.09998V4.09998C21.5996 3.54769 21.1519 3.09998 20.5996 3.09998Z"
                stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path
                d="M7.59961 16.1H4.59961C4.04732 16.1 3.59961 16.5477 3.59961 17.1V20.1C3.59961 20.6523 4.04732 21.1 4.59961 21.1H7.59961C8.15189 21.1 8.59961 20.6523 8.59961 20.1V17.1C8.59961 16.5477 8.15189 16.1 7.59961 16.1Z"
                stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path
                d="M21.5996 16.1H18.5996C18.0692 16.1 17.5605 16.3107 17.1854 16.6858C16.8103 17.0608 16.5996 17.5695 16.5996 18.1V21.1"
                stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M21.5996 21.1V21.11" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path
                d="M12.5996 7.09998V10.1C12.5996 10.6304 12.3889 11.1391 12.0138 11.5142C11.6387 11.8893 11.13 12.1 10.5996 12.1H7.59961"
                stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3.59961 12.1H3.60961" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M12.5996 3.09998H12.6096" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M12.5996 16.1V16.11" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M16.5996 12.1H17.5996" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M21.5996 12.1V12.11" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M12.5996 21.1V20.1" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
          Generate QR Codes ( 0 )
        </button>
      </div>

      <!-- File Selected State -->
      <div v-if="records.length > 0 || isLoading" class="file-selected-section">
        <!-- File Info (if file was selected) -->
        <div v-if="selectedFile" class="file-info">
          <div class="file-info-content">
            <div class="file-info-left">
              <div class="file-check-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21.8011 9.99999C22.2578 12.2413 21.9323 14.5714 20.879 16.6018C19.8256 18.6322 18.108 20.24 16.0126 21.1573C13.9172 22.0746 11.5707 22.2458 9.3644 21.6424C7.15807 21.0389 5.22529 19.6974 3.88838 17.8414C2.55146 15.9854 1.89122 13.7272 2.01776 11.4434C2.14431 9.15952 3.04998 6.98808 4.58375 5.29116C6.11752 3.59424 8.18668 2.47442 10.4462 2.11844C12.7056 1.76247 15.0189 2.19185 17.0001 3.33499"
                    stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M9 11L12 14L22 4" stroke="#16A34A" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <div class="file-details">
                <p class="file-name view-title">{{ selectedFile.name }}</p>
                <p class="file-size view-muted-text">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
            <div class="file-info-right">
              <button @click="clearFile" class="remove-file-button">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Data Table Section -->
        <div class="data-section">
          <div class="data-header">
            <h3 class="data-title view-title">Imported Data</h3>
            <div class="data-actions">
              <div class="selection-info">
                <span class="selection-badge">{{ selectedCount }} of {{ records.length }} selected</span>
              </div>
              <button @click="toggleSelectAll" class="select-all-button">{{ selectAllButtonText }}</button>
            </div>
          </div>

          <!-- PrimeVue DataTable -->
          <div class="data-table-container">
            <DataTable :value="tableData" dataKey="id" v-model:selection="selectedRecords"
              :loading="isLoading && records.length === 0" scrollable scrollHeight="400px" responsiveLayout="scroll"
              class="excel-import-table">
              <Column selectionMode="multiple" headerStyle="width: 3rem" :exportable="false">
                <template #body v-if="isLoading && records.length === 0">
                  <Skeleton shape="circle" size="1.5rem"></Skeleton>
                </template>
              </Column>

              <Column field="bankBin" header="Bank" :sortable="!isLoading">
                <template #body="slotProps">
                  <Skeleton v-if="isLoading && records.length === 0" height="1.5rem"></Skeleton>
                  <span v-else>{{ renderBankName(slotProps.data) }}</span>
                </template>
              </Column>

              <Column field="accountNumber" header="STK" :sortable="!isLoading">
                <template #body="slotProps">
                  <Skeleton v-if="isLoading && records.length === 0" height="1.5rem"></Skeleton>
                  <span v-else class="account-number">{{ slotProps.data.accountNumber }}</span>
                </template>
              </Column>

              <Column field="nickname" header="Tên TK" :sortable="!isLoading">
                <template #body="slotProps">
                  <Skeleton v-if="isLoading && records.length === 0" height="1.5rem"></Skeleton>
                  <span v-else>{{ renderNickname(slotProps.data) }}</span>
                </template>
              </Column>

              <Column field="amount" header="Số tiền" :sortable="!isLoading">
                <template #body="slotProps">
                  <Skeleton v-if="isLoading && records.length === 0" height="1.5rem"></Skeleton>
                  <span v-else>{{ renderAmount(slotProps.data) }}</span>
                </template>
              </Column>

              <Column field="purpose" header="Nội dung"
                style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; position: relative;"
                bodyClass="purpose-cell-actions-container">
                <template #body="slotProps">
                  <Skeleton v-if="isLoading && records.length === 0" height="1.5rem"></Skeleton>
                  <span v-else>{{ renderPurpose(slotProps.data) }}</span>
                </template>
              </Column>

              <Column header="Actions" :exportable="false" style="width: 80px; text-align: center;">
                <template #body="slotProps">
                  <Skeleton v-if="isLoading && records.length === 0" height="1.5rem"></Skeleton>
                  <ExcelRowActions v-else-if="slotProps.data.id !== -1" :data="slotProps.data" />
                </template>
              </Column>

              <template #empty>
                <div class="empty-state">
                  Chọn file Excel để bắt đầu import dữ liệu.
                </div>
              </template>
            </DataTable>
          </div>

          <!-- Generate Button -->
          <div class="generate-button-section">
            <button @click="generateQRCodes" :disabled="!canGenerateMultiple"
              :class="['generate-button', 'purple-button', { 'disabled': !canGenerateMultiple }]">
              <div class="generate-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <!-- QR Code squares -->
                  <rect x="3" y="3" width="5" height="5" stroke="currentColor" stroke-width="2" fill="none" />
                  <rect x="16" y="3" width="5" height="5" stroke="currentColor" stroke-width="2" fill="none" />
                  <rect x="3" y="16" width="5" height="5" stroke="currentColor" stroke-width="2" fill="none" />
                  <rect x="16" y="16" width="5" height="5" stroke="currentColor" stroke-width="2" fill="none" />
                  <!-- Center square -->
                  <rect x="9" y="9" width="3" height="3" stroke="currentColor" stroke-width="2" fill="none" />
                  <!-- Small dots -->
                  <circle cx="12" cy="3" r="1" fill="currentColor" />
                  <circle cx="3" cy="12" r="1" fill="currentColor" />
                  <circle cx="21" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="21" r="1" fill="currentColor" />
                </svg>
              </div>
              Generate QR Codes ( {{ selectedCount }} )
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept=".xlsx,.xls" @change="handleFileSelect" style="display: none">
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQrStore } from '@/stores/qr'
import { useBanksStore } from '@/stores/banks'
import ExcelRowActions from '../ExcelRowActions.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Skeleton from 'primevue/skeleton'

interface ImportedRow {
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

const qrStore = useQrStore()
const banksStore = useBanksStore()
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)

// Use uploaded file from QR store instead of local state
const selectedFile = computed(() => qrStore.uploadedExcelFile)

// Sử dụng records từ QR store thay vì local importedData
const records = computed<ImportedRow[]>(() => qrStore.excelRecords as ImportedRow[])
const selectedRecords = ref<ImportedRow[]>([])

// Simple initialization - let PrimeVue handle selection
watch(records, (newRecords) => {
  // Auto-select all records when first loaded
  if (newRecords.length > 0 && selectedRecords.value.length === 0) {
    const validRecords = newRecords.filter(r => r.id !== -1);
    selectedRecords.value = validRecords;

    // Immediately sync to store
    qrStore.excelRecords.forEach(r => {
      r.selected = true;
    });
  }
}, { immediate: true });

// Simple sync back to store
watch(selectedRecords, (newSelection) => {
  const selectedIds = newSelection.map(item => item.id);
  qrStore.excelRecords.forEach(r => {
    r.selected = selectedIds.includes(r.id);
  });
}, { deep: true });

// Computed properties từ QR store
const isLoading = computed(() => qrStore.isProcessingExcel)
const error = computed(() => qrStore.excelError)

// Skeleton data
const skeletonRecords = ref(Array(5).fill({ id: -1 }))
const tableData = computed(() => {
  return isLoading.value && records.value.length === 0 ? skeletonRecords.value : records.value;
})

const selectedCount = computed(() =>
  selectedRecords.value.length
)

const isAllSelected = computed(() => {
  const validRecords = records.value.filter(r => r.id !== -1);
  return validRecords.length > 0 && selectedRecords.value.length === validRecords.length;
})

const canGenerateMultiple = computed(() => {
  return records.value.length > 0 && selectedRecords.value.length > 0 && !isLoading.value;
})

const selectAllButtonText = computed(() => {
  return isAllSelected.value ? 'Deselect All' : 'Select All'
})

// Helper functions
function getBankDisplayName(bin: string): string {
  const bankInfo = banksStore.getBankByBin(bin)
  return bankInfo?.bankShortName || bankInfo?.bankName || bin
}

function renderBankName(row: ImportedRow) {
  return getBankDisplayName(row.bankBin)
}

function renderNickname(row: ImportedRow) {
  return row.nickname || '-'
}

function renderAmount(row: ImportedRow) {
  return row.amount ? row.amount.toLocaleString('vi-VN') : '-'
}

function renderPurpose(row: ImportedRow) {
  return row.purpose || '-'
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Function to clear selected file
function clearFile() {
  qrStore.clearExcelImport()
}

// Function to toggle select/deselect all records
function toggleSelectAll() {
  if (isAllSelected.value) {
    // Deselect all
    selectedRecords.value = []
  } else {
    // Select all
    selectedRecords.value = [...records.value.filter(r => r.id !== -1)]
  }

  // Immediately sync to store
  const selectedIds = selectedRecords.value.map(item => item.id);
  qrStore.excelRecords.forEach(r => {
    r.selected = selectedIds.includes(r.id);
  });
}

/**
 * Tải xuống file Excel mẫu tĩnh.
 * Currently not used but kept for future functionality
 */
// function downloadSampleExcel() {
//   const link = document.createElement('a');
//   link.href = '/WhoPays_Import_QR.xlsx'; // File nằm trong public/
//   link.download = 'Mau_Import_QR.xlsx';
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // Use QR store to import Excel and store file
    qrStore.importFromExcel(file)
  }
  if (target) target.value = ''
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    // Use QR store to import Excel and store file
    qrStore.importFromExcel(files[0])
  }
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
}

function generateQRCodes() {
  // Debug: Check selection state
  console.log('Selected records in component:', selectedRecords.value.length);
  console.log('Records in store with selected=true:', qrStore.excelRecords.filter(r => r.selected).length);

  // Force sync one more time before generating
  const selectedIds = selectedRecords.value.map(item => item.id);
  qrStore.excelRecords.forEach(r => {
    r.selected = selectedIds.includes(r.id);
  });

  // Sử dụng QR store để generate QR codes
  qrStore.generateMultipleQrCodes()
  // Không còn chuyển tab nữa, popup QR sẽ hiển thị trực tiếp
}
</script>

<style scoped>
/* Component-specific variables that work with global theme */
:root {
  --accent-color: #6b26d9;
  --accent-hover: #5a1fb8;
  --success-color: #10b981;
  --success-hover: #059669;
  --error-color: #ef4444;
  --skeleton-bg: #404040;
}

/* Override for light theme specific colors */
@media (prefers-color-scheme: light) {
  :root {
    --error-color: #dc2626;
    --skeleton-bg: #f3f4f6;
  }
}

/* Dark theme override when my-app-dark class is present */
:global(.my-app-dark) .excel-import-tab {
  --skeleton-bg: #404040;
}

.excel-import-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--app-bg-primary);
  color: var(--app-text-primary);
  padding: 24px;
}

/* Tab Header */
.tab-header {
  margin-bottom: 32px;
}

.tab-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tab-icon {
  width: 24px;
  height: 24px;
  color: var(--app-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--app-text-primary);
  margin: 0;
  letter-spacing: -0.025em;
}

/* Tab Content */
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Error Message */
.error-message {
  margin-bottom: 24px;
  padding: 16px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error-color);
  color: var(--error-color);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* Upload Section */
.upload-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
  padding: 24px;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  background-color: var(--app-bg-primary);
}

.upload-section .generate-button-section {
  bottom: 24px;
  right: 24px;
  margin-top: 16px;
}

.upload-dropzone {
  flex: 1;
  border: 2px dashed var(--app-border);
  border-radius: 16px;
  background-color: var(--app-bg-secondary);
  padding: 64px 32px 80px 32px;
  /* Extra bottom padding for button space */
  text-align: center;
  transition: all 0.2s ease;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-dropzone:hover {
  border-color: #6b26d9;
  background-color: rgba(107, 38, 217, 0.02);
}

.upload-dropzone.dragover {
  border-color: #6b26d9;
  background-color: rgba(107, 38, 217, 0.05);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 400px;
}

.upload-icon {
  width: 64px;
  height: 64px;
  padding: 16px;
  background-color: rgba(107, 38, 217, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon svg {
  width: 32px;
  height: 32px;
  color: #6b26d9;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.upload-main-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--app-text-primary);
  margin: 0;
  line-height: 1.4;
}

.upload-sub-text {
  font-size: 14px;
  color: var(--app-text-muted);
  margin: 0;
}

/* Generate Button Section */
.generate-button-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

/* File Selected Section */
.file-selected-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* File Info */
.file-info {
  padding: 16px;
  background-color: var(--app-bg-secondary);
  border: 1px solid var(--app-border);
  border-radius: 12px;
}

.file-info-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-info-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-check-icon {
  width: 40px;
  height: 40px;
  background-color: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-check-icon svg {
  width: 24px;
  height: 24px;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.file-size {
  font-size: 12px;
  margin: 0;
}

.remove-file-button {
  width: 32px;
  height: 32px;
  background-color: transparent;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  color: var(--app-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-file-button:hover {
  background-color: var(--error-color);
  border-color: var(--error-color);
  color: white;
}

.remove-file-button svg {
  width: 16px;
  height: 16px;
}

/* Data Section */
.data-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.data-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.data-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.data-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selection-info {
  display: flex;
  align-items: center;
}

.selection-badge {
  padding: 2px 10px 4px 11px;
  background-color: var(--app-bg-secondary);
  color: var(--app-text-primary);
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  border: none;
}

.select-all-button {
  padding: 7px 13px 9px 12px;
  background-color: var(--app-bg-primary);
  color: var(--app-text-primary);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-all-button:hover {
  background-color: var(--app-bg-secondary);
  color: var(--app-text-primary);
}

/* Data Table */
.data-table-container {
  flex: 1;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--app-bg-primary);
  min-height: 300px;
}

.empty-state {
  text-align: center;
  padding: 64px 32px;
  color: var(--app-text-muted);
  font-size: 14px;
}

/* PrimeVue DataTable Overrides */
.excel-import-table :deep(.p-datatable) {
  background-color: var(--app-bg-primary);
  border: none;
}

.excel-import-table :deep(.p-datatable-header) {
  background-color: var(--app-bg-secondary);
  border-bottom: 1px solid var(--app-border);
  padding: 16px;
}

.excel-import-table :deep(.p-datatable-thead > tr > th) {
  background-color: var(--app-bg-secondary);
  color: var(--app-text-primary);
  border-bottom: 1px solid var(--app-border);
  padding: 12px 16px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: normal;
  text-transform: none;
}

.excel-import-table :deep(.p-datatable-tbody > tr) {
  background-color: var(--app-bg-primary);
  border-bottom: 1px solid var(--app-border);
  position: relative;
  transition: background-color 0.2s ease;
}

.excel-import-table :deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--app-bg-secondary);
}

.excel-import-table :deep(.p-datatable-tbody > tr > td) {
  padding: 16px;
  color: var(--app-text-primary);
  border: none;
  font-size: 14px;
}

.excel-import-table :deep(.p-checkbox) {
  width: 18px;
  height: 18px;
}

.excel-import-table :deep(.p-checkbox .p-checkbox-box) {
  border-color: #666666 !important;
  border-radius: 2px !important;
  border-width: 1px !important;
}

.excel-import-table :deep(.p-checkbox.p-highlight .p-checkbox-box) {
  background-color: var(--accent-color) !important;
  border-color: var(--accent-color) !important;
}

.excel-import-table :deep(.p-checkbox .p-checkbox-icon) {
  width: 12px !important;
  height: 12px !important;
  color: white !important;
}

.account-number {
  font-family: 'Consolas', monospace;
  font-weight: 400;
}

/* Skeleton Loading */
.excel-import-table :deep(.p-skeleton) {
  background-color: var(--skeleton-bg);
}

/* Row Actions */
.excel-import-table :deep(.purpose-cell-actions-container.p-cell-editing),
.excel-import-table :deep(.purpose-cell-actions-container) {
  overflow: visible !important;
}

.account-number {
  font-family: 'Consolas', monospace;
  font-weight: 400;
}

/* Responsive Design */
@media (max-width: 768px) {
  .excel-import-tab {
    padding: 16px;
  }

  .upload-section {
    padding: 16px;
  }

  .upload-section .generate-button-section {
    bottom: 16px;
    right: 16px;
  }

  .upload-dropzone {
    padding: 32px 16px 60px 16px;
    min-height: 240px;
  }

  .upload-content {
    gap: 16px;
  }

  .upload-main-text {
    font-size: 16px;
  }

  .data-header {
    flex-direction: column;
    align-items: stretch;
  }

  .data-actions {
    justify-content: space-between;
  }

}
</style>
