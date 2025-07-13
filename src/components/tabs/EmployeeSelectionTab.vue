<template>
  <div class="employee-selection-tab">
    <!-- Content -->
    <div class="tab-content">
      <!-- Department Filter -->
      <div class="department-filter">
        <select v-model="selectedDepartment" class="department-select">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
        </select>
      </div>

      <!-- Selection Info and Actions -->
      <div class="selection-section">
        <div class="selection-content">
          <div class="selection-info">
            <h3 class="selection-count">{{ selectedEmployees.length }} of {{ filteredEmployees.length }} employees
              selected</h3>
            <p class="selection-description">Select employees to generate QR codes</p>
          </div>

          <div class="selection-actions">
            <button @click="clearAll" :disabled="selectedEmployees.length === 0" class="btn btn-outline">
              Clear All
            </button>
            <button @click="selectAll" class="btn btn-outline">
              Select All
            </button>
            <button @click="generateQRCodes" :disabled="selectedEmployees.length === 0"
              class="generate-button purple-button" :class="{ 'disabled': selectedEmployees.length === 0 }">
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
              Generate QR Codes ({{ selectedEmployees.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Employee Table -->
      <div class="employee-table-container">
        <PrimeDataTable :value="filteredEmployees" dataKey="id" v-model:selection="selectedEmployees" scrollable
          scrollHeight="400px" responsiveLayout="scroll" class="employee-selection-table">

          <PrimeColumn selectionMode="multiple" headerStyle="width: 3rem" :exportable="false"></PrimeColumn>

          <PrimeColumn header="Employee" :sortable="true">
            <template #body="slotProps">
              <div class="employee-info">
                <div class="employee-avatar">
                  <span class="avatar-text">{{ getInitials(slotProps.data.nickname || slotProps.data.account_number)
                    }}</span>
                </div>
                <div class="employee-details">
                  <div class="employee-name">{{ slotProps.data.nickname || 'Account: ' + slotProps.data.account_number
                    }}</div>
                  <div class="employee-role">{{ getEmployeeRole(slotProps.data) }}</div>
                </div>
              </div>
            </template>
          </PrimeColumn>

          <PrimeColumn header="Department" :sortable="true">
            <template #body="slotProps">
              <span class="department-badge">{{ getEmployeeDepartment(slotProps.data) }}</span>
            </template>
          </PrimeColumn>

          <PrimeColumn header="Contact" :sortable="true">
            <template #body="slotProps">
              <div class="contact-info">
                <div class="contact-account">{{ slotProps.data.account_number }}</div>
                <div class="contact-bank">{{ getBankDisplayName(slotProps.data.bank_bin) }}</div>
              </div>
            </template>
          </PrimeColumn>

          <PrimeColumn header="Actions" style="width: 80px;">
            <template #body="slotProps">
              <button @click.stop="generateSingleQR(slotProps.data)" class="action-btn generate-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="5" height="5" />
                  <rect x="16" y="3" width="5" height="5" />
                  <rect x="3" y="16" width="5" height="5" />
                  <rect x="16" y="16" width="5" height="5" />
                  <rect x="11" y="11" width="2" height="2" />
                </svg>
              </button>
            </template>
          </PrimeColumn>

          <template #empty>
            <div class="empty-state">
              <div class="empty-state-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0z" />
                </svg>
              </div>
              <h3 class="empty-state-title">No employees found</h3>
              <p class="empty-state-description">Add employee accounts to get started with QR code generation</p>
            </div>
          </template>
        </PrimeDataTable>
      </div>

      <!-- Footer Actions -->
      <div class="footer-actions">
        <button @click="$emit('back')" class="btn btn-secondary">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Import
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAccountStore } from '@/stores/account'
import { useBanksStore } from '@/stores/banks'
import { useQrStore } from '@/stores/qr'

interface Employee {
  id: number
  nickname?: string
  account_number: string
  bank_bin: string
  bank_code: string
  user_id: string
  created_at: string
}

defineEmits<{
  back: []
  'switch-to-excel': []
}>()

const accountStore = useAccountStore()
const banksStore = useBanksStore()
const qrStore = useQrStore()

// Reactive data
const selectedDepartment = ref('')
const selectedEmployees = ref<Employee[]>([]) // Thay đổi từ number[] sang Employee[]

// Watch để sync với logic cũ nếu cần
watch(selectedEmployees, () => {
  // Logic sync if needed in the future
}, { deep: true })

// Mock departments - trong thực tế có thể lấy từ API hoặc config
const departments = ref(['Engineering', 'Design', 'Marketing', 'Analytics', 'Sales', 'HR'])

// Computed properties
const employees = computed<Employee[]>(() => {
  return accountStore.accounts.map(account => ({
    id: account.id,
    nickname: account.nickname,
    account_number: account.account_number,
    bank_bin: account.bank_bin,
    bank_code: account.bank_code,
    user_id: account.user_id,
    created_at: account.created_at
  }))
})

const filteredEmployees = computed(() => {
  if (!selectedDepartment.value) return employees.value
  return employees.value.filter(emp => getEmployeeDepartment(emp) === selectedDepartment.value)
})

// Methods
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getBankDisplayName = (bankBin: string): string => {
  const bankInfo = banksStore.getBankByBin(bankBin)
  return bankInfo?.bankShortName || bankInfo?.bankName || bankBin
}

const getEmployeeRole = (employee: Employee): string => {
  // Mock logic cho role - có thể dựa trên nickname hoặc department
  const roles = ['Product Designer', 'Senior Developer', 'Data Analyst', 'Marketing Manager', 'Sales Rep']
  return roles[employee.id % roles.length]
}

const getEmployeeDepartment = (employee: Employee): string => {
  // Mock logic cho department - có thể dựa trên bank_code hoặc nickname
  return departments.value[employee.id % departments.value.length]
}

const selectAll = () => {
  selectedEmployees.value = [...filteredEmployees.value]
}

const clearAll = () => {
  selectedEmployees.value = []
}

const generateQRCodes = async () => {
  if (selectedEmployees.value.length === 0) return

  // Convert selected employees to ExcelRecord format and generate QRs
  const records = selectedEmployees.value.map((employee, idx) => ({
    id: idx + 1,
    bankBin: employee.bank_bin,
    accountNumber: employee.account_number,
    nickname: employee.nickname || `Account ${employee.account_number}`,
    amount: undefined, // User can set amount later
    purpose: '',
    selected: true
  }))

  // Set records in store and generate QR codes
  qrStore.excelRecords = records
  await qrStore.generateMultipleQrCodes()

  // Clear selection after generating
  selectedEmployees.value = []

  console.log(`Generated QR codes for ${selectedEmployees.value.length} employees`)
}

const generateSingleQR = async (employee: Employee) => {
  try {
    // Set manual input data
    qrStore.manualInput.bankBin = employee.bank_bin
    qrStore.manualInput.accountNumber = employee.account_number
    qrStore.manualInput.nickname = employee.nickname || `Account ${employee.account_number}`
    qrStore.manualInput.amount = undefined
    qrStore.manualInput.purpose = ''

    // Generate single QR code
    await qrStore.generateSingleQrCode()

    console.log('Generated QR for employee:', employee.nickname || employee.account_number)
  } catch (error) {
    console.error('Error generating QR for employee:', employee.account_number, error)
  }
}

// Load employees data on component mount
onMounted(async () => {
  await accountStore.fetchAccounts()
})
</script>

<style scoped>
/* CSS Variables for Dark Theme (Default) */
:root {
  --bg-primary: #09090B;
  --bg-secondary: #09090B;
  --bg-tertiary: #09090B;
  --text-primary: #FFFFFF;
  --text-secondary: #FAFAFA;
  --text-muted: #A1A1AA;
  --border-color: #27272A;
  --accent-color: #6B26D9;
  --accent-hover: #5a1fb8;
  --success-color: #10b981;
  --success-hover: #059669;
  --hover-bg: #1a1a1a;
  --selected-bg: rgba(107, 38, 217, 0.1);
  --selected-border: rgba(107, 38, 217, 0.3);
  --shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
}

/* Light Theme */
@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #ffffff;
    --bg-tertiary: #f8f9fa;
    --text-primary: #1a1a1a;
    --text-secondary: #6c757d;
    --text-muted: #9ca3af;
    --border-color: #e5e7eb;
    --accent-color: #6b26d9;
    --accent-hover: #5a1fb8;
    --success-color: #10b981;
    --success-hover: #059669;
    --hover-bg: #f3f4f6;
    --selected-bg: rgba(107, 38, 217, 0.05);
    --selected-border: rgba(107, 38, 217, 0.2);
    --shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  }
}

