<script setup lang="ts">
import { ref } from 'vue'
// import { useRouter } from 'vue-router' // Remove unused import
import { useAuthStore } from '@/stores/auth'

// const router = useRouter() // Remove unused variable
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null) // Thêm thông báo thành công
const isLoading = ref(false)

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu và xác nhận mật khẩu không khớp.'
    return
  }

  isLoading.value = true
  errorMessage.value = null
  successMessage.value = null // Reset success message

  const success = await authStore.signUp(email.value, password.value)
  isLoading.value = false

  if (success) {
    // Hiển thị thông báo thành công (Supabase có thể yêu cầu xác nhận email)
    successMessage.value = 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (nếu được yêu cầu) trước khi đăng nhập.'
    // Không tự động chuyển hướng, để người dùng đọc thông báo và xác nhận email nếu cần
    // router.push({ name: 'login' })
  } else {
    errorMessage.value = authStore.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
  }
}
</script>

<template>
  <div class="register-view max-w-md mx-auto mt-10 p-8 bg-gray-800 rounded-lg shadow-lg">
    <h1 class="text-2xl font-semibold mb-6 text-white text-center">Đăng ký tài khoản</h1>
    <form @submit.prevent="handleRegister">
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input type="email" id="email" v-model="email" required
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="nhapemail@example.com" />
      </div>
      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-300 mb-1">Mật khẩu</label>
        <input type="password" id="password" v-model="password" required minlength="6"
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ít nhất 6 ký tự" />
      </div>
      <div class="mb-6">
        <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-1">Xác nhận mật khẩu</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhập lại mật khẩu" />
      </div>

      <div v-if="errorMessage" class="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 text-sm rounded-md">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage"
        class="mb-4 p-3 bg-green-900 border border-green-700 text-green-200 text-sm rounded-md">
        {{ successMessage }}
      </div>

      <button type="submit" :disabled="isLoading"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        {{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}
      </button>
    </form>
    <p class="mt-6 text-center text-sm text-gray-400">
      Đã có tài khoản?
      <router-link to="/login" class="font-medium text-blue-400 hover:text-blue-300">Đăng nhập</router-link>
    </p>
  </div>
</template>
