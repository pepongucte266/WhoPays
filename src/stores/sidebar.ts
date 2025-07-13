import { defineStore } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const isMenuOnly = ref(false) // false = open full, true = menu-only

  const toggle = () => {
    isMenuOnly.value = !isMenuOnly.value
  }

  const open = () => {
    isMenuOnly.value = false
  }

  const toMenuOnly = () => {
    isMenuOnly.value = true
  } // Auto-close sidebar on mobile
  const handleResize = () => {
    if (window.innerWidth < 1024) {
      isMenuOnly.value = true // Thu gọn trên mobile
    } else {
      isMenuOnly.value = false // Mở đầy đủ trên desktop
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
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyboard)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeyboard)
  })

  return {
    isMenuOnly,
    toggle,
    open,
    toMenuOnly,
    handleResize,
  }
})
