<script setup lang="ts">
import { useQrStore } from '@/stores/qr'
import { useAccountStore } from '@/stores/account'

const props = defineProps<{
  data: {
    id: number
    selected?: boolean
    qrDataUrl?: string
    error?: string
    bankBin: string
    accountNumber: string
    nickname?: string
    amount?: number
    purpose?: string
    _saveStatus?: 'success' | 'error'
    _saveError?: string
  }
}>()

const qrStore = useQrStore()
const accountStore = useAccountStore()

async function handleShowQr(record = props.data) {
  const storeRecord = qrStore.excelRecords.find(r => r.id === record.id)
  if (!storeRecord) {
    console.error('Record not found in store for QR display')
    return
  }

  if (storeRecord.qrDataUrl) {
    const qrListIndex = qrStore.qrList.findIndex(
      (qr) => qr.qrDataUrl === storeRecord.qrDataUrl && qr.accountNumber === storeRecord.accountNumber
    )
    if (qrListIndex !== -1) {
      qrStore.openQrDialog(qrListIndex)
    } else {
      alert('Không thể hiển thị QR. Dữ liệu QR có thể chưa sẵn sàng trong danh sách hiển thị.')
    }
  } else if (storeRecord.error) {
    alert(`Lỗi tạo QR cho bản ghi này: ${storeRecord.error}`)
  } else {
    alert('QR chưa được tạo cho bản ghi này. Vui lòng chọn và tạo QR hàng loạt.')
  }
}

async function saveAccountFromExcel(record = props.data) {
  const input = {
    bank_bin: record.bankBin,
    account_number: record.accountNumber,
    nickname: record.nickname,
  }
  const success = await accountStore.addAccount(input)
  if (success) {
    record._saveStatus = 'success'
    setTimeout(() => { record._saveStatus = undefined }, 2000)
  } else {
    record._saveStatus = 'error'
    record._saveError = accountStore.error ?? undefined
    setTimeout(() => { record._saveStatus = undefined; record._saveError = undefined }, 4000)
  }
}

function deleteRecordFromExcel(record = props.data) {
  qrStore.removeExcelRecord(record.id)
}
</script>

<template>
  <ButtonGroup class="flex w-full p-0 gap-0">
    <PrimeButton class="flex-1" severity="info" icon="pi pi-qrcode" v-tooltip.top="'Xem QR'"
      :disabled="!data.qrDataUrl && !data.error" @click="handleShowQr()" />
    <PrimeButton class="flex-1" icon="pi pi-save" v-tooltip.top="'Lưu tài khoản'" :disabled="accountStore.loading"
      @click="saveAccountFromExcel()" />
    <PrimeButton class="flex-1 p-button-danger" icon="pi pi-trash" v-tooltip.top="'Xóa bản ghi'"
      @click="deleteRecordFromExcel()" />
  </ButtonGroup>
</template>
