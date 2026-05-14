import { useState, useEffect } from 'react'
import { getAcceptedConnections } from '../supabase'
import styles from './ConnectionsTab.module.css'

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  ['#a78bfa', '#7c3aed'],
  ['#f472b6', '#be185d'],
  ['#34d399', '#059669'],
  ['#60a5fa', '#2563eb'],
  ['#fb923c', '#ea580c'],
]

function ConnectionCard({ connection, index }) {
  const u = connection.user
  const [bg, fg] = AVATAR_COLORS[index % AVATAR_COLORS.length]

  if (!u) return null

  return (
    <div className={styles.card}>
      <div className={styles.connectedBadge}>✓ Connected</div>

      <div className={styles.cardTop}>
        <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${bg}, ${fg})` }}>
          {getInitials(u.name)}
        </div>
        <div className={styles.identity}>
          <h3 className={styles.name}>{u.name}</h3>
          <p className={styles.course}>{u.study}</p>
        </div>
      </div>

      {u.free_time && (
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Free time</span>
          <span className={styles.infoValue}>
            {u.free_time.length > 120 ? u.free_time.slice(0, 120) + '…' : u.free_time}
          </span>
        </div>
      )}

      {u.building && (
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Building</span>
          <span className={styles.infoValue}>{u.building}</span>
        </div>
      )}

      {u.fun_fact && (
        <div className={styles.funFact}>
          <span className={styles.funFactIcon}>⚡</span>
          {u.fun_fact}
        </div>
      )}
    </div>
  )
}

export default function ConnectionsTab({ currentUser }) {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getAcceptedConnections(currentUser.id)
      setConnections(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.center}>
        <p className={styles.errorText}>⚠ {error}</p>
        <button className={styles.retryBtn} onClick={load}>Retry</button>
      </div>
    )
  }

  if (connections.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🤝</div>
        <h3 className={styles.emptyTitle}>No connections yet</h3>
        <p className={styles.emptySub}>
          Head to Find Matches, send a connect request, and once someone accepts it'll show up here.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      <div className={styles.listHeader}>
        <h2 className={styles.listTitle}>Your connections</h2>
        <span className={styles.count}>{connections.length}</span>
      </div>
      {connections.map((conn, i) => (
        <ConnectionCard key={conn.connectionId} connection={conn} index={i} />
      ))}
    </div>
  )
}
