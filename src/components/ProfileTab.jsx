import { useState, useEffect } from 'react'
import { updateProfile } from '../supabase'
import styles from './ProfileTab.module.css'

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const FIELDS = [
  { key: 'name',       label: 'Full name',            type: 'input',    required: true  },
  { key: 'studying',   label: 'What you\'re studying', type: 'input',    required: true  },
  { key: 'freeTime',   label: 'Free time',             type: 'textarea', required: true  },
  { key: 'building',   label: 'Currently building',    type: 'input',    required: false },
  { key: 'lookingFor', label: 'Looking for',           type: 'textarea', required: true  },
  { key: 'funFact',    label: 'Fun fact',              type: 'input',    required: true  },
]

function formFromUser(user) {
  return {
    name:       user.name        || '',
    studying:   user.study       || '',
    freeTime:   user.free_time   || '',
    building:   user.building    || '',
    lookingFor: user.looking_for || '',
    funFact:    user.fun_fact    || '',
  }
}

export default function ProfileTab({ currentUser, onProfileUpdate }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(() => formFromUser(currentUser))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [savedMsg, setSavedMsg] = useState(false)

  // Keep form in sync if parent updates currentUser (e.g., after save)
  useEffect(() => {
    if (!editing) setForm(formFromUser(currentUser))
  }, [currentUser])

  function handleCancel() {
    setForm(formFromUser(currentUser))
    setSaveError(null)
    setEditing(false)
  }

  async function handleSave() {
    const missing = FIELDS.filter(f => f.required && !form[f.key].trim())
    if (missing.length) {
      setSaveError(`Please fill in: ${missing.map(f => f.label).join(', ')}`)
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await updateProfile(currentUser.id, form)
      onProfileUpdate(updated)
      setEditing(false)
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const displayName = currentUser.name || currentUser.username

  return (
    <div className={styles.page}>
      {/* Avatar + identity */}
      <div className={styles.hero}>
        <div className={styles.avatar}>
          {getInitials(displayName)}
        </div>
        <div className={styles.heroText}>
          <h2 className={styles.heroName}>{currentUser.name || '—'}</h2>
          <p className={styles.heroUsername}>@{currentUser.username}</p>
        </div>
      </div>

      {savedMsg && (
        <div className={styles.savedBanner}>✓ Profile updated</div>
      )}

      {/* Fields */}
      <div className={styles.fieldsCard}>
        <div className={styles.fieldsHeader}>
          <span className={styles.fieldsLabel}>Profile details</span>
          {!editing && (
            <button className={styles.editBtn} onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>

        {/* Username — always read-only */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Username</span>
          <span className={`${styles.fieldValue} ${styles.readOnly}`}>
            @{currentUser.username}
          </span>
        </div>

        {FIELDS.map(f => (
          <div key={f.key} className={styles.field}>
            <span className={styles.fieldLabel}>
              {f.label}
              {f.required && editing && <span className={styles.req}> *</span>}
            </span>
            {editing ? (
              f.type === 'textarea' ? (
                <textarea
                  className={styles.textarea}
                  value={form[f.key]}
                  onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                  rows={3}
                  placeholder={f.required ? 'Required' : 'Optional'}
                />
              ) : (
                <input
                  type="text"
                  className={styles.input}
                  value={form[f.key]}
                  onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                  placeholder={f.required ? 'Required' : 'Optional'}
                />
              )
            ) : (
              <span className={`${styles.fieldValue} ${!form[f.key] ? styles.empty : ''}`}>
                {form[f.key] || (f.required ? '—' : 'Not set')}
              </span>
            )}
          </div>
        ))}
      </div>

      {saveError && (
        <div className={styles.errorBanner}>
          <span>⚠</span> {saveError}
        </div>
      )}

      {editing && (
        <div className={styles.editActions}>
          <button
            className={styles.cancelBtn}
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  )
}
