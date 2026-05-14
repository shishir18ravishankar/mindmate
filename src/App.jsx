import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import AuthForm from './components/AuthForm'
import Dashboard from './components/Dashboard'
import { signUp, login } from './supabase'

const S = { LANDING: 'landing', LOGIN: 'login', SIGNUP: 'signup', DASHBOARD: 'dashboard' }
const LS_KEY = 'mindmate_user'

export default function App() {
  const [screen, setScreen] = useState(S.LANDING)
  const [currentUser, setCurrentUser] = useState(null)
  const [error, setError] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      try {
        const user = JSON.parse(saved)
        setCurrentUser(user)
        setScreen(S.DASHBOARD)
      } catch {
        localStorage.removeItem(LS_KEY)
      }
    }
  }, [])

  async function handleSignup(formData) {
    setAuthLoading(true)
    setError(null)
    try {
      const user = await signUp(formData)
      localStorage.setItem(LS_KEY, JSON.stringify(user))
      setCurrentUser(user)
      setScreen(S.DASHBOARD)
    } catch (err) {
      setError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLogin(formData) {
    setAuthLoading(true)
    setError(null)
    try {
      const user = await login(formData.username, formData.password)
      localStorage.setItem(LS_KEY, JSON.stringify(user))
      setCurrentUser(user)
      setScreen(S.DASHBOARD)
    } catch (err) {
      setError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem(LS_KEY)
    setCurrentUser(null)
    setError(null)
    setScreen(S.LANDING)
  }

  function switchTo(s) {
    setError(null)
    setScreen(s)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {screen === S.LANDING && (
        <Landing onSignup={() => switchTo(S.SIGNUP)} onLogin={() => switchTo(S.LOGIN)} />
      )}
      {screen === S.LOGIN && (
        <AuthForm
          mode="login"
          onSubmit={handleLogin}
          onSwitch={() => switchTo(S.SIGNUP)}
          error={error}
          loading={authLoading}
        />
      )}
      {screen === S.SIGNUP && (
        <AuthForm
          mode="signup"
          onSubmit={handleSignup}
          onSwitch={() => switchTo(S.LOGIN)}
          error={error}
          loading={authLoading}
        />
      )}
      {screen === S.DASHBOARD && currentUser && (
        <Dashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onProfileUpdate={(updatedUser) => {
            localStorage.setItem(LS_KEY, JSON.stringify(updatedUser))
            setCurrentUser(updatedUser)
          }}
        />
      )}
    </div>
  )
}
