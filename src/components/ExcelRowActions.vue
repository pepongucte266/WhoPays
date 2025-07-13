<script setup lang="ts">
import { useQrStore } from '@/stores/qr'

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

function deleteRecordFromExcel(record = props.data) {
  qrStore.removeExcelRecord(record.id)
}
</script>

<template>
  <div class="excel-row-actions">
    <button class="remove-action-button" @click="deleteRecordFromExcel()" v-tooltip.top="'Xóa bản ghi'">
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <!-- X icon for remove -->
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 18 12-12" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.excel-row-actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove-action-button {
  padding: 8px;
  background-color: transparent;
  border: none;
  border-radius: 10px;
  color: #EF4444;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-action-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.remove-action-button svg {
  width: 12px;
  height: 12px;
}
</style>
