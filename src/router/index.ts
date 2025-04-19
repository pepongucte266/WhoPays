import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from 'vue-router' // Thêm NavigationGuardNext vào import gốc
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue' // Import LoginView
import RegisterView from '../views/RegisterView.vue' // Import RegisterView
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

    // Đảm bảo authStore đã kiểm tra session ban đầu (quan trọng!)
    // Trong thực tế, bạn có thể cần một cơ chế chờ đợi phức tạp hơn
    // nếu initializeAuthListener chưa chạy xong.
    // Ví dụ: chờ authStore.loading === false sau lần chạy đầu tiên.
    // Ở đây, giả định là trạng thái isLoggedIn đã đáng tin cậy ở mức độ nào đó.

    // Nếu chưa fetch session lần đầu, hãy đợi (cách đơn giản)
    // Điều này có thể cần cải thiện để tránh chặn UI quá lâu
    if (authStore.user === undefined && authStore.loading) {
      // Có thể thêm một vòng lặp chờ hoặc sự kiện
      console.log('Router guard waiting for initial auth check...')
      // Tạm thời cho qua để tránh deadlock, nhưng cần giải pháp tốt hơn
      // await new Promise(resolve => setTimeout(resolve, 100)); // Không nên dùng setTimeout
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
