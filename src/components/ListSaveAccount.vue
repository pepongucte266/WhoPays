<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAccountStore } from '@/stores/account'
import type { SavedAccount } from '@/stores/account' // Import SavedAccount từ store

// Props
const props = defineProps<{
  visible: boolean
}>()
const localVisible = ref(props.visible)
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'select', account: SavedAccount): void
  (e: 'delete', account: SavedAccount): void
  (e: 'bulk-generate', accounts: SavedAccount[]): void
  (e: 'bulk-delete', accounts: SavedAccount[]): void
}>()

const accountStore = useAccountStore()
const selectedAccounts = ref<SavedAccount[]>([])

const flattenedAccounts = computed<Array<SavedAccount & { nickname: string }>>(() => {
  return accountStore.groupedAccounts.flatMap(group =>
    group.accounts.map(account => ({
      ...account,
      nickname: group.nickname // Add nickname to each account object
    }))
  )
})

function handleClose() {
  localVisible.value = false
  emit('update:visible', false)
  selectedAccounts.value = []
}

function handleQuickSelectAccount(acc: SavedAccount) {
  emit('select', acc)
  handleClose()
}

function handleDeleteSingleAccount(acc: SavedAccount) {
  emit('delete', acc)
  // Optionally, refetch or remove from local list if not handled by store reactivity
  // For now, assume store handles updates and UI re-renders
}

function handleBulkGenerateQr() {
  if (selectedAccounts.value.length > 0) {
    emit('bulk-generate', [...selectedAccounts.value])
    handleClose()
  }
}

function handleBulkDelete() {
  if (selectedAccounts.value.length > 0) {
    emit('bulk-delete', [...selectedAccounts.value])
    selectedAccounts.value = [] // Clear selection after emitting
  }
}

const actionItems = computed(() => [
  {
    label: 'Xóa tài khoản đã chọn',
    icon: 'pi pi-trash',
    command: handleBulkDelete,
  },
  {
    label: 'Tạo QR hàng loạt',
    icon: 'pi pi-qrcode',
    command: handleBulkGenerateQr,
  }
])
const isActionDisabled = computed(() => selectedAccounts.value.length === 0)

watch(() => props.visible, (val) => {
  localVisible.value = val
})

watch(localVisible, async (val) => {
  emit('update:visible', val)
  if (val) {
    await accountStore.fetchAccounts()
    selectedAccounts.value = []
  }
})

</script>

<template>
  <PrimeDialog v-model:visible="localVisible" modal header="Chọn tài khoản đã lưu"
    :style="{ width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh' }" content-class="bg-gray-800 p-0"
    @hide="handleClose">
    <PrimeConfirmDialog />
    <PrimeToast />
    <div class="p-1 md:p-2 h-full flex flex-col">
      <div class="mb-2 flex justify-end">
        <PrimeSplitButton label="Hành động" icon="pi pi-cog" :model="actionItems" :disabled="isActionDisabled"
          severity="secondary" class="p-button-sm" :menuButtonProps="{ 'aria-label': 'More Actions' }" />
      </div>
      <PrimeDataTable :value="flattenedAccounts" dataKey="id" v-model:selection="selectedAccounts"
        class="p-datatable-sm bg-gray-800 text-gray-200 h-full" :rows="10" scrollable scrollHeight="flex"
        selectionMode="multiple" responsiveLayout="scroll" sortField="nickname" :sortOrder="1">
        <PrimeColumn selectionMode="multiple" headerStyle="width: 3rem" :frozen="true" />
        <PrimeColumn field="nickname" header="Chủ tài khoản" sortable style="min-width: 150px" :frozen="true" />
        <PrimeColumn field="account_number" header="Số tài khoản" sortable style="min-width: 150px" />
        <PrimeColumn field="bank_code" header="Ngân hàng (Mã)" sortable style="min-width: 100px" />
        <PrimeColumn header="Hành động" style="min-width: 120px;" bodyClass="text-center" headerClass="text-center">
          <!-- Removed text-align: center from style as bodyClass should handle it or the div below will -->
          <template #body="slotProps">
            <div class="flex justify-center items-center w-full">
              <PrimeButton icon="pi pi-check" class="!p-2 !rounded-full mr-2" severity="success" :text="true"
                @click="() => handleQuickSelectAccount(slotProps.data as SavedAccount)" />
              <PrimeButton icon="pi pi-trash" class="!p-2 !rounded-full" severity="danger" :text="true"
                @click="() => handleDeleteSingleAccount(slotProps.data as SavedAccount)" />
            </div>
          </template>
        </PrimeColumn>
      </PrimeDataTable>
      <div v-if="!flattenedAccounts.length" class="text-center text-gray-400 py-4">
        Không có tài khoản nào được lưu. Hãy thêm tài khoản mới.
      </div>
    </div>
  </PrimeDialog>
</template>
