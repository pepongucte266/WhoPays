<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.user) {
    router.push({ name: 'home' })
  }
})

watch(
  () => authStore.user,
  (user) => {
    if (user) {
      router.push({ name: 'home' })
    }
  }
)

const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)
const checked1 = ref(false)

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
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-20">
    <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow rounded-border w-full lg:w-6/12 mx-auto">
      <div class="text-center mb-8">
        <span class="text-surface-600 dark:text-surface-200 font-medium leading-normal">Don't have an account?</span>
        <router-link to="/register" class="font-medium no-underline ml-2 text-primary cursor-pointer">Create
          today!</router-link>
      </div>

      <form @submit.prevent="handleLogin">
        <label for="email1" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">Email</label>
        <PrimeInputText id="email1" type="text" placeholder="Email address" class="w-full mb-4" v-model="email"
          autocomplete="username" />

        <label for="password1" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">Password</label>
        <PrimeInputText id="password1" type="password" placeholder="Password" class="w-full mb-4" v-model="password"
          autocomplete="current-password" />

        <div class="flex items-center justify-between mb-12">
          <div class="flex items-center">
            <PrimeCheckbox id="rememberme1" v-model="checked1" :binary="true" class="mr-2" />
            <label for="rememberme1">Remember me</label>
          </div>
          <a class="font-medium no-underline ml-2 text-primary text-right cursor-pointer">Forgot password?</a>
        </div>

        <div v-if="errorMessage" class="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 text-sm rounded-md">
          {{ errorMessage }}
        </div>

        <PrimeButton label="Sign In" icon="pi pi-user !text-xl !leading-none" class="w-full" type="submit"
          :disabled="isLoading">
          <template #icon>
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
          </template>
          <template #default>
            {{ isLoading ? 'Đang xử lý...' : 'Đăng nhập' }}
          </template>
        </PrimeButton>
      </form>
    </div>
  </div>
</template>
