<script setup lang="ts">
import ManualInputForm from '@/components/ManualInputForm.vue'
import QrDisplay from '@/components/QrDisplay.vue'
import SavedAccounts from '@/components/SavedAccounts.vue'
import ExcelImport from '@/components/ExcelImport.vue'
import { useQrStore } from '@/stores/qr'

import { computed } from 'vue'
const qrStore = useQrStore()

// Dữ liệu cho component QrDisplay đơn lẻ (từ form thủ công)
const singleQrDataUrl = computed(() => qrStore.generatedQrDataUrl)
const singleQrAccountNumber = computed(() => qrStore.manualInput.accountNumber)
const singleQrAmount = computed(() => qrStore.manualInput.amount)
const singleQrPurpose = computed(() => qrStore.manualInput.purpose)
const singleQrDownloadHandler = qrStore.downloadSingleQr

</script>

<template>
  <main class="space-y-8">
    <!-- Phần Tạo QR Thủ công và Hiển thị QR đơn lẻ -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ManualInputForm />
      <QrDisplay :qr-data-url="singleQrDataUrl" :account-number="singleQrAccountNumber" :amount="singleQrAmount"
        :purpose="singleQrPurpose" :download-handler="singleQrDownloadHandler" />
    </section>

    <!-- Phần Tài khoản đã lưu -->
    <section>
      <SavedAccounts />
    </section>

    <!-- Phần Import Excel -->
    <section>
      <ExcelImport />
    </section>

  </main>
</template>
