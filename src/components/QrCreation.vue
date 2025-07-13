<template>
  <div class="qr-creation-container">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title view-title">Create QR Codes</h1>
      <p class="page-description view-text">
        Generate QR codes for employees from Excel import or employee selection
      </p>

      <!-- Mode Selection Tabs -->
      <div class="mode-tabs">
        <button @click="activeMode = 'excel'" :class="['tab-button', { 'tab-active': activeMode === 'excel' }]">
          <div class="tab-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <!-- Excel file document with rounded corners -->
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
              <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                fill="none" />
              <!-- Text lines with rounded caps -->
              <line x1="8" y1="13" x2="10" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <line x1="14" y1="13" x2="16" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <line x1="8" y1="17" x2="10" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <line x1="14" y1="17" x2="16" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          Import from Excel
        </button>

        <button @click="activeMode = 'select'" :class="['tab-button', { 'tab-active': activeMode === 'select' }]">
          <div class="tab-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <!-- Main person with rounded strokes -->
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
              <!-- Body/torso area with smooth curves -->
              <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" fill="none" />
              <!-- Additional person indicators with smooth curves -->
              <path d="M19 8.35a2.5 2.5 0 0 1 0-1.7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M19 15.65a6 6 0 0 0-3-5.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          Select Employees
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-area theme-bg-primary theme-border">
      <!-- Excel Import Mode -->
      <ExcelImportTab v-if="activeMode === 'excel'" />

      <!-- Employee Selection Mode -->
      <EmployeeSelectionTab v-if="activeMode === 'select'" @back="handleEmployeeSelectionBack"
        @switch-to-excel="handleSwitchToExcel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ExcelImportTab from '@/components/tabs/ExcelImportTab.vue'
import EmployeeSelectionTab from '@/components/tabs/EmployeeSelectionTab.vue'

const activeMode = ref<'excel' | 'select'>('excel')

// Event handlers
const handleEmployeeSelectionBack = () => {
  activeMode.value = 'excel'
}

const handleSwitchToExcel = () => {
  activeMode.value = 'excel'
}
</script>

<style scoped>
.qr-creation-container {
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1.2;
  /* Color handled by view-title class */
}

.page-description {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 32px;
  /* Color handled by view-text class */
}

.mode-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background-color: var(--app-bg-secondary);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  width: fit-content;
  transition: all 0.2s ease;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 12px;
  border-radius: 10px;
  border: none;
  background-color: transparent;
  color: var(--app-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.tab-button:hover {
  background-color: rgba(107, 38, 217, 0.1);
}

.tab-active {
  background-color: #6b26d9 !important;
  color: #fafafa !important;
}

.tab-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-area {
  border-radius: 12px;
  box-shadow: 0 1px 2px var(--app-shadow);
  overflow: hidden;
  /* Background and border handled by theme classes */
}
</style>
