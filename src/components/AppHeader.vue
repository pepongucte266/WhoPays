<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBanksStore } from '@/stores/banks'
import { useSidebarStore } from '@/stores/sidebar'
import Menu from 'primevue/menu'
import MenuIcon from '@/assets/icons/menu.svg?component'
import NotificationIcon from '@/assets/icons/notification.svg?component'
import MoonIcon from '@/assets/icons/moon.svg?component'
import SunIcon from '@/assets/icons/sun.svg?component'
import SystemIcon from '@/assets/icons/system.svg?component'

const authStore = useAuthStore()
const banksStore = useBanksStore()
const sidebarStore = useSidebarStore()

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

const isDark = ref(true) // Default to dark mode
const themeMode = ref<'light' | 'dark' | 'system'>('dark') // Default to dark mode

function setTheme(mode: 'light' | 'dark' | 'system') {
  themeMode.value = mode

  if (mode === 'system') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = systemPrefersDark
  } else {
    isDark.value = mode === 'dark'
  }

  document.documentElement.classList.toggle('my-app-dark', isDark.value)
  localStorage.setItem('theme', mode)
}

import { onUnmounted } from 'vue'

onMounted(() => {
  authStore.initializeAuthListener()
  banksStore.fetchBanks()

  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'dark'
  setTheme(savedTheme)

  // Listen for system theme changes
  if (savedTheme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (themeMode.value === 'system') {
        isDark.value = e.matches
        document.documentElement.classList.toggle('my-app-dark', isDark.value)
      }
    })
  }

  // Close theme dropdown when clicking outside
  document.addEventListener('click', handleDocumentClick)
})

function handleDocumentClick(event: MouseEvent) {
  const themeContainer = document.querySelector('.theme-dropdown-container')
  if (themeContainer && !themeContainer.contains(event.target as Node)) {
    isThemeMenuOpen.value = false
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

const menu = ref()
const isThemeMenuOpen = ref(false)

const getMenuItems = () => [
  {
    label: 'Tùy chọn',
    items: [
      {
        label: 'Đăng xuất',
        icon: 'pi pi-sign-out',
        command: handleLogout
      }
    ]
  }
]

const themeOptions = [
  { label: 'Sáng', value: 'light', icon: 'sun' },
  { label: 'Tối', value: 'dark', icon: 'moon' },
  { label: 'Hệ thống', value: 'system', icon: 'system' }
]

const currentThemeOption = computed(() =>
  themeOptions.find(option => option.value === themeMode.value) || themeOptions[0]
)

const items = ref(getMenuItems())

function toggleMenu(event: Event) {
  menu.value.toggle(event)
}

function toggleThemeMenu() {
  isThemeMenuOpen.value = !isThemeMenuOpen.value
}

function selectTheme(mode: 'light' | 'dark' | 'system') {
  setTheme(mode)
  isThemeMenuOpen.value = false
}

const notificationCount = ref(3) // Example notification count
</script>

<template>
  <header class="header-container" :class="{ 'header-dark': isDark }">
    <div class="header-content">
      <!-- Left side: Menu button -->
      <div class="header-left">
        <button v-if="sidebarStore.isMenuOnly && isLoggedIn" @click="sidebarStore.open" class="menu-button"
          title="Mở rộng sidebar">
          <MenuIcon class="menu-icon" />
        </button>
      </div>

      <!-- Right side: Theme switcher, Notifications, Profile -->
      <div v-if="isLoggedIn" class="header-right">
        <!-- Theme switcher -->
        <div class="theme-dropdown-container">
          <button @click="toggleThemeMenu" class="theme-button" :class="{ 'theme-button-dark': isDark }"
            title="Chọn chủ đề">
            <SunIcon v-if="currentThemeOption.icon === 'sun'" class="theme-icon" />
            <MoonIcon v-else-if="currentThemeOption.icon === 'moon'" class="theme-icon" />
            <SystemIcon v-else class="theme-icon" />
          </button>

          <!-- Theme dropdown menu -->
          <Transition name="theme-dropdown">
            <div v-if="isThemeMenuOpen" class="theme-dropdown" :class="{ 'theme-dropdown-dark': isDark }">
              <div v-for="option in themeOptions" :key="option.value"
                @click="selectTheme(option.value as 'light' | 'dark' | 'system')" class="theme-option" :class="{
                  'theme-option-active': option.value === themeMode,
                  'theme-option-dark': isDark
                }">
                <div class="theme-option-icon">
                  <SunIcon v-if="option.icon === 'sun'" class="option-icon" />
                  <MoonIcon v-else-if="option.icon === 'moon'" class="option-icon" />
                  <SystemIcon v-else class="option-icon" />
                </div>
                <span class="theme-option-label">{{ option.label }}</span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Notifications -->
        <div class="notification-container">
          <button class="notification-button" :class="{ 'notification-button-dark': isDark }">
            <NotificationIcon class="notification-icon" />
            <span v-if="notificationCount > 0" class="notification-badge">
              {{ notificationCount }}
            </span>
          </button>
        </div>

        <!-- Profile -->
        <button @click="toggleMenu" class="profile-button" :class="{ 'profile-button-dark': isDark }"
          aria-haspopup="true" aria-controls="overlay_menu">
          <span class="profile-initial">{{ userInitial }}</span>
        </button>

        <!-- Profile menu -->
        <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-container {
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-dark {
  background-color: #111827;
  border-bottom-color: #374151;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 32px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-button:hover {
  background-color: #f9fafb;
}

.header-dark .menu-button {
  background-color: #1f2937;
  border-color: #374151;
}

.header-dark .menu-button:hover {
  background-color: #374151;
}

.menu-icon {
  height: 24px;
  width: 24px;
  color: #374151;
  transition: transform 0.2s ease;
}

.menu-icon :deep(path) {
  stroke: currentColor;
}

.menu-button:hover .menu-icon {
  transform: scale(1.1);
}

.header-dark .menu-icon {
  color: #d1d5db;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-dropdown-container {
  position: relative;
}

.theme-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  cursor: pointer;
}

.theme-button:hover {
  background-color: #f9fafb;
}

.theme-button-dark {
  background-color: #1f2937;
  border-color: #374151;
}

.theme-button-dark:hover {
  background-color: #374151;
}

.theme-icon {
  height: 24px;
  width: 24px;
  color: #374151;
}

.theme-icon :deep(path) {
  stroke: currentColor;
}

.theme-button-dark .theme-icon {
  color: #d1d5db;
}

.theme-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 180px;
  padding: 8px;
}

