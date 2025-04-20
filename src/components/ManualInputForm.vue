<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQrStore } from '@/stores/qr'
import { useBanksStore } from '@/stores/banks'
import { useAccountStore } from '@/stores/account'

const qrStore = useQrStore()
const banksStore = useBanksStore()
const accountStore = useAccountStore()

// Sử dụng đúng computed property từ store
const bankList = computed(() => banksStore.bankSelectOptions)
const isLoadingBanks = computed(() => banksStore.isLoading)
const bankError = computed(() => banksStore.error)

const selectedBankBin = computed({
  get: () => qrStore.manualInput.bankBin,
  set: (value) => qrStore.manualInput.bankBin = value
})

const accountNumber = computed({
  get: () => qrStore.manualInput.accountNumber,
  set: (value) => qrStore.manualInput.accountNumber = value
})

const amount = computed<number | undefined>({
  get: () => qrStore.manualInput.amount,
  set: (value: string | number | null | undefined) => {
    if (value === '') {
      qrStore.manualInput.amount = undefined;
    } else if (value === null || value === undefined) {
      qrStore.manualInput.amount = undefined;
    }
    else {
      const numValue = Number(value);
      qrStore.manualInput.amount = isNaN(numValue) || numValue < 0 ? undefined : numValue;
    }
  }
})

const nickname = computed({
  get: () => qrStore.manualInput.nickname || '',
  set: (value) => qrStore.manualInput.nickname = value || undefined
})

const purpose = computed({
  get: () => qrStore.manualInput.purpose || '',
  set: (value) => qrStore.manualInput.purpose = value || undefined
})

function handleGenerateQr() {
  qrStore.generateSingleQrCode()
}

function handleClearForm() {
  qrStore.clearManualForm()
}

// Popup chọn tài khoản đã lưu
const showAccountDialog = ref(false)
const handleShowAccountDialog = async () => {
  showAccountDialog.value = true
  if (typeof accountStore.fetchAccounts === 'function') {
    await accountStore.fetchAccounts()
  }
}
const handleHideAccountDialog = () => showAccountDialog.value = false

// Kiểu cho tài khoản đã lưu
interface SavedAccount {
  id: number
  bank_bin: string
  account_number: string
  nickname?: string
  account_holder?: string
}

// Khi chọn tài khoản, bind xuống ManualInputForm
function handleSelectAccount(acc: SavedAccount) {
  qrStore.manualInput.bankBin = acc.bank_bin
  qrStore.manualInput.accountNumber = acc.account_number
  qrStore.manualInput.nickname = acc.nickname || acc.account_holder || ''
  showAccountDialog.value = false
}

// ĐÃ XÓA onMounted(() => banksStore.fetchBanks())
</script>

<template>
  <div class="manual-input-form bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-green-400">Tạo QR Thủ Công</h2>
      <PrimeButton icon="pi pi-user-plus" class="!p-2 !rounded-full" severity="secondary" :text="true"
        @click="handleShowAccountDialog" title="Chọn nhanh tài khoản đã lưu" />
    </div>
    <form @submit.prevent="handleGenerateQr">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <!-- Bank Selection Dropdown -->
        <div class="relative">
          <label for="bank-bin" class="block text-sm font-medium text-gray-300 mb-1">Ngân hàng *</label>
          <PrimeSelect v-model="selectedBankBin" :options="bankList" optionLabel="label" optionValue="value"
            :placeholder="isLoadingBanks ? 'Đang tải ngân hàng...' : (bankError ? 'Lỗi tải ngân hàng' : 'Chọn ngân hàng')"
            class="w-full" :showClear="true" inputId="bank-bin" :loading="isLoadingBanks"
            :disabled="isLoadingBanks || !!bankError" />
          <small v-if="bankError" class="text-red-400 text-xs mt-1">{{ bankError }}</small>
        </div>

        <!-- Account Number -->
        <div>
          <label for="account-number" class="block text-sm font-medium text-gray-300 mb-1">Số tài khoản *</label>
          <PrimeInputText id="account-number" v-model="accountNumber" required class="w-full"
            placeholder="Nhập số tài khoản" />
        </div>

        <!-- Nickname / Account Holder Name -->
        <div>
          <label for="nickname" class="block text-sm font-medium text-gray-300 mb-1">Tên gợi nhớ / Chủ TK *</label>
          <PrimeInputText id="nickname" v-model="nickname" required class="w-full"
            placeholder="Nhập tên gợi nhớ hoặc chủ TK" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Amount -->
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-300 mb-1">Số tiền (VND)</label>
          <PrimeInputNumber id="amount" v-model="amount" :min="0" :step="1000" class="w-full"
            placeholder="Để trống nếu không cố định số tiền" inputClass="w-full" />
        </div>

        <!-- Purpose -->
        <div>
          <label for="purpose" class="block text-sm font-medium text-gray-300 mb-1">Nội dung chuyển khoản</label>
          <PrimeInputText id="purpose" v-model="purpose" maxlength="70" class="w-full"
            placeholder="Tối đa 70 ký tự (vd: TT tien nha T4)" />
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="qrStore.generationError"
        class="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 text-sm rounded-md">
        {{ qrStore.generationError }}
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 my-[8px]">
        <button type="button" @click="handleClearForm" title="Xóa Form"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition duration-200 ease-in-out flex items-center">
          <i class="pi pi-times mr-1"></i>
          Xóa
        </button>
        <button type="submit" :disabled="qrStore.isGeneratingQr || !selectedBankBin || !accountNumber || !nickname"
          title="Tạo mã QR"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
          <i v-if="qrStore.isGeneratingQr" class="pi pi-spin pi-spinner mr-2"></i>
          <i v-else class="pi pi-qrcode mr-1"></i>
          {{ qrStore.isGeneratingQr ? 'Đang tạo...' : 'Tạo QR' }}
        </button>
      </div>
    </form>

    <!-- Popup danh sách tài khoản đã lưu -->
    <PrimeDialog v-model:visible="showAccountDialog" modal header="Chọn tài khoản đã lưu"
      :style="{ width: '100%', maxWidth: '360px' }" content-class="bg-gray-800 p-0" @hide="handleHideAccountDialog">
      <div class="p-1 md:p-2">
        <PrimeDataTable :value="accountStore.accounts" dataKey="id" class="p-datatable-sm bg-gray-800 text-gray-200"
          :rows="8" scrollable scrollHeight="320px">
          <PrimeColumn field="nickname" header="Tên gợi nhớ/Chủ TK" />
          <PrimeColumn field="account_number" header="Số tài khoản" />
          <PrimeColumn field="bank_bin" header="Mã NH/BIN" />
          <PrimeColumn header="Chọn" style="width: 60px; text-align: center;">
            <template #body="slotProps">
              <PrimeButton icon="pi pi-check" class="!p-2 !rounded-full" severity="success" :text="true"
                @click="() => handleSelectAccount(slotProps.data as SavedAccount)" />
            </template>
          </PrimeColumn>
        </PrimeDataTable>
        <div v-if="!accountStore.accounts || accountStore.accounts.length === 0" class="text-center text-gray-400 py-4">
          Không có tài khoản nào được lưu.
        </div>
      </div>
    </PrimeDialog>
  </div>
</template>
