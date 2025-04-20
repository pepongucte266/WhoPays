import { vi } from 'vitest'
// Đặt vi.mock lên đầu file, không có biến top-level để tránh lỗi hoisting!
vi.mock('@/lib/supabaseClient', () => {
  const onAuthStateChange = vi.fn()
  const getSession = vi.fn()
  const signUp = vi.fn()
  const signInWithPassword = vi.fn()
  const signOut = vi.fn()
  return {
    supabase: {
      auth: {
        onAuthStateChange,
        getSession,
        signUp,
        signInWithPassword,
        signOut,
      },
    },
  }
})

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { supabase } from '@/lib/supabaseClient'

type MockFn = ReturnType<typeof vi.fn>

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
}
const mockSession = {
  user: mockUser,
  access_token: 'token',
  refresh_token: 'refresh_token',
  expires_in: 3600,
  token_type: 'bearer',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    Object.values(supabase.auth).forEach(
      (fn) => (fn as MockFn).mockReset && (fn as MockFn).mockReset(),
    )
  })

  it('initializeAuthListener cập nhật user/session', async () => {
    ;(supabase.auth.onAuthStateChange as MockFn).mockImplementation(
      (cb: (event: string, session: { user: typeof mockUser }) => void) => {
        cb('SIGNED_IN', { user: mockUser })
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      },
    )
    ;(supabase.auth.getSession as MockFn).mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    })
    const store = useAuthStore()
    await store.initializeAuthListener()
    expect(store.user).toEqual(mockUser)
    expect(store.session).toEqual({ user: mockUser })
    expect(store.loading).toBe(false)
  })

  it('signUp thành công', async () => {
    ;(supabase.auth.signUp as MockFn).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    })
    const store = useAuthStore()
    const ok = await store.signUp('test@example.com', '123456')
    expect(ok).toBe(true)
    expect(store.user).toEqual(mockUser)
    expect(store.session).toEqual(mockSession)
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('signUp lỗi', async () => {
    ;(supabase.auth.signUp as MockFn).mockResolvedValue({
      data: {},
      error: { message: 'Email đã tồn tại', name: 'AuthError' },
    })
    const store = useAuthStore()
    const ok = await store.signUp('test@example.com', '123456')
    expect(ok).toBe(false)
    expect(store.error?.message).toContain('Email đã tồn tại')
    expect(store.loading).toBe(false)
  })

  it('signIn thành công', async () => {
    ;(supabase.auth.signInWithPassword as MockFn).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    })
    const store = useAuthStore()
    const ok = await store.signIn('test@example.com', '123456')
    expect(ok).toBe(true)
    expect(store.user).toEqual(mockUser)
    expect(store.session).toEqual(mockSession)
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('signIn lỗi', async () => {
    ;(supabase.auth.signInWithPassword as MockFn).mockResolvedValue({
      data: {},
      error: { message: 'Sai mật khẩu', name: 'AuthError' },
    })
    const store = useAuthStore()
    const ok = await store.signIn('test@example.com', '123456')
    expect(ok).toBe(false)
    expect(store.error?.message).toContain('Sai mật khẩu')
    expect(store.loading).toBe(false)
  })

  it('signOut thành công', async () => {
    ;(supabase.auth.signOut as MockFn).mockResolvedValue({ error: null })
    const store = useAuthStore()
    store.user = mockUser
    store.session = mockSession
    const ok = await store.signOut()
    expect(ok).toBe(true)
    expect(store.user).toBeNull()
    expect(store.session).toBeNull()
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('signOut lỗi', async () => {
    ;(supabase.auth.signOut as MockFn).mockResolvedValue({
      error: { message: 'Lỗi đăng xuất', name: 'AuthError' },
    })
    const store = useAuthStore()
    store.user = mockUser
    store.session = mockSession
    const ok = await store.signOut()
    expect(ok).toBe(false)
    expect(store.error?.message).toContain('Lỗi đăng xuất')
    expect(store.loading).toBe(false)
  })
})
