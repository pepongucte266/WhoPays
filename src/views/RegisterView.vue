<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LogoIcon from '@/assets/icons/logo-main.svg?component'
import EyeOffIcon from '@/assets/icons/eye-off.svg?component'
import UserLoginIcon from '@/assets/icons/user-login.svg?component'
import GoogleIcon from '@/assets/icons/google-icon.svg?component'
import GithubIcon from '@/assets/icons/github-icon.svg?component'
import SunIcon from '@/assets/icons/sun.svg?component'
import MoonIcon from '@/assets/icons/moon.svg?component'

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu và xác nhận mật khẩu không khớp.'
    return
  }

  isLoading.value = true
  errorMessage.value = null
  successMessage.value = null

  const success = await authStore.signUp(email.value, password.value)
  isLoading.value = false

  if (success) {
    successMessage.value = 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (nếu được yêu cầu) trước khi đăng nhập.'
  } else {
    errorMessage.value = authStore.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function toggleConfirmPasswordVisibility() {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Theme management
const isDark = ref(true) // Default to dark mode

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('my-app-dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('my-app-dark')
  } else {
    // Default to dark mode
    isDark.value = true
    document.documentElement.classList.add('my-app-dark')
    localStorage.setItem('theme', 'dark')
  }
})
</script>

<template>
  <div class="register-container" :class="{ 'dark-theme': isDark }">
    <!-- Theme Switch Button -->
    <button @click="toggleTheme" class="theme-switch-btn">
      <SunIcon v-if="!isDark" class="w-6 h-6" />
      <MoonIcon v-else class="w-6 h-6" />
    </button>

    <!-- Main Content -->
    <div class="register-content">
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <LogoIcon class="logo-icon" />
        </div>
        <h1 class="brand-title">EmployeePro</h1>
        <p class="brand-subtitle">Hệ thống quản lý nhân sự</p>
      </div>

      <!-- Register Form -->
      <div class="register-form-card">
        <div class="form-header">
          <h2 class="form-title">Đăng ký tài khoản</h2>
          <p class="form-subtitle">Tạo tài khoản mới để truy cập hệ thống</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input id="email" v-model="email" type="email" placeholder="nhapemail@example.com" class="form-input"
              required autocomplete="username" />
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Mật khẩu</label>
            <div class="password-input-wrapper">
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                placeholder="Ít nhất 6 ký tự" class="form-input password-input" required minlength="6"
                autocomplete="new-password" />
              <button type="button" @click="togglePasswordVisibility" class="password-toggle-btn">
                <EyeOffIcon class="eye-icon" />
              </button>
            </div>
          </div>

          <!-- Confirm Password Field -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
            <div class="password-input-wrapper">
              <input id="confirmPassword" v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Nhập lại mật khẩu" class="form-input password-input" required
                autocomplete="new-password" />
              <button type="button" @click="toggleConfirmPasswordVisibility" class="password-toggle-btn">
                <EyeOffIcon class="eye-icon" />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <!-- Register Button -->
          <button type="submit" :disabled="isLoading" class="register-btn">
            <UserLoginIcon class="btn-icon" />
            <span>{{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}</span>
          </button>

          <!-- Divider -->
          <div class="divider">
            <span class="divider-text">Hoặc tiếp tục với</span>
          </div>

          <!-- Social Login -->
          <div class="social-login">
            <button type="button" class="social-btn google-btn">
              <GoogleIcon class="social-icon" />
              <span>Google</span>
            </button>
            <button type="button" class="social-btn github-btn">
              <GithubIcon class="social-icon" />
              <span>GitHub</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          Đã có tài khoản?
          <router-link to="/login" class="footer-link">Đăng nhập</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
  transition: all 0.3s ease;
}

.register-container.dark-theme {
  background: linear-gradient(135deg, #09090b 0%, #27272a 100%);
}

.theme-switch-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-switch-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

.dark-theme .theme-switch-btn {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.dark-theme .theme-switch-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.register-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 420px;
  width: 100%;
}

/* Logo Section */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-wrapper {
  background: #6b26d9;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: #fafafa;
}

.brand-title {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 30px;
  line-height: 1.2;
  color: #000000;
  margin: 0;
}

.dark-theme .brand-title {
  color: #ffffff;
}

.brand-subtitle {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: #6b7280;
  margin: 0;
}

.dark-theme .brand-subtitle {
  color: #a1a1aa;
}

/* Register Form Card */
.register-form-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark-theme .register-form-card {
  background: #09090b;
  border-color: #27272a;
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.form-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 1.33;
  letter-spacing: -0.025em;
  color: #000000;
  margin: 0 0 4px 0;
}

.dark-theme .form-title {
  color: #ffffff;
}

.form-subtitle {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.43;
  color: #6b7280;
  margin: 0;
}

.dark-theme .form-subtitle {
  color: #a1a1aa;
}

/* Form */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  color: #000000;
}

.dark-theme .form-label {
  color: #ffffff;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.21;
  color: #000000;
  background: #ffffff;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: #999999;
}

.form-input:focus {
  outline: none;
  border-color: #6b26d9;
  box-shadow: 0 0 0 3px rgba(107, 38, 217, 0.1);
}

.dark-theme .form-input {
  background: #09090b;
  border-color: #27272a;
  color: #ffffff;
}

.dark-theme .form-input::placeholder {
  color: #999999;
}

.dark-theme .form-input:focus {
  border-color: #6b26d9;
}

.password-input-wrapper {
  position: relative;
}

.password-input {
  padding-right: 48px;
}

.password-toggle-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.password-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark-theme .password-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.eye-icon {
  width: 20px;
  height: 20px;
  color: #a1a1aa;
}

.error-message {
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #f87171;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
}

.dark-theme .error-message {
  background: #450a0a;
  border-color: #dc2626;
  color: #fca5a5;
}

.success-message {
  padding: 12px;
  background: #dcfce7;
  border: 1px solid #22c55e;
  border-radius: 8px;
  color: #166534;
  font-size: 14px;
  font-weight: 500;
}

.dark-theme .success-message {
  background: #052e16;
  border-color: #22c55e;
  color: #86efac;
}

/* Register Button */
.register-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  padding: 12px 24px;
  background: #6b26d9;
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.43;
  cursor: pointer;
  transition: all 0.3s ease;
}

.register-btn:hover {
  background: #5b21b6;
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  width: 24px;
  height: 24px;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
}

.divider-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.33;
  text-transform: uppercase;
  color: #6b7280;
  padding: 0 8px;
}

.dark-theme .divider-text {
  color: #a1a1aa;
}

/* Social Login */
.social-login {
  display: flex;
  gap: 16px;
}

.social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #000000;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.43;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: #f9fafb;
}

.dark-theme .social-btn {
  background: #09090b;
  border-color: #27272a;
  color: #ffffff;
}

.dark-theme .social-btn:hover {
  background: #18181b;
}

.social-icon {
  width: 16px;
  height: 16px;
}

/* Footer */
.footer {
  text-align: center;
}

.footer-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.43;
  color: #6b7280;
  margin: 0;
}

.dark-theme .footer-text {
  color: #a1a1aa;
}

.footer-link {
  color: #6b26d9;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: #5b21b6;
  text-decoration: underline;
}

.dark-theme .footer-link {
  color: #a855f7;
}

.dark-theme .footer-link:hover {
  color: #9333ea;
}

/* Responsive */
@media (max-width: 768px) {
  .register-container {
    padding: 12px;
  }

  .register-content {
    max-width: 100%;
    gap: 20px;
  }

  .register-form-card {
    padding: 20px;
  }

  .social-login {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
