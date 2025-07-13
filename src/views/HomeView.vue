<script setup lang="ts">
import QrCreation from '@/components/QrCreation.vue'
import QrDisplay from '@/components/QrDisplay.vue'
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
  <main class="w-full view-container">
    <QrCreation />

    <!-- Popup QR code dùng chung cho cả đơn và nhiều QR -->
    <PrimeDialog v-model:visible="qrStore.showQrDialog" modal :closable="true" :dismissableMask="true"
      header="QR Payment Code" :style="{ width: '100%', maxWidth: '380px' }" content-class="p-0 overflow-hidden"
      header-class="p-3 text-center bg-white border-b-0" @hide="handleClose">
      <div class="w-full">
        <QrDisplay v-if="currentQr" :qr-data-url="currentQr.qrDataUrl" :account-number="currentQr.accountNumber"
          :amount="currentQr.amount" :purpose="currentQr.purpose" :user-bank-name="currentQr.userBankName"
          :img-id="currentQr.imgId" :bank-bin="currentQr.bankBin" :show-nav="totalQrCount > 1" :can-prev="canPrev"
          :can-next="canNext" />
      </div>
    </PrimeDialog>
  </main>
</template>

<style scoped>
/* Override PrimeDialog styles for QR popup */
:deep(.p-dialog .p-dialog-header) {
  padding: 1rem 1.5rem 0.5rem 1.5rem;
  font-weight: 600;
  font-size: 18px;
  background: var(--p-dialog-header-background);
  color: var(--p-dialog-header-color);
  border-bottom: none;
}

:deep(.p-dialog .p-dialog-content) {
  padding: 0;
  background: var(--p-dialog-background);
  overflow: visible;
}

:deep(.p-dialog) {
  max-height: 90vh;
  overflow: visible;
  background: var(--p-dialog-background);
  border: 1px solid var(--p-dialog-border-color);
}
</style>
