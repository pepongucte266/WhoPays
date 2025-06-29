<script setup lang="ts">
import ManualInputForm from '@/components/ManualInputForm.vue'
import QrDisplay from '@/components/QrDisplay.vue'
import ExcelImport from '@/components/ExcelImport.vue'
import HelloWorld from '@/components/HelloWorld.vue'
import { useQrStore } from '@/stores/qr'
import { watch, computed } from 'vue'

const qrStore = useQrStore()

// Popup QR navigation
const currentQr = computed(() => qrStore.currentQr)
const totalQrCount = computed(() => qrStore.totalQrCount)
const currentQrIndex = computed(() => qrStore.currentQrIndex)
const canPrev = computed(() => currentQrIndex.value > 0)
const canNext = computed(() => currentQrIndex.value < totalQrCount.value - 1)
const handleClose = () => qrStore.closeQrDialog()

// Tự động mở dialog khi tạo QR đơn lẻ thành công (nếu chưa mở)
watch(() => qrStore.generatedQrDataUrl, (val) => {
  if (val && !qrStore.showQrDialog) qrStore.openQrDialog(0)
})
</script>

<template>
  <main class="w-full space-y-4 md:space-y-8 px-1 md:px-0">
    <!-- <HelloWorld /> -->
    <!-- Phần Tạo QR Thủ công -->
    <section class="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
      <ManualInputForm />
    </section>

    <!-- Popup QR code dùng chung cho cả đơn và nhiều QR -->
    <PrimeDialog v-model:visible="qrStore.showQrDialog" modal :closable="true" :dismissableMask="true"
      header="Mã VietQR" :style="{ width: '100%', maxWidth: '420px' }" content-class="bg-gray-800 p-0"
      @hide="handleClose">
      <div class="flex flex-col items-center px-1 md:px-2 w-full max-w-full">
        <QrDisplay v-if="currentQr" :qr-data-url="currentQr.qrDataUrl" :account-number="currentQr.accountNumber"
          :amount="currentQr.amount" :purpose="currentQr.purpose" :user-bank-name="currentQr.userBankName"
          :img-id="currentQr.imgId" :bank-bin="currentQr.bankBin" :show-nav="totalQrCount > 1" :can-prev="canPrev"
          :can-next="canNext" />
      </div>
    </PrimeDialog>

    <!-- Phần Import Excel -->
    <section class="w-full mt-2 md:mt-4">
      <ExcelImport />
    </section>
  </main>
</template>
