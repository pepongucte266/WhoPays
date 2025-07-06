<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div id="app-container"
    class="min-h-screen bg-gray-900 text-gray-200 font-sans flex items-center justify-center flex-col w-full">
    <AppHeader />

    <main class="flex-1 flex flex-col w-full min-w-0" style="padding: 0 16px;">
      <RouterView />
      <PrimeConfirmDialog />
      <PrimeToast />
    </main>

    <footer
      class="text-center text-xs md:text-sm text-gray-500 py-2 md:py-4 mt-4 md:mt-8 border-t border-gray-700 w-full">
      VietQR Generator - 2025
    </footer>
  </div>
</template>
