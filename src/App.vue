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
  <div id="app-container" class="min-h-screen bg-gray-900 text-gray-200 font-sans">
    <header class="bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <h1 class="text-xl font-semibold text-green-400">VietQR Generator</h1>
      <div v-if="isLoggedIn" class="flex items-center space-x-4">
        <span class="text-sm text-gray-300">{{ userEmail }}</span>
        <button @click="handleLogout"
          class="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded transition-colors duration-200">
          Đăng xuất
        </button>
      </div>
      <div v-else>
        <!-- Có thể thêm nút Đăng nhập/Đăng ký ở đây nếu muốn -->
        <!-- <router-link to="/login" class="text-blue-400 hover:text-blue-300 mr-4">Đăng nhập</router-link>
         <router-link to="/register" class="text-blue-400 hover:text-blue-300">Đăng ký</router-link> -->
      </div>
    </header>

    <main class="p-4 md:p-8">
      <RouterView />
    </main>

    <footer class="text-center text-xs text-gray-500 py-4 mt-8 border-t border-gray-700">
      <!-- Footer content if needed -->
      VietQR Generator - 2025
    </footer>
  </div>
</template>
