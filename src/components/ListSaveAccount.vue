<script setup lang="ts">
import { computed, ref, watch, reactive } from 'vue'
import { useAccountStore } from '@/stores/account'

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

type SavedAccount = {
  id: number
  bank_bin: string
  account_number: string
  nickname?: string
  account_holder?: string
  bank_code?: string
}

type AccountGroup = { idGroup: string; nickname: string; accounts: SavedAccount[] }
const expandedRows = ref<Record<string, boolean>>({})
// const selectedAccounts = ref<SavedAccount[]>([])

// Selection for child tables: { [groupId]: SavedAccount[] }
const selectedChildAccounts = reactive<Record<string, SavedAccount[]>>({})

const groupedAccountsWithId = computed<AccountGroup[]>(() =>
  accountStore.groupedAccounts.map((g, idx) => ({
    idGroup: `${g.nickname}-${idx}`,
    nickname: g.nickname,
    accounts: g.accounts,
  }))
)

function accountCountBody(row: { accounts: SavedAccount[] }) {
  return row.accounts.length
}

function handleClose() {
  localVisible.value = false
  emit('update:visible', false)
  // selectedAccounts.value = []
  Object.keys(selectedChildAccounts).forEach(k => delete selectedChildAccounts[k])
  expandedRows.value = {}
}

function handleQuickSelectAccount(acc: SavedAccount) {
  emit('select', acc)
  handleClose()
}

function handleDeleteSingleAccount(acc: SavedAccount) {
  emit('delete', acc)
}

function handleBulkGenerateQr() {
  // Gom tất cả các tài khoản con đã chọn từ mọi group
  const allSelected: SavedAccount[] = Object.values(selectedChildAccounts).flat()
  emit('bulk-generate', allSelected)
  handleClose()
}

function handleBulkDelete() {
  const allSelected: SavedAccount[] = Object.values(selectedChildAccounts).flat()
  emit('bulk-delete', allSelected)
  Object.keys(selectedChildAccounts).forEach(k => delete selectedChildAccounts[k])
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
const isActionDisabled = computed(() => Object.values(selectedChildAccounts).flat().length === 0)

watch(() => props.visible, (val) => {
  localVisible.value = val
})
watch(localVisible, async (val) => {
  emit('update:visible', val)
  if (val) {
    await accountStore.fetchAccounts()
    // selectedAccounts.value = []
    Object.keys(selectedChildAccounts).forEach(k => delete selectedChildAccounts[k])
    expandedRows.value = {}
  }
})

// Toggle expand/collapse when clicking on row (chỉ xử lý khi click vào row, không xử lý icon expander)
function onRowClick(event: { data: AccountGroup; originalEvent: MouseEvent }) {
  // Chỉ toggle expandedRows nếu click vào TD (cell), còn click icon expander thì PrimeVue tự xử lý
  if ((event.originalEvent.target as HTMLElement).tagName !== 'TD') return;
  const id = event.data.idGroup
  if (expandedRows.value[id]) {
    delete expandedRows.value[id]
  } else {
    expandedRows.value[id] = true
  }
}
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
      <PrimeDataTable :value="groupedAccountsWithId" dataKey="idGroup" v-model:expandedRows="expandedRows"
        class="p-datatable-sm bg-gray-800 text-gray-200 h-full" :rows="8" scrollable scrollHeight="100%"
        @row-click="onRowClick">
        <PrimeColumn expander style="width: 5rem" />
        <PrimeColumn field="nickname" />
        <template #expansion="slotProps">
          <PrimeDataTable :value="slotProps.data.accounts" dataKey="id" class="p-datatable-sm bg-gray-900 text-gray-200"
            showHeader="false" selectionMode="multiple" :selection="selectedChildAccounts[slotProps.data.idGroup] || []"
            @update:selection="val => selectedChildAccounts[slotProps.data.idGroup] = val">
            <PrimeColumn selectionMode="multiple" style="width: 40px; min-width: 40px; max-width: 40px;" />
            <PrimeColumn field="account_number" style="width: 40%; min-width: 120px;" />
            <PrimeColumn field="bank_code" style="width: 25%; min-width: 80px;" />
            <PrimeColumn headerStyle="width: 60px; text-align: center;" style="width: 15%;">
              <template #body="slotProps2">
                <PrimeButton icon="pi pi-check" class="!p-2 !rounded-full" severity="success" :text="true"
                  @click="() => handleQuickSelectAccount(slotProps2.data as SavedAccount)" />
              </template>
            </PrimeColumn>
            <PrimeColumn headerStyle="width: 60px; text-align: center;" style="width: 15%;">
              <template #body="slotProps2">
                <PrimeButton icon="pi pi-trash" class="!p-2 !rounded-full" severity="danger" :text="true"
                  @click="() => handleDeleteSingleAccount(slotProps2.data as SavedAccount)" />
              </template>
            </PrimeColumn>
          </PrimeDataTable>
        </template>
      </PrimeDataTable>
      <div v-if="!groupedAccountsWithId.length" class="text-center text-gray-400 py-4">
        Không có tài khoản nào được lưu. Hãy thêm tài khoản mới.
      </div>
    </div>
  </PrimeDialog>
</template>
