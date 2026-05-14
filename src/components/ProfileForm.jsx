import { useState } from 'react'
import styles from './ProfileForm.module.css'

const FIELDS = [
  { key: 'name', label: 'Your name', type: 'input', placeholder: 'e.g. Aisha Kapoor', required: true },
  { key: 'studying', label: "What you're studying", type: 'input', placeholder: 'e.g. Computer Science, 2nd year', required: true },
  { key: 'freeTime', label: 'What do you do in your free time?', type: 'textarea', placeholder: 'Hobbies, how you unwind, what you get nerdy about...', required: true },
  { key: 'building', label: "What are you currently building? (optional)", type: 'input', placeholder: 'Side project, research, anything creative...', required: false },
  { key: 'lookingFor', label: 'What kind of person are you looking for?', type: 'textarea', placeholder: 'Energy, values, shared interests, vibe...', required: true },
  { key: 'funFact', label: 'One fun fact about you', type: 'input', placeholder: 'Something that makes you, you', required: true },
]

export default function ProfileForm({ onSubmit, error }) {
  const [form, setForm] = useState({
    name: '', studying: '', freeTime: '', building: '', lookingFor: '', funFact: '',
  })
  const [touched, setTouched] = useState({})

  function handleChange(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleBlur(key) {
    setTouched(t => ({ ...t, [key]: true }))
  }

  function isInvalid(field) {
    return field.required && touched[field.key] && !form[field.key].trim()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const allTouched = {}
    FIELDS.forEach(f => { allTouched[f.key] = true })
    setTouched(allTouched)
    const missing = FIELDS.filter(f => f.required && !form[f.key].trim())
    if (missing.length) return
    onSubmit(form)
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🧠</span>
            <span className={styles.logoText}>MindMate</span>
          </div>
          <h1 className={styles.title}>Find your campus match</h1>
          <p className={styles.subtitle}>
            Tell us about yourself and our AI will find 3 people you'd actually click with.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {FIELDS.map(field => (
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
                  value={form[field.key]}
                  onChange={e => handleChange(field.key, e.target.value)}
                  onBlur={() => handleBlur(field.key)}
                  rows={3}
                />
              ) : (
                <input
                  id={field.key}
                  type="text"
                  className={`${styles.input} ${isInvalid(field) ? styles.invalid : ''}`}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => handleChange(field.key, e.target.value)}
                  onBlur={() => handleBlur(field.key)}
                />
              )}
              {isInvalid(field) && (
                <span className={styles.errorMsg}>This field is required</span>
              )}
            </div>
          ))}

          {error && (
            <div className={styles.errorBanner}>
              <span className={styles.errorIcon}>⚠</span>
              {error}
            </div>
          )}

          <button type="submit" className={styles.submitBtn}>
            Find my matches
            <span className={styles.btnArrow}>→</span>
          </button>
        </form>
      </div>
    </div>
  )
}
