import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import type { Session, User, AuthError } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const session = ref<Session | null>(null)
  const user = ref<User | null>(null)
  const loading = ref<boolean>(true) // Start with true to indicate initial loading
  const error = ref<AuthError | null>(null)
  const initialized = ref<boolean>(false) // Track if auth has been initialized

  // Getters
  const isLoggedIn = computed(() => !!user.value)
  const userId = computed(() => user.value?.id)
  const userRole = computed(() => user.value?.app_metadata?.role as string | undefined)

  // Actions
  async function initializeAuthListener() {
    try {
      loading.value = true
      error.value = null

      // Get current session first
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      session.value = data.session
      user.value = data.session?.user ?? null

      console.log('Initial session:', data.session ? 'Found' : 'Not found')

      // Set up auth state change listener
      supabase.auth.onAuthStateChange((event, currentSession) => {
        console.log('Supabase Auth Event:', event)
        session.value = currentSession
        user.value = currentSession?.user ?? null

        // Don't set loading to false here for state changes
        // as they happen after initial load
      })

      initialized.value = true
    } catch (err: unknown) {
      if (err instanceof Error || (typeof err === 'object' && err !== null && 'message' in err)) {
        error.value = err as AuthError
        console.error('Error initializing auth:', err)
      } else {
        console.error('Unknown error initializing auth:', err)
        error.value = { name: 'UnknownError', message: 'An unknown error occurred' } as AuthError
      }
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      })
      if (signUpError) throw signUpError
      // Supabase mặc định gửi email xác nhận, user/session sẽ null cho đến khi xác nhận
      // Hoặc nếu auto confirm bật thì sẽ có session ngay
      session.value = data.session
      user.value = data.user
      console.log('Sign up successful (check email for confirmation if enabled):', data)
      return true
    } catch (err: unknown) {
      if (err instanceof Error || (typeof err === 'object' && err !== null && 'message' in err)) {
        error.value = err as AuthError
        console.error('Sign up error:', err)
      } else {
        console.error('Unknown sign up error:', err)
        error.value = {
          name: 'UnknownError',
          message: 'An unknown error occurred during sign up',
        } as AuthError
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      if (signInError) throw signInError
      session.value = data.session
      user.value = data.user
      console.log('Sign in successful:', data)
      return true
    } catch (err: unknown) {
      if (err instanceof Error || (typeof err === 'object' && err !== null && 'message' in err)) {
        error.value = err as AuthError
        console.error('Sign in error:', err)
      } else {
        console.error('Unknown sign in error:', err)
        error.value = {
          name: 'UnknownError',
          message: 'An unknown error occurred during sign in',
        } as AuthError
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function signOut(): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      session.value = null
      user.value = null
      console.log('Sign out successful')
      return true
    } catch (err: unknown) {
      if (err instanceof Error || (typeof err === 'object' && err !== null && 'message' in err)) {
        error.value = err as AuthError
        console.error('Sign out error:', err)
      } else {
        console.error('Unknown sign out error:', err)
        error.value = {
          name: 'UnknownError',
          message: 'An unknown error occurred during sign out',
        } as AuthError
      }
      return false
    } finally {
      loading.value = false
    }
  }

  // Call initializeAuthListener when the store is created
  // initializeAuthListener() // Nên gọi từ App.vue để quản lý lifecycle

  return {
    session,
    user,
    loading,
    error,
    initialized,
    isLoggedIn,
    userId,
    userRole, // Expose userRole
    initializeAuthListener,
    signUp,
    signIn,
    signOut,
  }
})
