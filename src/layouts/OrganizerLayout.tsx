import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { UserProfileProvider } from '../shared/hooks/useUserProfile'
import { LayoutShell } from '../shared/components/layout/LayoutShell'

export default function OrganizerLayout() {
  return (
    <UserProfileProvider>
      <LayoutShell>
        <Suspense fallback={<div className="text-center py-5" style={{ color: '#726f63' }}>Loading…</div>}>
          <Outlet />
        </Suspense>
      </LayoutShell>
    </UserProfileProvider>
  )
}
