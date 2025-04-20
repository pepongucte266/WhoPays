<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useAccountStore, type SavedAccount } from '@/stores/account'
import { useQrStore } from '@/stores/qr'
import { useBanksStore } from '@/stores/banks'
import type { DataTableContext, DataTableRowSelectEvent } from 'primevue/datatable'

const accountStore = useAccountStore()
const qrStore = useQrStore()
const banksStore = useBanksStore()

const accounts = computed(() => accountStore.accounts)
const isLoading = computed(() => accountStore.loading)
const error = computed(() => accountStore.error)

const selectedAccountData = ref<SavedAccount | null>(null)

const dataTablePT = {
  loadingOverlay: { class: 'bg-gray-800 bg-opacity-50' },
  tbody: { class: 'bg-gray-800 divide-y divide-gray-700' },
  header: { class: 'bg-gray-750 sticky top-0 z-10' },
  row: (options: { context: DataTableContext }) => {
    const isSelected = 'selected' in options.context && options.context.selected;
    return {
      class: [isSelected ? 'bg-gray-600' : undefined, 'hover:bg-gray-700 cursor-pointer']
    };
  },
  column: {
    headercell: { class: 'px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider' },
    bodycell: { class: 'px-4 py-2 whitespace-nowrap' }
  }
};

onMounted(() => {
  if (accounts.value.length === 0) {
    accountStore.fetchAccounts()
  }
})

// Sửa: Lấy đúng tên trường mới từ store
function getBankName(bin: string): string {
  const bankInfo = banksStore.getBankByBin(bin);
  return bankInfo?.bankShortName || bankInfo?.bankName || 'N/A'
}

function handleRowSelect(event: DataTableRowSelectEvent) {
  const account = event.data as SavedAccount;
  if (account) {
    qrStore.manualInput.bankBin = account.bank_bin
    qrStore.manualInput.accountNumber = account.account_number
    qrStore.manualInput.nickname = account.nickname
    qrStore.manualInput.amount = undefined
    qrStore.manualInput.purpose = undefined
    qrStore.generatedQrDataUrl = null
    qrStore.generationError = null
  }
}

watch(() => [qrStore.manualInput.bankBin, qrStore.manualInput.accountNumber, qrStore.manualInput.nickname], () => {
  if (selectedAccountData.value &&
    (selectedAccountData.value.bank_bin !== qrStore.manualInput.bankBin ||
      selectedAccountData.value.account_number !== qrStore.manualInput.accountNumber ||
      selectedAccountData.value.nickname !== qrStore.manualInput.nickname)) {
    selectedAccountData.value = null;
  }
}, { deep: true })

async function deleteAccount(accountId: number) {
  if (confirm('Bạn có chắc chắn muốn xóa tài khoản đã lưu này?')) {
    await accountStore.deleteAccount(accountId)
    if (selectedAccountData.value?.id === accountId) {
      selectedAccountData.value = null;
    }
  }
}

async function saveCurrentAccount() {
  const { bankBin, accountNumber, nickname } = qrStore.manualInput;
  if (!bankBin || !accountNumber || !nickname) {
    alert('Vui lòng nhập đầy đủ Mã Ngân hàng, Số tài khoản và Tên gợi nhớ / Chủ TK trước khi lưu.');
    return;
  }
  const success = await accountStore.addAccount({
    bank_bin: bankBin,
    account_number: accountNumber,
    nickname: nickname
  });
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
          :disabled="!qrStore.manualInput.bankBin || !qrStore.manualInput.accountNumber || !qrStore.manualInput.nickname"
          class="p-1.5 text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed">
          <i class="pi pi-plus-circle text-xl"></i>
        </button>
        <button @click="accountStore.fetchAccounts" :disabled="isLoading" title="Tải lại danh sách"
          class="p-1.5 text-gray-400 hover:text-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed">
          <i class="pi pi-refresh text-lg" :class="{ 'pi-spin': isLoading }"></i>
        </button>
      </div>
    </div>

    <div v-if="isLoading && accounts.length === 0" class="text-center text-gray-400 py-4">
      Đang tải...
    </div>
    <div v-else-if="error" class="text-center text-red-400 py-4">
      Lỗi tải danh sách: {{ error }}
    </div>
    <PrimeDataTable v-else :value="accounts" v-model:selection="selectedAccountData" selectionMode="single" dataKey="id"
      @rowSelect="handleRowSelect" scrollable scrollHeight="240px" :loading="isLoading" class="p-datatable-sm text-sm"
      tableClass="min-w-full" :pt="dataTablePT">
      <template #empty>
        <div class="text-center text-gray-400 py-4">
          Chưa có tài khoản nào được lưu. <br /> Nhập thông tin vào form và nhấn nút
          <i class="pi pi-plus-circle inline-block text-blue-400 -mt-1"></i> để lưu.
        </div>
      </template>
      <template #loading>
        <div class="text-center text-gray-400 py-4">
          Đang tải dữ liệu...
        </div>
      </template>

      <PrimeColumn field="bank_bin" header="Ngân hàng">
        <template #body="slotProps">
          <span class="font-medium text-white truncate">{{ getBankName(slotProps.data.bank_bin) }}</span>
        </template>
      </PrimeColumn>
      <PrimeColumn field="account_number" header="Số tài khoản">
        <template #body="slotProps">
          <span class="text-gray-300 truncate">{{ slotProps.data.account_number }}</span>
        </template>
      </PrimeColumn>
      <PrimeColumn field="nickname" header="Tên gợi nhớ / Chủ TK">
        <template #body="slotProps">
          <span class="text-gray-300 truncate">{{ slotProps.data.nickname || 'N/A' }}</span>
        </template>
      </PrimeColumn>
      <PrimeColumn headerStyle="width: 4rem; text-align: right" bodyStyle="text-align: right; overflow: visible">
        <template #header>
          <span class="sr-only">Actions</span>
        </template>
        <template #body="slotProps">
          <button @click.stop="deleteAccount(slotProps.data.id)" title="Xóa tài khoản"
            class="p-1 text-gray-400 hover:text-red-400">
            <i class="pi pi-trash text-sm"></i>
          </button>
        </template>
      </PrimeColumn>
    </PrimeDataTable>
  </div>
</template>
