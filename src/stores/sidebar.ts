import { defineStore } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const isMenuOnly = ref(false) // false = open full, true = menu-only
  const isHidden = ref(false) // true = completely hidden on small mobile

  // Initialize state based on screen size
  const initializeState = () => {
    if (window.innerWidth < 768) {
      // Small mobile: hide sidebar completely
      isHidden.value = true
      isMenuOnly.value = true
    } else if (window.innerWidth < 1024) {
      // Tablet/medium mobile: show as menu-only
      isHidden.value = false
      isMenuOnly.value = true
    } else {
      // Desktop: show full sidebar by default
      isHidden.value = false
      isMenuOnly.value = false
    }
  }

  const toggle = () => {
    if (window.innerWidth < 768) {
      // On small mobile, toggle between hidden and menu-only
      isHidden.value = !isHidden.value
      if (!isHidden.value) {
        isMenuOnly.value = true
      }
    } else {
      // On larger screens, toggle between menu-only and full
      isMenuOnly.value = !isMenuOnly.value
    }
  }

  const open = () => {
    isHidden.value = false
    isMenuOnly.value = false
  }

  const toMenuOnly = () => {
    if (window.innerWidth < 768) {
      isHidden.value = true
    } else {
      isMenuOnly.value = true
    }
  }

  // Auto-adjust sidebar based on screen size
  const handleResize = () => {
    const wasHidden = isHidden.value

    if (window.innerWidth < 768) {
      // Small mobile: hide sidebar completely
      isHidden.value = true
      isMenuOnly.value = true
    } else if (window.innerWidth < 1024) {
      // Tablet/medium mobile: show as menu-only
      isHidden.value = false
      isMenuOnly.value = true
    } else {
      // Desktop: show sidebar
      isHidden.value = false
      // If coming from mobile (was hidden), open full sidebar
      if (wasHidden) {
        isMenuOnly.value = false
      }
      // Otherwise keep user preference for menuOnly
    }
  }

  // Keyboard shortcut Ctrl+B
  const handleKeyboard = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault()
      toggle()
    }
  }

  onMounted(() => {
    initializeState()
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyboard)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeyboard)
  })

  return {
    isMenuOnly,
    isHidden,
    toggle,
    open,
    toMenuOnly,
    handleResize,
  }
})
