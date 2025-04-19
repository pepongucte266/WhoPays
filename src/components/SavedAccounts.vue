<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAccountStore, type SavedAccount } from '@/stores/account'
import { useQrStore } from '@/stores/qr'
import { bankBins } from '@/utils/vietqr'
import { TrashIcon, PlusCircleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline' // Sử dụng outline icons

const accountStore = useAccountStore()
const qrStore = useQrStore()

const accounts = computed(() => accountStore.accounts)
const isLoading = computed(() => accountStore.loading)
const error = computed(() => accountStore.error)

onMounted(() => {
  // Tải danh sách tài khoản khi component được mount (nếu chưa có)
  if (accounts.value.length === 0) {
    accountStore.fetchAccounts()
  }
})

function getBankName(bin: string): string {
  return bankBins[bin] || 'Ngân hàng không xác định'
}

function selectAccount(account: SavedAccount) {
  // Điền thông tin vào form nhập thủ công khi chọn tài khoản
  qrStore.manualInput.bankBin = account.bank_bin
  qrStore.manualInput.accountNumber = account.account_number
  // Tùy chọn: Có thể xóa số tiền và nội dung khi chọn tài khoản mới
  qrStore.manualInput.amount = undefined
  qrStore.manualInput.purpose = undefined
  qrStore.generatedQrDataUrl = null // Xóa QR cũ nếu có
  qrStore.generationError = null
}

async function deleteAccount(accountId: number) {
  if (confirm('Bạn có chắc chắn muốn xóa tài khoản đã lưu này?')) {
    await accountStore.deleteAccount(accountId)
    // Có thể thêm thông báo thành công/thất bại ở đây
  }
}

async function saveCurrentAccount() {
  const { bankBin, accountNumber } = qrStore.manualInput;
  if (!bankBin || !accountNumber) {
    alert('Vui lòng nhập Mã Ngân hàng và Số tài khoản trước khi lưu.');
    return;
  }
  // Tạm thời không cần nickname
  const success = await accountStore.addAccount({ bank_bin: bankBin, account_number: accountNumber });
  if (success) {
    alert('Đã lưu tài khoản thành công!');
  } else {
    alert('Lưu tài khoản thất bại: ' + (accountStore.error || 'Lỗi không xác định'));
  }
}

</script>

<template>
  <div class="saved-accounts bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-green-400">Tài Khoản Đã Lưu</h2>
      <div class="flex items-center space-x-2">
        <button @click="saveCurrentAccount" title="Lưu tài khoản hiện tại từ form"
          :disabled="!qrStore.manualInput.bankBin || !qrStore.manualInput.accountNumber"
          class="p-1.5 text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed">
          <PlusCircleIcon class="h-6 w-6" />
        </button>
        <button @click="accountStore.fetchAccounts" :disabled="isLoading" title="Tải lại danh sách"
          class="p-1.5 text-gray-400 hover:text-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed">
          <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>
    </div>

    <div v-if="isLoading && accounts.length === 0" class="text-center text-gray-400 py-4">
      Đang tải...
    </div>
    <div v-else-if="error" class="text-center text-red-400 py-4">
      Lỗi tải danh sách: {{ error }}
    </div>
    <div v-else-if="accounts.length === 0" class="text-center text-gray-400 py-4">
      Chưa có tài khoản nào được lưu. <br /> Nhập thông tin vào form và nhấn nút
      <PlusCircleIcon class="h-5 w-5 inline-block text-blue-400 -mt-1" /> để lưu.
    </div>
    <ul v-else class="space-y-2 max-h-60 overflow-y-auto pr-2">
      <li v-for="account in accounts" :key="account.id"
        class="flex items-center justify-between p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-150 group">
        <div @click="selectAccount(account)" class="cursor-pointer flex-grow mr-2">
          <p class="text-sm font-medium text-white truncate">{{ getBankName(account.bank_bin) }}</p>
          <p class="text-xs text-gray-300 truncate">{{ account.account_number }}</p>
        </div>
        <button @click="deleteAccount(account.id)" title="Xóa tài khoản"
          class="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <TrashIcon class="h-4 w-4" />
        </button>
      </li>
    </ul>
  </div>
</template>
