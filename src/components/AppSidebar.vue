<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import LogoIcon from '@/assets/icons/logo.svg?component'
import DashboardIcon from '@/assets/icons/dashboard.svg?component'
import EmployeesIcon from '@/assets/icons/employees.svg?component'
import DepartmentsIcon from '@/assets/icons/departments.svg?component'
import CreateQrIcon from '@/assets/icons/create-qr.svg?component'
import CalendarIcon from '@/assets/icons/calendar.svg?component'
import AnalyticsIcon from '@/assets/icons/analytics.svg?component'
import SettingsIcon from '@/assets/icons/settings.svg?component'
import XIcon from '@/assets/icons/x.svg?component'

const sidebarStore = useSidebarStore()

// Screen size tracking
const isMobile = ref(false)

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// Computed properties for easier access
const isMenuOnly = computed(() => sidebarStore.isMenuOnly)
const isHidden = computed(() => sidebarStore.isHidden)

// Handle click X button - immediate state change
const handleCollapseClick = () => {
  sidebarStore.toMenuOnly()
}
</script>

<template>
  <aside v-show="!isHidden"
    class="fixed left-0 top-0 flex h-screen flex-col overflow-y-auto bg-[#101014] shadow-lg transition-all duration-300 ease-in-out lg:relative lg:translate-x-0"
    :class="{
      'w-[260px] translate-x-0 px-6 py-8 rounded-r-[24px] lg:rounded-[24px] z-50': !isMenuOnly,
      'w-[80px] translate-x-0 px-2 py-8 rounded-r-[24px] lg:rounded-[24px] z-50': isMenuOnly && !isMobile,
      'w-[260px] translate-x-0 px-6 py-8 rounded-none z-[150]': isMenuOnly && isMobile
    }">
    <!-- Header section -->
    <div class="flex items-center mb-8" :class="(isMenuOnly && !isMobile) ? 'justify-center' : 'justify-between'">
      <div class="flex items-center gap-3" :class="(isMenuOnly && !isMobile) ? 'justify-center' : ''">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#23294A] logo-container">
          <LogoIcon class="h-7 w-7 text-white" />
        </div>
        <div v-if="!isMenuOnly || isMobile" class="flex flex-col">
          <span class="text-xs font-medium text-[#A3AED0]">VTBon System</span>
        </div>
      </div>
      <button v-if="!isMenuOnly || isMobile" @click="handleCollapseClick"
        class="flex items-center justify-center w-8 h-8 rounded-lg bg-[#23294A] hover:bg-[#353968] transition-colors duration-200 group cursor-pointer"
        title="Thu gọn sidebar">
        <XIcon class="h-5 w-5 text-[#A3AED0] group-hover:text-[#F4F7FE] transition-colors duration-200" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-2">
      <RouterLink to="/dashboard"
        class="flex items-center rounded-lg transition-all duration-200 hover:bg-[#23294A] hover:text-[#F4F7FE] router-link-exact-active:bg-[#353968] router-link-exact-active:text-[#F4F7FE] cursor-pointer relative group"
        :class="(isMenuOnly && !isMobile) ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'"
        :title="(isMenuOnly && !isMobile) ? 'Dashboard' : ''">
        <DashboardIcon class="h-6 w-6 text-[#A3AED0] flex-shrink-0" />
        <span v-if="!isMenuOnly || isMobile" class="font-medium text-base text-[#A3AED0]">Dashboard</span>
        <!-- Tooltip for collapsed state -->
        <span v-if="isMenuOnly && !isMobile"
          class="absolute left-16 top-1/2 transform -translate-y-1/2 bg-[#23294A] text-[#F4F7FE] px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          Dashboard
        </span>
      </RouterLink>

      <RouterLink to="/employee-management"
        class="flex items-center rounded-lg transition-all duration-200 hover:bg-[#23294A] hover:text-[#F4F7FE] router-link-exact-active:bg-[#353968] router-link-exact-active:text-[#F4F7FE] cursor-pointer relative group"
        :class="(isMenuOnly && !isMobile) ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'"
        :title="(isMenuOnly && !isMobile) ? 'Employees' : ''">
        <EmployeesIcon class="h-6 w-6 text-[#A3AED0] flex-shrink-0" />
        <span v-if="!isMenuOnly || isMobile" class="font-medium text-base text-[#A3AED0]">Employees</span>
        <!-- Tooltip for collapsed state -->
        <span v-if="isMenuOnly && !isMobile"
          class="absolute left-16 top-1/2 transform -translate-y-1/2 bg-[#23294A] text-[#F4F7FE] px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          Employees
        </span>
      </RouterLink>

      <RouterLink to="/departments"
        class="flex items-center rounded-lg transition-all duration-200 hover:bg-[#23294A] hover:text-[#F4F7FE] router-link-exact-active:bg-[#353968] router-link-exact-active:text-[#F4F7FE] cursor-pointer relative group"
        :class="(isMenuOnly && !isMobile) ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'"
        :title="(isMenuOnly && !isMobile) ? 'Departments' : ''">
        <DepartmentsIcon class="h-6 w-6 text-[#A3AED0] flex-shrink-0" />
        <span v-if="!isMenuOnly || isMobile" class="font-medium text-base text-[#A3AED0]">Departments</span>
        <!-- Tooltip for collapsed state -->
        <span v-if="isMenuOnly && !isMobile"
          class="absolute left-16 top-1/2 transform -translate-y-1/2 bg-[#23294A] text-[#F4F7FE] px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          Departments
        </span>
      </RouterLink>

      <RouterLink to="/"
        class="flex items-center rounded-lg transition-all duration-200 hover:bg-[#23294A] hover:text-[#F4F7FE] router-link-exact-active:bg-[#353968] router-link-exact-active:text-[#F4F7FE] cursor-pointer relative group"
        :class="(isMenuOnly && !isMobile) ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'"
        :title="(isMenuOnly && !isMobile) ? 'Create QR' : ''">
        <CreateQrIcon class="h-6 w-6 text-[#A3AED0] flex-shrink-0" />
        <span v-if="!isMenuOnly || isMobile" class="font-medium text-base text-[#A3AED0]">Create QR</span>
        <!-- Tooltip for collapsed state -->
        <span v-if="isMenuOnly && !isMobile"
          class="absolute left-16 top-1/2 transform -translate-y-1/2 bg-[#23294A] text-[#F4F7FE] px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          Create QR
        </span>
      </RouterLink>

      <RouterLink to="/calendar"
        class="flex items-center rounded-lg transition-all duration-200 hover:bg-[#23294A] hover:text-[#F4F7FE] router-link-exact-active:bg-[#353968] router-link-exact-active:text-[#F4F7FE] cursor-pointer relative group"
        :class="(isMenuOnly && !isMobile) ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'"
        :title="(isMenuOnly && !isMobile) ? 'Calendar' : ''">
        <CalendarIcon class="h-6 w-6 text-[#A3AED0] flex-shrink-0" />
        <span v-if="!isMenuOnly || isMobile" class="font-medium text-base text-[#A3AED0]">Calendar</span>
        <!-- Tooltip for collapsed state -->
        <span v-if="isMenuOnly && !isMobile"
          class="absolute left-16 top-1/2 transform -translate-y-1/2 bg-[#23294A] text-[#F4F7FE] px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          Calendar
        </span>
      </RouterLink>

      <RouterLink to="/analytics"
        class="flex items-center rounded-lg transition-all duration-200 hover:bg-[#23294A] hover:text-[#F4F7FE] router-link-exact-active:bg-[#353968] router-link-exact-active:text-[#F4F7FE] cursor-pointer relative group"
        :class="(isMenuOnly && !isMobile) ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'"
        :title="(isMenuOnly && !isMobile) ? 'Analytics' : ''">
        <AnalyticsIcon class="h-6 w-6 text-[#A3AED0] flex-shrink-0" />
        <span v-if="!isMenuOnly || isMobile" class="font-medium text-base text-[#A3AED0]">Analytics</span>
        <!-- Tooltip for collapsed state -->
        <span v-if="isMenuOnly && !isMobile"
          class="absolute left-16 top-1/2 transform -translate-y-1/2 bg-[#23294A] text-[#F4F7FE] px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          Analytics
        </span>
      </RouterLink>

      <RouterLink to="/settings"
        class="flex items-center rounded-lg transition-all duration-200 hover:bg-[#23294A] hover:text-[#F4F7FE] router-link-exact-active:bg-[#353968] router-link-exact-active:text-[#F4F7FE] cursor-pointer relative group"
        :class="(isMenuOnly && !isMobile) ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'"
        :title="(isMenuOnly && !isMobile) ? 'Settings' : ''">
        <SettingsIcon class="h-6 w-6 text-[#A3AED0] flex-shrink-0" />
        <span v-if="!isMenuOnly || isMobile" class="font-medium text-base text-[#A3AED0]">Settings</span>
        <!-- Tooltip for collapsed state -->
        <span v-if="isMenuOnly && !isMobile"
          class="absolute left-16 top-1/2 transform -translate-y-1/2 bg-[#23294A] text-[#F4F7FE] px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          Settings
        </span>
      </RouterLink>
    </nav>

    <!-- User Profile Section -->
    <div class="mt-8">
      <div v-if="!isMenuOnly || isMobile"
        class="flex items-center gap-3 rounded-xl bg-[#27272A]/50 border border-[#27272A] p-3">
        <div class="flex-shrink-0">
          <img class="h-8 w-8 rounded-full object-cover" src="@/assets/icons/user-avatar.png" alt="John Doe avatar" />
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-sm font-medium text-[#F2F2F2] truncate">John Doe</span>
          <span class="text-xs font-normal text-[#F2F2F2]/60 truncate">HR Manager</span>
        </div>
        <div class="flex-shrink-0 rounded-full bg-[#F3F4F6] px-3 py-1">
          <span class="text-xs font-semibold text-[#111827]">Admin</span>
        </div>
      </div>
      <!-- Menu-only user profile - only avatar with tooltip -->
      <div v-else class="flex justify-center relative group">
        <img
          class="h-8 w-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-[#353968] transition-all duration-200"
          src="@/assets/icons/user-avatar.png" alt="John Doe avatar" />
        <!-- User profile tooltip -->
        <div
          class="absolute left-16 top-1/2 transform -translate-y-1/2 bg-[#23294A] px-3 py-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
          <div class="text-sm font-semibold text-white">John Doe</div>
          <div class="text-xs text-[#A3AED0]">HR Manager</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.router-link-exact-active {
  background-color: #353968 !important;
  color: #F4F7FE !important;
  text-decoration: none !important;
}

.router-link-exact-active :is(svg, path) {
  stroke: #F4F7FE !important;
  color: #F4F7FE !important;
}

nav a {
  text-decoration: none !important;
}

/* Custom sidebar animations */
aside {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Smooth hover effects */
nav a:hover {
  transform: translateX(2px);
}

nav a {
  cursor: pointer;
}

/* Logo pulse animation */
@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.logo-container:hover svg {
  animation: pulse 1s infinite;
}

/* Icon transitions */
nav a svg {
  transition: transform 0.2s ease-in-out;
}

nav a:hover svg {
  transform: scale(1.1);
}

/* Tooltip styles */
.group:hover .opacity-0 {
  opacity: 1;
}

/* Responsive behavior */
@media (max-width: 1024px) {
  aside {
    position: fixed;
    z-index: 50;
  }
}

/* Mobile sidebar z-index override */
@media (max-width: 768px) {
  aside {
    z-index: 150 !important;
  }
}
</style>
