<script setup lang="ts">
import { computed } from 'vue'
import { useQrStore } from '@/stores/qr'
import { useBanksStore } from '@/stores/banks'
import { getBankLogoUrl } from '@/utils/vietqr'

const qrStore = useQrStore()
const banksStore = useBanksStore()

const props = defineProps<{
  qrDataUrl: string | null | undefined
  accountNumber: string | undefined
  amount: number | undefined
  purpose?: string | undefined
  downloadHandler?: () => void
  recordId?: number
  bankBin?: string
  bankName?: string
  userBankName?: string
  imgId?: string
  showNav?: boolean
  canPrev?: boolean
  canNext?: boolean
}>()

const displayAmount = computed(() => {
  if (props.amount === undefined || props.amount === null) return 'Not fixed'
  return `${props.amount.toLocaleString('vi-VN')} ₫`
})

const displayPurpose = computed(() => props.purpose || 'No description')

// Get bank name from bankBin
const displayBankName = computed(() => {
  if (props.bankBin) {
    const bank = banksStore.getBankByBin(props.bankBin)
    return bank?.bankShortName || bank?.bankName || 'Unknown Bank'
  }
  return props.bankName || 'Unknown Bank'
})

// Get bank logo URL
const logoUrl = computed(() => {
  if (props.imgId) return getBankLogoUrl(props.imgId)
  if (props.bankBin) {
    const bank = banksStore.getBankByBin(props.bankBin)
    if (bank?.imageId) return getBankLogoUrl(bank.imageId)
  }
  return null
})

// Sửa lại điều kiện: chỉ cần có qrDataUrl là cho phép tải
const canDownload = computed(() => !!props.qrDataUrl)

const handlePrev = () => qrStore.prevQr()
const handleNext = () => qrStore.nextQr()

function handleDownload() {
  if (props.downloadHandler) {
    props.downloadHandler()
  } else if (props.recordId !== undefined) {
    qrStore.downloadExcelQr(props.recordId)
  } else {
    qrStore.downloadSingleQr()
  }
}
</script>

