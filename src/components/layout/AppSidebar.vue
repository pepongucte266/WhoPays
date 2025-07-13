<template>
  <aside class="w-64 bg-gray-900 dark:bg-gray-950 border-r border-gray-700 flex flex-col h-screen">
    <!-- Logo Section -->
    <div class="p-6 border-b border-gray-700">
      <div class="flex items-center gap-3">
        <div class="bg-purple-600 p-1 rounded-xl">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-100">EmployeePro</h2>
          <p class="text-xs text-gray-400">Management System</p>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 p-4">
      <ul class="space-y-1">
        <SidebarItem icon="dashboard" label="Dashboard" />
        <SidebarItem icon="employees" label="Employees" />
        <SidebarItem icon="departments" label="Departments" />
        <SidebarItem icon="qr" label="Create QR" :active="true" />
        <SidebarItem icon="calendar" label="Calendar" />
        <SidebarItem icon="analytics" label="Analytics" />
        <SidebarItem icon="settings" label="Settings" />
      </ul>
    </nav>

    <!-- User Profile -->
    <div class="p-4 border-t border-gray-700">
      <div class="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
        <img src="/api/placeholder/32/32" alt="User" class="w-8 h-8 rounded-full">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-100 truncate">John Doe</p>
          <p class="text-xs text-gray-400 truncate">HR Manager</p>
        </div>
        <span class="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-100 rounded-full">
          Admin
        </span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import SidebarItem from './SidebarItem.vue'
</script>
