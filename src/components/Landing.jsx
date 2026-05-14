import styles from './Landing.module.css'

export default function Landing({ onSignup, onLogin }) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <span>✦</span> AI-powered campus matching
        </div>

        <h1 className={styles.title}>
          Find friends who<br />
          <span className={styles.accent}>actually get you</span>
        </h1>

        <p className={styles.subtitle}>
          Fill out your profile once. Our AI reads between the lines and finds
          3 people on campus you'd genuinely click with.
        </p>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onSignup}>
            Create account
          </button>
          <button className={styles.secondaryBtn} onClick={onLogin}>
            I already have an account
          </button>
        </div>

        <div className={styles.profiles}>
          {['AM', 'PN', 'RD', 'MI', 'DS'].map((initials, i) => (
            <div key={initials} className={styles.floatAvatar} style={{ animationDelay: `${i * 0.15}s` }}>
              {initials}
            </div>
          ))}
        </div>

        <p className={styles.hint}>
          No passwords sent to any AI. No data sold. Just matching.
        </p>
      </div>
    </div>
  )
}
