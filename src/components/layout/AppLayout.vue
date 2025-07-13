<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <AppHeader />

      <!-- Page Content -->
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
</script>
