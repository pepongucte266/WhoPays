<script setup lang="ts">
import { computed } from 'vue'
import { useQrStore } from '@/stores/qr'
import { useBanksStore } from '@/stores/banks'

const qrStore = useQrStore()
const banksStore = useBanksStore()

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

// ĐÃ XÓA onMounted(() => banksStore.fetchBanks())
</script>

<template>
  <div class="manual-input-form bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
    <h2 class="text-lg font-semibold mb-4 text-green-400">Tạo QR Thủ Công</h2>
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
      <div class="flex justify-end space-x-3 mt-6">
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
  </div>
</template>
