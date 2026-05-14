import { useState, useEffect } from 'react'
import FindMatchesTab from './FindMatchesTab'
import RequestsTab from './RequestsTab'
import ConnectionsTab from './ConnectionsTab'
import ProfileTab from './ProfileTab'
import { getIncomingRequests, getConnectedUserIds, getOtherProfiles, normalizeProfile } from '../supabase'
import { findMatches } from '../groq'
import styles from './Dashboard.module.css'

const TABS = [
  { id: 'find', label: 'Find Matches' },
  { id: 'requests', label: 'Requests' },
  { id: 'connections', label: 'Connections' },
  { id: 'profile', label: 'Profile' },
]

export default function Dashboard({ currentUser, onLogout, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('find')
  const [requestCount, setRequestCount] = useState(0)

  const [matches, setMatches] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState(null)

  useEffect(() => {
    refreshRequestCount()
  }, [])

  async function refreshRequestCount() {
    try {
      const requests = await getIncomingRequests(currentUser.id)
      setRequestCount(requests.length)
    } catch {
      // non-critical
    }
  }

  async function runMatching() {
    setMatchLoading(true)
    setMatchError(null)
    setMatches(null)
    try {
      const connectedIds = await getConnectedUserIds(currentUser.id)
      const realProfiles = await getOtherProfiles(currentUser.id, connectedIds)
      const userProfile = normalizeProfile(currentUser)
      const result = await findMatches(userProfile, realProfiles)
      const enriched = result.map(m => ({
        ...m,
        userId: realProfiles.find(p => p.name === m.name)?.id || null,
      }))
      setMatches(enriched)
    } catch (err) {
      setMatchError(err.message)
    } finally {
      setMatchLoading(false)
    }
  }

  const firstName = currentUser.name?.split(' ')[0] || currentUser.username

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.logo}>
          <span>🧠</span>
          <span className={styles.logoText}>MindMate</span>
        </div>
        <div className={styles.userArea}>
          <span className={styles.greeting}>Hey, {firstName}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>Log out</button>
        </div>
      </header>

      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === 'requests' && requestCount > 0 && (
                <span className={styles.badge}>{requestCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className={styles.content}>
        {activeTab === 'find' && (
          <FindMatchesTab
            currentUser={currentUser}
            matches={matches}
            loading={matchLoading}
            error={matchError}
            onFindMatches={runMatching}
          />
        )}
        {activeTab === 'requests' && (
          <RequestsTab
            currentUser={currentUser}
            onCountChange={setRequestCount}
          />
        )}
        {activeTab === 'connections' && (
          <ConnectionsTab currentUser={currentUser} />
        )}
        {activeTab === 'profile' && (
          <ProfileTab currentUser={currentUser} onProfileUpdate={onProfileUpdate} />
        )}
      </main>
    </div>
  )
}
