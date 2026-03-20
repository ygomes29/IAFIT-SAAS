import { useState } from 'react'
import styles from './Toggle.module.css'

export default function Toggle({ checked = false, onChange, label, id }) {
  const [isOn, setIsOn] = useState(checked)

  const handleToggle = () => {
    const newValue = !isOn
    setIsOn(newValue)
    onChange?.(newValue)
  }

  return (
    <label className={styles.wrapper} htmlFor={id}>
      <button
        id={id}
        role="switch"
        aria-checked={isOn}
        className={`${styles.toggle} ${isOn ? styles.on : ''}`}
        onClick={handleToggle}
        type="button"
      >
        <span className={styles.thumb} />
      </button>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  )
}
