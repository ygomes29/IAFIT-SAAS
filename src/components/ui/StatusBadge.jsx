import styles from './StatusBadge.module.css'

const variants = {
  active: { label: 'Ativo', className: 'active' },
  paused: { label: 'Pausado', className: 'paused' },
  error: { label: 'Erro', className: 'error' },
  pending: { label: 'Pendente', className: 'pending' },
  connected: { label: 'Conectado', className: 'active' },
  disconnected: { label: 'Desconectado', className: 'error' },
  healthy: { label: 'Saudável', className: 'active' },
  success: { label: 'Sucesso', className: 'active' },
  warning: { label: 'Atenção', className: 'paused' },
  info: { label: 'Info', className: 'pending' },
}

export default function StatusBadge({ status, label }) {
  const variant = variants[status] || variants.pending
  return (
    <span className={`${styles.badge} ${styles[variant.className]}`}>
      <span className={styles.dot} />
      {label || variant.label}
    </span>
  )
}
