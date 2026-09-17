import { AdminNavbar } from '@/features/dashboard/components/AdminNavbar'
import { ProfilePage } from '@/features/auth/pages/ProfilePage'

export function AdminProfilePage() {
  return (
    <>
      <AdminNavbar />
      <ProfilePage />
    </>
  )
}