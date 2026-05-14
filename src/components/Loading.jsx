import styles from './Loading.module.css'

const MESSAGES = [
  'Reading your vibe...',
  'Scanning 8 profiles...',
  'Finding your people...',
  'Connecting the dots...',
  'Almost there...',
]

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.spinnerWrap}>
          <div className={styles.spinner} />
          <span className={styles.brain}>🧠</span>
        </div>
        <h2 className={styles.heading}>Finding your matches</h2>
        <p className={styles.sub}>AI is reading your profile and picking the best fits</p>
        <div className={styles.dots}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
