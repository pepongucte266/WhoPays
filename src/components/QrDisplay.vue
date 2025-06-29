<script setup lang="ts">
import { computed } from 'vue'
import { useQrStore } from '@/stores/qr'
import { getBankLogoUrl } from '@/utils/vietqr'
import { useBanksStore } from '@/stores/banks'

const qrStore = useQrStore()
const banksStore = useBanksStore()

const props = defineProps<{
  qrDataUrl: string | null | undefined
  accountNumber: string | undefined
  amount: number | undefined
  purpose?: string | undefined
  downloadHandler?: () => void
  recordId?: number
  bankBin?: string
  bankName?: string
  userBankName?: string
  imgId?: string
  showNav?: boolean
  canPrev?: boolean
  canNext?: boolean
}>()

const displayAmount = computed(() => {
  if (props.amount === undefined || props.amount === null) return 'Không cố định'
  return props.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
})

const displayPurpose = computed(() => props.purpose || 'Không có')

// Ưu tiên imgId, nếu không có thì lấy từ bankBin (Excel)
const logoUrl = computed(() => {
  if (props.imgId) return getBankLogoUrl(props.imgId)
  if (props.bankBin) {
    const bank = banksStore.getBankByBin(props.bankBin)
    if (bank?.imageId) return getBankLogoUrl(bank.imageId)
  }
  return null
})

// Sửa lại điều kiện: chỉ cần có qrDataUrl là cho phép tải
const canDownload = computed(() => !!props.qrDataUrl)

const handlePrev = () => qrStore.prevQr()
const handleNext = () => qrStore.nextQr()

function handleDownload() {
  if (props.downloadHandler) {
    props.downloadHandler()
  } else if (props.recordId !== undefined) {
    qrStore.downloadExcelQr(props.recordId)
  } else {
    qrStore.downloadSingleQr()
  }
}
</script>

<template>
  <div v-if="qrDataUrl"
    class="qr-popup-ui relative flex flex-col items-center mx-auto rounded-2xl shadow-2xl border border-[#232e4d] overflow-hidden"
    style="background: linear-gradient(135deg, #111C44 60%, #1B2559 100%); min-width: 340px; max-width: 424px; padding: 20px;">
    <!-- Header: Logo ngân hàng, số tài khoản, tên chủ tài khoản -->
    <div class="flex flex-col items-center w-full mb-5">
      <img v-if="logoUrl" :src="logoUrl" alt="Logo ngân hàng"
        class="h-14 w-[150px] object-contain rounded-lg bg-white shadow-sm mb-2" />
      <div class="text-[18px] font-semibold text-[#2CD7A5] tracking-wider mb-1">{{ accountNumber || 'N/A' }}</div>
      <div class="text-[14px] font-medium text-white truncate max-w-[180px]">{{ userBankName || '-' }}</div>
    </div>
    <!-- QR code + navigation -->
    <div class="relative flex items-center justify-center w-full">
      <PrimeButton v-if="showNav" class="absolute left-0 top-1/2 -translate-y-1/2 z-10 !p-3 !rounded-full"
        :icon="'pi pi-angle-left'" severity="secondary" :text="true" :disabled="!canPrev" @click="handlePrev"
        style="margin-left: -8px;" />
      <img :src="qrDataUrl" alt="VietQR Code"
        class="w-52 h-52 object-contain rounded-lg bg-white p-2 mt-[20px] mb-[20px] shadow-lg border-[6px] border-white" />
      <PrimeButton v-if="showNav" class="absolute right-0 top-1/2 -translate-y-1/2 z-10 !p-3 !rounded-full"
        :icon="'pi pi-angle-right'" severity="secondary" :text="true" :disabled="!canNext" @click="handleNext"
        style="margin-right: -8px;" />
    </div>
    <!-- Số tiền -->
    <div v-if="props.amount && props.amount > 0" class="flex flex-col items-center w-full mt-2 mb-1 space-y-1">
      <div class="text-[#A3AED0] text-[11px] font-medium uppercase tracking-widest">Số tiền</div>
      <div class="text-[18px] font-bold text-[#FFD600]">{{ displayAmount }}</div>
    </div>
    <!-- Nội dung chuyển khoản -->
    <div v-if="props.purpose && props.purpose.trim().length > 0"
      class="flex flex-col items-center w-full mb-2 space-y-1">
      <div class="text-[#A3AED0] text-[11px] font-medium uppercase tracking-widest">Nội dung chuyển khoản</div>
      <div class="text-[13px] font-semibold text-[#60A5FA] text-center break-words max-w-[220px]">{{ displayPurpose }}
      </div>
    </div>
    <div class="w-full h-[1px] bg-[#232e4d] my-2"></div>
    <!-- Nút tải xuống -->
    <PrimeButton v-if="canDownload" @click="handleDownload" title="Tải xuống mã QR"
      class="mt-auto mb-1 !p-3 !rounded-full !shadow-lg flex items-center justify-center" severity="primary"
      :icon="'pi pi-download'" :aria-label="'Tải xuống mã QR'" :text="true" :rounded="true" />
    <p v-else class="mt-auto text-xs text-gray-300 italic mb-2">Không thể tải xuống</p>
  </div>
  <div v-else
    class="qr-display-placeholder bg-gray-700 p-6 rounded-lg shadow border border-gray-600 text-center flex flex-col items-center justify-center min-h-[300px]">
    <p class="text-gray-400">Nhập thông tin và nhấn "Tạo QR" để hiển thị mã tại đây.</p>
  </div>
</template>
