<template>
  <header
    class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-end px-8">
    <div class="flex items-center gap-4">
      <!-- Search -->
      <button
        class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <!-- Notifications -->
      <div class="relative">
        <button
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-5-5V9.126c0-1.05-.45-2.051-1.244-2.769C13.022 5.687 12.041 5.25 11 5.25S8.978 5.687 8.244 6.357C7.45 7.075 7 8.076 7 9.126V12l-5 5h5m8 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <!-- Notification badge -->
        <span
          class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          3
        </span>
      </div>

      <!-- User Avatar -->
      <img src="/api/placeholder/32/32" alt="User" class="w-8 h-8 rounded-full">
    </div>
  </header>
</template>

<script setup lang="ts">
</script>