<template>
  <div v-if="qrDataUrl" class="qr-popup-container">
    <!-- Counter (only show when multiple QRs) -->
    <div v-if="showNav" class="qr-counter-section">
      <span class="qr-counter">{{ qrStore.currentQrIndex + 1 }} of {{ qrStore.totalQrCount }}</span>
    </div>

    <!-- Content -->
    <div class="qr-content">
      <!-- Bank Info Header -->
      <div class="bank-info-header">
        <!-- Bank logo at top -->
        <div class="bank-logo-section">
          <img v-if="logoUrl" :src="logoUrl" alt="Logo ngân hàng" class="bank-logo" />
          <span v-else class="bank-name-fallback">{{ displayBankName }}</span>
        </div>

        <!-- User name -->
        <div class="bank-name-section">
          <div class="user-name">{{ userBankName || 'N/A' }}</div>
        </div>

        <!-- Account number -->
        <div class="account-info">
          <div class="account-number">{{ accountNumber || 'N/A' }}</div>
        </div>
      </div>

      <!-- QR Code Section -->
      <div class="qr-code-section">
        <div class="qr-code-container">
          <div class="qr-code-inner">
            <!-- QR Code Image -->
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="VietQR Code" class="qr-code-image" />

            <!-- QR Code Icon/SVG (fallback when no image) -->
            <div v-else class="qr-icon">
              <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
                <rect x="2.88" y="2.88" width="4.79" height="4.79" stroke="currentColor" stroke-width="2" />
                <rect x="15.33" y="2.88" width="4.79" height="4.79" stroke="currentColor" stroke-width="2" />
                <rect x="2.88" y="15.33" width="4.79" height="4.79" stroke="currentColor" stroke-width="2" />
                <rect x="15.33" y="15.33" width="4.79" height="4.79" stroke="currentColor" stroke-width="2" />
                <rect x="6.71" y="6.71" width="4.79" height="4.79" stroke="currentColor" stroke-width="2" />
                <line x1="2.88" y1="11.5" x2="2.89" y2="11.5" stroke="currentColor" stroke-width="2" />
                <line x1="11.5" y1="2.88" x2="11.51" y2="2.88" stroke="currentColor" stroke-width="2" />
                <line x1="15.33" y1="11.5" x2="16.29" y2="11.5" stroke="currentColor" stroke-width="2" />
                <line x1="11.5" y1="19.17" x2="11.5" y2="20.13" stroke="currentColor" stroke-width="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Amount and Description -->
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Amount:</span>
          <span class="info-value amount" :class="{ 'amount-empty': !props.amount || props.amount <= 0 }">
            {{ props.amount && props.amount > 0 ? displayAmount : 'Not fixed' }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Description:</span>
          <span class="info-value description"
            :class="{ 'description-empty': !props.purpose || props.purpose.trim().length === 0 }">
            {{ props.purpose && props.purpose.trim().length > 0 ? displayPurpose : 'No description' }}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <!-- Download Button -->
        <button v-if="canDownload" @click="handleDownload" class="action-btn download-btn" title="Tải xuống mã QR">
          <div class="btn-icon">
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
              <path d="M2.88 14.38H20.13V20.13H2.88V14.38Z" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6.71 9.58L11.5 14.38L16.29 9.58" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <line x1="11.5" y1="2.88" x2="11.5" y2="14.38" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" />
            </svg>
          </div>
          <span>Download</span>
        </button>

        <!-- Navigation Buttons -->
        <div v-if="showNav" class="nav-buttons">
          <button @click="handlePrev" :disabled="!canPrev" class="nav-btn prev-btn">
            <span>Previous</span>
          </button>
          <button @click="handleNext" :disabled="!canNext" class="nav-btn next-btn">
            <span>Next</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Placeholder when no QR -->
  <div v-else class="qr-placeholder">
    <p>Nhập thông tin và nhấn "Tạo QR" để hiển thị mã tại đây.</p>
  </div>
</template>

<style scoped>
/* Base QR Popup Container - Using PrimeVue CSS Variables */
.qr-popup-container {
  position: relative;
  background: var(--p-dialog-background, #FFFFFF);
  border-radius: 12px;
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
}

/* Counter Section */
.qr-counter-section {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.qr-counter {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.428em;
  color: var(--p-text-muted-color, #6B7280);
}

/* Content Section */
.qr-content {
  display: flex;
  flex-direction: column;
  gap: 23px;
}

/* Bank Info Header */
.bank-info-header {
  background: #6B26D9;
  border-radius: 12px;
  padding: 15px;
  height: 95px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.bank-logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.bank-logo {
  width: 60px;
  height: 20px;
  object-fit: contain;
}

.bank-name-fallback {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.2em;
  color: #FAFAFA;
  text-align: center;
}

.bank-name-section {
  text-align: center;
  margin-bottom: 2px;
}

.user-name {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.428em;
  color: #FAFAFA;
  text-align: center;
  opacity: 0.9;
}

.account-info {
  text-align: center;
}

.account-number {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.333em;
  color: #FAFAFA;
  text-align: center;
  opacity: 0.8;
}

/* QR Code Section */
.qr-code-section {
  display: flex;
  justify-content: stretch;
}

.qr-code-container {
  flex: 1;
  background: var(--p-dialog-background, #FFFFFF);
  border: 1px solid var(--p-dialog-border-color, #E5E7EB);
  border-radius: 12px;
}

.qr-code-inner {
  background: #F3F4F6;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-height: 180px;
  justify-content: center;
}

.qr-code-image {
  max-width: 170px;
  max-height: 170px;
  width: auto;
  height: auto;
}

.qr-icon {
  color: #9CA3AF;
  margin-bottom: 4px;
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 56px;
  /* Fixed height to prevent layout shift */
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 0 0.02px;
  min-height: 20px;
  /* Ensure consistent row height */
}

.info-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.428em;
  color: var(--p-text-muted-color, #6B7280);
}

.info-value {
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 1.428em;
}

.info-value.amount {
  font-weight: 600;
  color: #16A34A;
}

.info-value.amount.amount-empty {
  color: var(--p-text-muted-color, #6B7280);
  font-weight: 400;
  font-style: italic;
}

.info-value.description {
  font-weight: 500;
  color: var(--p-text-color, #000000);
}

.info-value.description.description-empty {
  color: var(--p-text-muted-color, #6B7280);
  font-weight: 400;
  font-style: italic;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
  align-items: flex-end;
  padding: 0 0 0 0.02px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 8px 38px 7px 37px;
  background: var(--p-button-secondary-background, #FFFFFF);
  border: 1px solid var(--p-button-secondary-border-color, #E5E7EB);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--p-button-secondary-color, #000000);
}

.action-btn:hover {
  opacity: 0.8;
}

.action-btn .btn-icon {
  color: var(--p-button-secondary-color, #09090B);
}

.action-btn span {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.428em;
  color: var(--p-button-secondary-color, #000000);
}

.nav-buttons {
  display: flex;
  gap: 4px;
}

.nav-btn {
  padding: 7px 12px;
  background: var(--p-button-secondary-background, #FFFFFF);
  border: 1px solid var(--p-button-secondary-border-color, #E5E7EB);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--p-button-secondary-color, #000000);
}

.nav-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn span {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.428em;
  color: var(--p-button-secondary-color, #000000);
}

/* Placeholder */
.qr-placeholder {
  padding: 20px;
  text-align: center;
  color: var(--p-text-muted-color, #6B7280);
  font-style: italic;
}
</style>
