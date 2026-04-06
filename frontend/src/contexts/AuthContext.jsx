import { useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('chat_token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadProfile() {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await authApi.profile()
        if (!ignore) {
          setUser(res.data?.data?.user || null)
        }
      } catch {
        localStorage.removeItem('chat_token')
        if (!ignore) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()
    return () => {
      ignore = true
    }
  }, [token])

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token),
      async login(email, password) {
        const res = await authApi.login({ email, password })
        const nextToken = res.data?.data?.token
        const nextUser = res.data?.data?.user
        localStorage.setItem('chat_token', nextToken)
        setToken(nextToken)
        setUser(nextUser)
        return nextUser
      },
      async register(username, email, password) {
        const res = await authApi.register({ username, email, password })
        const nextToken = res.data?.data?.token
        const nextUser = res.data?.data?.user
        localStorage.setItem('chat_token', nextToken)
        setToken(nextToken)
        setUser(nextUser)
        return nextUser
      },
      async logout() {
        try {
          await authApi.logout()
        } catch {
          // Ignore API logout errors and still clear local session.
        } finally {
          localStorage.removeItem('chat_token')
          setToken(null)
          setUser(null)
        }
      },
    }),
    [user, token, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

