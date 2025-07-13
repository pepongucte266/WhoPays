import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from 'vue-router' // Thêm NavigationGuardNext vào import gốc
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue' // Import LoginView
import RegisterView from '../views/RegisterView.vue' // Import RegisterView
import EmployeeManagementView from '@/views/EmployeeManagementView.vue'
import { useAuthStore } from '@/stores/auth' // Import auth store

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }, // Đánh dấu route này cần đăng nhập
    },
    {
      path: '/employee-management',
      name: 'employee-management',
      component: EmployeeManagementView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login', // Route đăng nhập
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }, // Chỉ cho phép truy cập khi chưa đăng nhập
    },
    {
      path: '/register', // Route đăng ký
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true }, // Chỉ cho phép truy cập khi chưa đăng nhập
    },
    {
      path: '/about', // Giữ lại route about nếu cần
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

// Navigation Guard
router.beforeEach(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore()

    // Wait for auth initialization to complete
    if (!authStore.initialized && authStore.loading) {
      console.log('Router guard waiting for auth initialization...')

      // Wait for auth to be initialized (max 5 seconds to prevent infinite loading)
      let attempts = 0
      while (!authStore.initialized && authStore.loading && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        attempts++
      }
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

    console.log(
      `Navigating to: ${to.path}, requiresAuth: ${requiresAuth}, requiresGuest: ${requiresGuest}, isLoggedIn: ${authStore.isLoggedIn}`,
    )

    if (requiresAuth && !authStore.isLoggedIn) {
      // Nếu route yêu cầu đăng nhập và user chưa đăng nhập -> chuyển về login
      console.log('Redirecting to /login (requires auth, not logged in)')
      next({ name: 'login' })
    } else if (requiresGuest && authStore.isLoggedIn) {
      // Nếu route yêu cầu là khách (login/register) và user đã đăng nhập -> chuyển về home
      console.log('Redirecting to / (requires guest, logged in)')
      next({ name: 'home' })
    } else {
      // Các trường hợp khác (route công khai, hoặc đã thỏa mãn điều kiện) -> cho phép đi tiếp
      next()
    }
  },
)

export default router