.employee-selection-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Content */
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Department Filter */
.department-filter {
  display: flex;
  align-items: center;
}

.department-select {
  padding: 24.8px 24.4px 24.4px 24.8px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  line-height: 1.21;
  min-width: 200px;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
}

.department-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(107, 38, 217, 0.1);
}

/* Selection Section */
.selection-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 17.2px 16.4px 16.8px 16.8px;
  box-shadow: var(--shadow);
}

.selection-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.selection-info {
  flex-shrink: 0;
  height: 44px;
}

.selection-count {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  line-height: 1.5;
}

.selection-description {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.428571429;
}

.selection-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Employee Table */
.employee-table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

/* PrimeVue DataTable Styling */
.employee-selection-table {
  background: var(--bg-secondary);
}

.employee-selection-table :deep(.p-datatable-thead > tr > th) {
  background: var(--bg-tertiary);
  border: none;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-muted);
  font-weight: 500;
  font-size: 14px;
  padding: 16px 20px;
}

.employee-selection-table :deep(.p-datatable-tbody > tr) {
  background: var(--bg-secondary);
  border: none;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.employee-selection-table :deep(.p-datatable-tbody > tr:hover) {
  background: var(--hover-bg);
}

.employee-selection-table :deep(.p-datatable-tbody > tr.p-highlight) {
  background: var(--selected-bg);
  border-left: 3px solid var(--accent-color);
}

.employee-selection-table :deep(.p-datatable-tbody > tr > td) {
  border: none;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 16px 20px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
  flex: 1;
}

.empty-state-icon {
  color: var(--text-muted);
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.empty-state-description {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  max-width: 300px;
}

/* Employee Info */
.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 14px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
}

.employee-details {
  flex: 1;
  min-width: 0;
}

.employee-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.employee-role {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

/* Department Badge */
.department-badge {
  padding: 2px 12px 4px 10px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Contact Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-account {
  font-size: 14px;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

.contact-bank {
  font-size: 12px;
  color: var(--text-muted);
}

/* Action Button */
.action-btn {
  padding: 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.generate-btn:hover {
  background: var(--accent-color);
  color: white;
  transform: scale(1.05);
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
}

.btn-outline:hover:not(:disabled) {
  background: var(--hover-bg);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--hover-bg);
  color: var(--text-primary);
}

/* Footer Actions */
.footer-actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 24px 0;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .selection-actions {
    flex-wrap: wrap;
  }

  .employee-selection-table :deep(.p-datatable-thead > tr > th),
  .employee-selection-table :deep(.p-datatable-tbody > tr > td) {
    padding: 12px 16px;
    font-size: 12px;
  }

  .employee-avatar {
    width: 32px;
    height: 32px;
  }

  .avatar-text {
    font-size: 12px;
  }
}
</style>
