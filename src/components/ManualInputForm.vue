<script setup lang="ts">
import ListSaveAccount from './ListSaveAccount.vue'
import { computed, ref } from 'vue'
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useQrStore } from '@/stores/qr'
import { useBanksStore } from '@/stores/banks'
import { useAccountStore } from '@/stores/account'

const qrStore = useQrStore()
const banksStore = useBanksStore()
const accountStore = useAccountStore()
const confirm = useConfirm();
const toast = useToast();

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

/** State cho popup chọn tài khoản đã lưu */
const showAccountDialog = ref(false)
/** State cho form showAmnualCreate */
const showAmnualCreate = ref(false)

// Kiểu cho tài khoản đã lưu
interface SavedAccount {
  id: number
  bank_bin: string
  account_number: string
  nickname?: string
  account_holder?: string
}

/** Bind nhanh dữ liệu tài khoản đã lưu xuống form */
function handleQuickSelectAccount(acc: SavedAccount) {
  qrStore.manualInput.bankBin = acc.bank_bin
  qrStore.manualInput.accountNumber = acc.account_number
  qrStore.manualInput.nickname = acc.nickname || acc.account_holder || ''
  handleHideAccountDialog()
}

/** Hiển thị và ẩn popup chọn tài khoản đã lưu */
async function handleShowAccountDialog() {
  await accountStore.fetchAccounts()
  showAccountDialog.value = true
}
function handleHideAccountDialog() {
  showAccountDialog.value = false
}

/** Xóa nhanh 1 tài khoản đã lưu */
function handleDeleteSingleAccount(acc: SavedAccount) {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa tài khoản "${acc.nickname || acc.account_number}" không?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    accept: async () => {
      toast.add({ severity: 'info', summary: 'Đang xử lý', detail: 'Đang xóa tài khoản...', life: 3000 });
      try {
        const ok = await accountStore.deleteAccount(acc.id)
        if (ok) {
          await accountStore.fetchAccounts()
          toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa tài khoản', life: 3000 })
        } else {
          toast.add({ severity: 'error', summary: 'Lỗi', detail: accountStore.error || 'Xóa thất bại', life: 4000 })
        }
      } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi xóa', life: 4000 })
      } finally {
        confirm.close()
      }
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Đã hủy', detail: 'Hủy thao tác xóa', life: 3000 });
    }
  });
}

/** Lưu tài khoản mới từ form nhập thủ công */
async function handleSaveAccount() {
  if (!selectedBankBin.value || !accountNumber.value || !nickname.value) {
    toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập đủ ngân hàng, số tài khoản, tên gợi nhớ.', life: 3000 })
    return
  }
  const ok = await accountStore.addAccount({
    bank_bin: selectedBankBin.value,
    account_number: accountNumber.value,
    nickname: nickname.value,
  })
  if (ok) {
    toast.add({ severity: 'success', summary: 'Đã lưu', detail: 'Tài khoản đã được lưu', life: 3000 })
    await accountStore.fetchAccounts()
  } else {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: accountStore.error || 'Không thể lưu tài khoản', life: 4000 })
  }
}


// Hàm xử lý xóa (sẽ implement chi tiết ở bước sau)
function handleDeleteSelectedAccounts(accounts: SavedAccount[]) {
  if (!accounts.length) return;
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa ${accounts.length} tài khoản đã chọn không? Hành động này không thể hoàn tác.`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    accept: async () => {
      toast.add({ severity: 'info', summary: 'Đang xử lý', detail: 'Đang xóa tài khoản...', life: 3000 });
      try {
        const ids = accounts.map((a) => a.id)
        const ok = await accountStore.deleteAccounts(ids)
        if (ok) {
          await accountStore.fetchAccounts()
          toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa tài khoản', life: 3000 })
        } else {
          toast.add({ severity: 'error', summary: 'Lỗi', detail: accountStore.error || 'Xóa thất bại', life: 4000 })
        }
      } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi xóa', life: 4000 })
      } finally {
        confirm.close()
      }
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Đã hủy', detail: 'Hủy thao tác xóa', life: 3000 });
    }
  });
}

// Hàm xử lý tạo QR hàng loạt (sẽ implement chi tiết ở bước sau)
function handleBulkGenerateQr(accounts: SavedAccount[]) {
  if (!accounts.length) return
  // Chuẩn hóa dữ liệu sang dạng ExcelRecord
  const records = accounts.map((acc, idx) => ({
    id: idx + 1,
    bankBin: acc.bank_bin,
    accountNumber: acc.account_number,
    nickname: acc.nickname || acc.account_holder || '',
    amount: undefined,
    purpose: '',
    selected: true,
  }))
  qrStore.excelRecords = records
  handleHideAccountDialog()
  setTimeout(() => {
    qrStore.generateMultipleQrCodes()
    toast.add({ severity: 'info', summary: 'Đang xử lý', detail: 'Đang tạo QR hàng loạt...', life: 3000 })
  }, 100)
}


</script>

<template>
  <div class="manual-input-form p-4 md:p-6 rounded-lg shadow-md">
    <div class="flex items-center justify-between mb-4">
      <!-- <h2 class="text-lg font-semibold text-green-400">Tạo QR Thủ Công</h2> -->
      <PrimeButton icon="pi pi-user-plus" class="!p-2 !rounded-full" severity="secondary" :text="true"
        @click="handleShowAccountDialog" title="Chọn nhanh tài khoản đã lưu" />
    </div>
    <form @submit.prevent="handleGenerateQr" v-if="showAmnualCreate">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <!-- Bank Selection Dropdown -->
        <div class="relative">
          <label for="bank-bin" class="block text-sm font-medium text-gray-300 mb-1">Ngân hàng *</label>
          <PrimeSelect v-model="selectedBankBin" :options="bankList" optionLabel="label" optionValue="value"
            :placeholder="isLoadingBanks ? 'Đang tải ngân hàng...' : (bankError ? 'Lỗi tải ngân hàng' : 'Chọn ngân hàng')"
            class="w-full" :showClear="true" inputId="bank-bin" :loading="isLoadingBanks"
            :disabled="isLoadingBanks || !!bankError" :filter="true" />
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
      <div class="flex justify-end gap-2 my-[8px]">
        <PrimeButton type="button" @click="handleClearForm" title="Xóa Form" severity="secondary"
          class="p-button-sm mr-[8px]" :text="false">
          <i class="pi pi-times mr-1"></i>
          Xóa
        </PrimeButton>
        <PrimeButton type="button" @click="handleSaveAccount" title="Lưu tài khoản" severity="info"
          class="p-button-sm mr-[8px]" :disabled="!selectedBankBin || !accountNumber || !nickname" :text="false">
          <i class="pi pi-save mr-1"></i>
          Lưu tài khoản
        </PrimeButton>
        <PrimeButton type="submit" :disabled="qrStore.isGeneratingQr || !selectedBankBin || !accountNumber || !nickname"
          title="Tạo mã QR" severity="success" class="p-button-sm font-semibold" :loading="qrStore.isGeneratingQr"
          :text="false">
          <i class="pi pi-qrcode mr-1"></i>
          {{ qrStore.isGeneratingQr ? 'Đang tạo...' : 'Tạo QR' }}
        </PrimeButton>
      </div>
    </form>

    <!-- Popup danh sách tài khoản đã lưu (component tách riêng) -->
    <ListSaveAccount v-model:visible="showAccountDialog" @select="handleQuickSelectAccount"
      @delete="handleDeleteSingleAccount" @bulk-generate="handleBulkGenerateQr"
      @bulk-delete="handleDeleteSelectedAccounts" />
  </div>
</template>
