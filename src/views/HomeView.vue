<script setup lang="ts">
import ManualInputForm from '@/components/ManualInputForm.vue'
import QrDisplay from '@/components/QrDisplay.vue'
import ExcelImport from '@/components/ExcelImport.vue'
import { useQrStore } from '@/stores/qr'
import { watch, computed } from 'vue'

const qrStore = useQrStore()

// Popup QR navigation
const currentQr = computed(() => qrStore.currentQr)
const totalQrCount = computed(() => qrStore.totalQrCount)
const currentQrIndex = computed(() => qrStore.currentQrIndex)
const canPrev = computed(() => currentQrIndex.value > 0)
const canNext = computed(() => currentQrIndex.value < totalQrCount.value - 1)
const handlePrev = () => qrStore.prevQr()
const handleNext = () => qrStore.nextQr()
const handleClose = () => qrStore.closeQrDialog()

// Tự động mở dialog khi tạo QR đơn lẻ thành công (nếu chưa mở)
watch(() => qrStore.generatedQrDataUrl, (val) => {
  if (val && !qrStore.showQrDialog) qrStore.openQrDialog(0)
})

</script>

<template>
  <main class="space-y-8">
    <!-- Phần Tạo QR Thủ công -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ManualInputForm />
    </section>

    <!-- Popup QR code dùng chung cho cả đơn và nhiều QR -->
    <PrimeDialog v-model:visible="qrStore.showQrDialog" modal :closable="true" :dismissableMask="true"
      header="Mã VietQR" :style="{ width: '420px', maxWidth: '96vw' }" content-class="bg-gray-800 p-0"
      @hide="handleClose">
      <div class="flex flex-col items-center px-2">
        <QrDisplay v-if="currentQr" :qr-data-url="currentQr.qrDataUrl" :account-number="currentQr.accountNumber"
          :amount="currentQr.amount" :purpose="currentQr.purpose" :user-bank-name="currentQr.userBankName"
          :img-id="currentQr.imgId" :bank-bin="currentQr.bankBin" :show-nav="totalQrCount > 1" :can-prev="canPrev"
          :can-next="canNext" :on-prev="handlePrev" :on-next="handleNext" />
      </div>
    </PrimeDialog>

    <!-- Phần Import Excel -->
    <section>
      <ExcelImport />
    </section>
  </main>
</template>
