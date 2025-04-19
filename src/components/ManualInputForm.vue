<script setup lang="ts">
import { computed } from 'vue'
import { useQrStore } from '@/stores/qr'
import { bankBins } from '@/utils/vietqr'
import { XMarkIcon, QrCodeIcon } from '@heroicons/vue/24/solid'

const qrStore = useQrStore()

const bankList = computed(() => {
  return Object.entries(bankBins).map(([bin, name]) => ({
    bin,
    name,
    label: `${name} (${bin})`,
    value: bin,
  }))
})

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
  set: (value: string | number | null | undefined) => { // Xác định rõ kiểu đầu vào có thể là string từ input
    // Kiểm tra nếu value là chuỗi rỗng một cách tường minh
    if (value === '') {
      qrStore.manualInput.amount = undefined;
    } else if (value === null || value === undefined) {
      qrStore.manualInput.amount = undefined;
    }
    else {
      // Nếu không phải chuỗi rỗng, null, undefined, cố gắng chuyển đổi sang số
      const numValue = Number(value);
      // Gán undefined nếu không phải là số hợp lệ hoặc là số âm (mặc dù input type=number đã xử lý phần nào)
      qrStore.manualInput.amount = isNaN(numValue) || numValue < 0 ? undefined : numValue;
    }
  }
})

const purpose = computed({
  get: () => qrStore.manualInput.purpose || '', // Trả về chuỗi rỗng nếu undefined
  set: (value) => qrStore.manualInput.purpose = value || undefined // Gán undefined nếu chuỗi rỗng
})

function handleGenerateQr() {
  qrStore.generateSingleQrCode()
}

function handleClearForm() {
  qrStore.clearManualForm()
}

// Tìm tên ngân hàng dựa trên BIN đã chọn
const selectedBankName = computed(() => {
  return bankBins[selectedBankBin.value] || 'Chọn ngân hàng';
});

</script>

<template>
  <div class="manual-input-form bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
    <h2 class="text-lg font-semibold mb-4 text-green-400">Tạo QR Thủ Công</h2>
    <form @submit.prevent="handleGenerateQr">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Bank Selection Dropdown -->
        <div class="relative">
          <label for="bank-bin" class="block text-sm font-medium text-gray-300 mb-1">Ngân hàng *</label>
          <PrimeSelect v-model="selectedBankBin" :options="bankList" optionLabel="label" optionValue="value"
            placeholder="Chọn ngân hàng" class="w-full" :showClear="true" inputId="bank-bin" />
        </div>

        <!-- Account Number -->
        <div>
          <label for="account-number" class="block text-sm font-medium text-gray-300 mb-1">Số tài khoản *</label>
          <PrimeInputText id="account-number" v-model="accountNumber" required class="w-full"
            placeholder="Nhập số tài khoản" />
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
          <XMarkIcon class="h-5 w-5 mr-1" />
          Xóa
        </button>
        <button type="submit" :disabled="qrStore.isGeneratingQr || !selectedBankBin || !accountNumber" title="Tạo mã QR"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
          <svg v-if="qrStore.isGeneratingQr" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <QrCodeIcon v-else class="h-5 w-5 mr-1" />
          {{ qrStore.isGeneratingQr ? 'Đang tạo...' : 'Tạo QR' }}
        </button>
      </div>
    </form>
  </div>
</template>
