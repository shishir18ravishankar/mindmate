import { useState } from 'react'
import styles from './AuthForm.module.css'

const PROFILE_FIELDS = [
  { key: 'name', label: 'Your full name', placeholder: 'e.g. Aisha Kapoor', required: true, type: 'input' },
  { key: 'studying', label: "What you're studying", placeholder: 'e.g. Computer Science, 2nd year', required: true, type: 'input' },
  { key: 'freeTime', label: 'What do you do in your free time?', placeholder: 'Hobbies, how you unwind, what you geek out about...', required: true, type: 'textarea' },
  { key: 'building', label: 'What are you currently building? (optional)', placeholder: 'Side project, research, anything creative...', required: false, type: 'input' },
  { key: 'lookingFor', label: 'What kind of person are you looking for?', placeholder: 'Energy, values, shared interests, vibe...', required: true, type: 'textarea' },
  { key: 'funFact', label: 'One fun fact about you', placeholder: 'Something that makes you, you', required: true, type: 'input' },
]

export default function AuthForm({ mode, onSubmit, onSwitch, error, loading }) {
  const isLogin = mode === 'login'

  const [creds, setCreds] = useState({ username: '', password: '' })
  const [profile, setProfile] = useState({ name: '', studying: '', freeTime: '', building: '', lookingFor: '', funFact: '' })
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  function updateCreds(key, val) { setCreds(c => ({ ...c, [key]: val })) }
  function updateProfile(key, val) { setProfile(p => ({ ...p, [key]: val })) }
  function touch(key) { setTouched(t => ({ ...t, [key]: true })) }

  function isInvalid(field) {
    return field.required && touched[field.key] && !profile[field.key].trim()
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (isLogin) {
      if (!creds.username.trim() || !creds.password.trim()) {
        setTouched({ username: true, password: true })
        return
      }
      onSubmit({ username: creds.username.trim(), password: creds.password })
      return
    }

    // Signup: validate everything
    const allKeys = ['username', 'password', ...PROFILE_FIELDS.map(f => f.key)]
    setTouched(Object.fromEntries(allKeys.map(k => [k, true])))

    if (!creds.username.trim() || !creds.password.trim()) return
    const missingProfile = PROFILE_FIELDS.filter(f => f.required && !profile[f.key].trim())
    if (missingProfile.length) return

    onSubmit({ ...creds, username: creds.username.trim(), ...profile })
  }

  const credInvalid = (key) => touched[key] && !creds[key].trim()

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <span>🧠</span>
            <span className={styles.logoText}>MindMate</span>
          </div>
          <h1 className={styles.title}>
            {isLogin ? 'Welcome back' : 'Create your profile'}
          </h1>
          <p className={styles.subtitle}>
            {isLogin
              ? 'Log in to see your matches.'
              : 'Tell us about yourself so the AI can find your people.'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Credentials */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Account</div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">
                Username <span className={styles.req}>*</span>
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className={`${styles.input} ${credInvalid('username') ? styles.invalid : ''}`}
                placeholder="e.g. aisha_k"
                value={creds.username}
                onChange={e => updateCreds('username', e.target.value)}
                onBlur={() => touch('username')}
              />
              {credInvalid('username') && <span className={styles.errorMsg}>Required</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password <span className={styles.req}>*</span>
              </label>
              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className={`${styles.input} ${styles.passwordInput} ${credInvalid('password') ? styles.invalid : ''}`}
                  placeholder="Choose a password"
                  value={creds.password}
                  onChange={e => updateCreds('password', e.target.value)}
                  onBlur={() => touch('password')}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {credInvalid('password') && <span className={styles.errorMsg}>Required</span>}
            </div>
          </div>

          {/* Profile fields — signup only */}
          {!isLogin && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Your profile</div>
              {PROFILE_FIELDS.map(field => (
                <div key={field.key} className={styles.field}>
                  <label className={styles.label} htmlFor={field.key}>
                    {field.label}
                    {field.required && <span className={styles.req}> *</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.key}
                      className={`${styles.textarea} ${isInvalid(field) ? styles.invalid : ''}`}
                      placeholder={field.placeholder}
                      value={profile[field.key]}
                      onChange={e => updateProfile(field.key, e.target.value)}
                      onBlur={() => touch(field.key)}
                      rows={3}
                    />
                  ) : (
                    <input
                      id={field.key}
                      type="text"
                      className={`${styles.input} ${isInvalid(field) ? styles.invalid : ''}`}
                      placeholder={field.placeholder}
                      value={profile[field.key]}
                      onChange={e => updateProfile(field.key, e.target.value)}
                      onBlur={() => touch(field.key)}
                    />
                  )}
                  {isInvalid(field) && <span className={styles.errorMsg}>Required</span>}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className={styles.errorBanner}>
              <span>⚠</span> {error}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? 'Please wait...'
              : isLogin ? 'Log in' : 'Create account & find matches'}
          </button>
        </form>

        <p className={styles.switchText}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button className={styles.switchBtn} type="button" onClick={onSwitch}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
