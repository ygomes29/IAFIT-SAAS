import styles from './MetricCard.module.css'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MetricCard({ icon: Icon, label, value, change, prefix = '', suffix = '' }) {
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          {Icon && <Icon size={20} />}
        </div>
        {change !== undefined && (
          <div className={`${styles.change} ${isPositive ? styles.positive : ''} ${isNegative ? styles.negative : ''}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className={styles.value}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  )
}
