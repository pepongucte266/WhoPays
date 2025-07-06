<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBanksStore } from '@/stores/banks'
import Menu from 'primevue/menu'

const authStore = useAuthStore()
const banksStore = useBanksStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const userEmail = computed(() => authStore.user?.email)
const userInitial = computed(() => userEmail.value ? userEmail.value.charAt(0).toUpperCase() : '')

async function handleLogout() {
  const success = await authStore.signOut()
  if (success) {
    window.location.href = '/login'
  } else {
    alert('Đăng xuất thất bại: ' + (authStore.error?.message || 'Lỗi không xác định'))
  }
}

const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('my-app-dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  authStore.initializeAuthListener()
  banksStore.fetchBanks()
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('my-app-dark')
  }
})

const menu = ref()
const getMenuItems = () => [
  {
    label: 'Tùy chọn',
    items: [
      {
        label: 'Chuyển theme',
        icon: isDark.value ? 'pi pi-sun' : 'pi pi-moon',
        command: toggleTheme
      },
      {
        label: 'Đăng xuất',
        icon: 'pi pi-sign-out',
        command: handleLogout
      }
    ]
  }
]
const items = ref(getMenuItems())

function toggleMenu(event: Event) {
  menu.value.toggle(event)
}

watch(isDark, () => {
  items.value = getMenuItems()
})
</script>

<template>
  <header class="flex justify-between items-center w-full" style="padding: 16px;">
    <div></div>
    <div v-if="isLoggedIn" class="flex items-center space-x-2 md:space-x-4">
      <PrimeButton type="button" rounded
        class="!p-2 !w-9 !h-9 flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-colors"
        :label="userInitial" icon="" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu" />
      <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
    </div>
  </header>
</template>
