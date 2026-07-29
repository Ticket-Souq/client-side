import { Suspense } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { UserProfileProvider } from '../shared/hooks/useUserProfile'
import { LayoutShell } from '../shared/components/layout/LayoutShell'
import { hasUserRole } from '../shared/auth'

export default function CustomerLayout() {
  if (hasUserRole('ORG_CONSUMER')) {
    return <Navigate to="/org/validate" replace />
  }
  if (hasUserRole('ORG_HEAD') || hasUserRole('ORG_AGENT')) {
    return <Navigate to="/org/events" replace />
  }

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
