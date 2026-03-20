import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <Topbar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
