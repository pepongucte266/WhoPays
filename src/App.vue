<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)

// Initialize auth listener when app starts
onMounted(async () => {
  await authStore.initializeAuthListener()

  // Initialize theme - default to dark mode
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light') {
    document.documentElement.classList.remove('my-app-dark')
  } else {
    // Default to dark mode
    document.documentElement.classList.add('my-app-dark')
    localStorage.setItem('theme', 'dark')
  }
})
</script>

<template>
  <!-- Loading screen while checking auth -->
  <div v-if="authStore.loading && !authStore.initialized" class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-text">Đang kiểm tra trạng thái đăng nhập...</p>
    </div>
  </div>

  <!-- Main app -->
  <div v-else id="app-container" class="flex h-screen"
    :class="isLoggedIn ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white dark:bg-gray-900'">
    <div v-if="isLoggedIn && !sidebarStore.isHidden" class="relative">
      <AppSidebar />
      <!-- Overlay for mobile when sidebar is open -->
      <div v-if="!sidebarStore.isMenuOnly || (sidebarStore.isMenuOnly && !sidebarStore.isHidden)"
        @click="sidebarStore.toMenuOnly"
        class="fixed inset-0 bg-black bg-opacity-50 z-[140] md:hidden transition-opacity duration-300"></div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden transition-all duration-300" :class="{ 'w-full': !isLoggedIn }">
      <AppHeader v-if="isLoggedIn" />
      <main class="flex-1 main-content" :class="isLoggedIn ? 'overflow-x-hidden overflow-y-auto p-4 md:p-8' : 'p-0'">
        <RouterView />
      </main>
      <footer v-if="isLoggedIn" class="theme-bg-secondary theme-text-primary text-center p-2">
        WhoPays © 2025
      </footer>
    </div>

    <!-- Global Components -->
    <PrimeConfirmDialog />
    <PrimeToast />
  </div>
</template>

<style scoped>
.router-link-exact-active {
  background-color: #4a5568;
  /* bg-gray-700 */
}

/* Fix for iPad/iOS viewport height issue */
#app-container {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}

/* Loading Screen Styles */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  height: -webkit-fill-available;
  background-color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #374151;
  border-top: 4px solid #6b26d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #9ca3af;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Light theme support */
@media (prefers-color-scheme: light) {
  .loading-screen {
    background-color: #ffffff;
  }

  .loading-spinner {
    border-color: #e5e7eb;
    border-top-color: #6b26d9;
  }

  .loading-text {
    color: #6b7280;
  }
}
</style>