.theme-dropdown-dark {
  background-color: #1f2937;
  border-color: #374151;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background-color: #f3f4f6;
}

.theme-option-dark:hover {
  background-color: #374151;
}

.theme-option-active {
  background-color: #f3f4f6;
}

.theme-option-active.theme-option-dark {
  background-color: #374151;
}

.theme-option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.option-icon {
  height: 24px;
  width: 24px;
  color: #374151;
}

.option-icon :deep(path) {
  stroke: currentColor;
}

.theme-option-dark .option-icon {
  color: #d1d5db;
}

.theme-option-label {
  font-size: 14px;
  font-weight: 500;
  color: #000000;
}

.theme-option-dark .theme-option-label {
  color: #ffffff;
}

/* Theme dropdown animations */
.theme-dropdown-enter-active {
  transition: all 0.2s ease;
}

.theme-dropdown-leave-active {
  transition: all 0.2s ease;
}

.theme-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.theme-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.notification-container {
  position: relative;
}

.notification-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.notification-button:hover {
  background-color: #f9fafb;
}

.notification-button-dark {
  background-color: #1f2937;
  border-color: #374151;
}

.notification-button-dark:hover {
  background-color: #374151;
}

.notification-icon {
  height: 24px;
  width: 24px;
  color: #374151;
}

.notification-icon :deep(path) {
  stroke: currentColor;
}

.header-dark .notification-icon {
  color: #d1d5db;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 500;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.profile-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e5e7eb;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.profile-button:hover {
  background-color: #d1d5db;
}

.profile-button-dark {
  background-color: #374151;
}

.profile-button-dark:hover {
  background-color: #4b5563;
}

.profile-initial {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.profile-button-dark .profile-initial {
  color: #d1d5db;
}
</style>
