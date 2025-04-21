<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBanksStore } from '@/stores/banks' // Import banks store

const authStore = useAuthStore()
const banksStore = useBanksStore() // Initialize banks store
const router = useRouter()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const userEmail = computed(() => authStore.user?.email)

onMounted(() => {
  // Khởi tạo listener để theo dõi trạng thái đăng nhập từ Supabase
  // và lấy session hiện tại khi tải ứng dụng
  authStore.initializeAuthListener()

  // Tải danh sách ngân hàng khi ứng dụng khởi chạy
  banksStore.fetchBanks()
})

async function handleLogout() {
  const success = await authStore.signOut()
  if (success) {
    // Chuyển hướng về trang đăng nhập sau khi đăng xuất thành công
    router.push({ name: 'login' })
  } else {
    // Xử lý lỗi nếu cần (ví dụ: hiển thị thông báo)
    alert('Đăng xuất thất bại: ' + (authStore.error?.message || 'Lỗi không xác định'))
  }
}
</script>

<template>
  <div id="app-container"
    class="min-h-screen bg-gray-900 text-gray-200 font-sans flex items-center justify-center flex-col">
    <header class="bg-gray-800 shadow-md p-2 md:p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
      <h1 class="text-lg md:text-xl font-semibold text-green-400 text-center sm:text-left">VietQR Generator</h1>
      <div v-if="isLoggedIn" class="flex items-center space-x-2 md:space-x-4">
        <span class="text-xs md:text-sm text-gray-300">{{ userEmail }}</span>
        <button @click="handleLogout"
          class="bg-red-500 hover:bg-red-600 text-white text-xs md:text-sm py-1 px-2 md:px-3 rounded transition-colors duration-200">
          Đăng xuất
        </button>
      </div>
    </header>

    <main class="flex-1 flex justify-center">
      <RouterView />
      <PrimeConfirmDialog />
      <PrimeToast />
    </main>

    <footer
      class="text-center text-xs md:text-sm text-gray-500 py-2 md:py-4 mt-4 md:mt-8 border-t border-gray-700 w-full">
      VietQR Generator - 2025
    </footer>
  </div>
</template>
