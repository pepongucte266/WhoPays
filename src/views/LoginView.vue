<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = null
  const success = await authStore.signIn(email.value, password.value)
  isLoading.value = false

  if (success) {
    router.push({ name: 'home' }) // Chuyển đến trang chủ sau khi đăng nhập thành công
  } else {
    errorMessage.value = authStore.error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.'
  }
}
</script>

<template>
  <div class="login-view max-w-md mx-auto mt-10 p-8 bg-gray-800 rounded-lg shadow-lg">
    <h1 class="text-2xl font-semibold mb-6 text-white text-center">Đăng nhập</h1>
    <form @submit.prevent="handleLogin">
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input type="email" id="email" v-model="email" required
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="nhapemail@example.com" />
      </div>
      <div class="mb-6">
        <label for="password" class="block text-sm font-medium text-gray-300 mb-1">Mật khẩu</label>
        <input type="password" id="password" v-model="password" required
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="********" />
      </div>

      <div v-if="errorMessage" class="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 text-sm rounded-md">
        {{ errorMessage }}
      </div>

      <button type="submit" :disabled="isLoading"
        class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        {{ isLoading ? 'Đang xử lý...' : 'Đăng nhập' }}
      </button>
    </form>
    <p class="mt-6 text-center text-sm text-gray-400">
      Chưa có tài khoản?
      <router-link to="/register" class="font-medium text-blue-400 hover:text-blue-300">Đăng ký ngay</router-link>
    </p>
  </div>
</template>
