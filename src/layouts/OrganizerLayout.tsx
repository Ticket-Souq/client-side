import { Suspense } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { UserProfileProvider } from '../shared/hooks/useUserProfile'
import { LayoutShell } from '../shared/components/layout/LayoutShell'
import { hasUserRole } from '../shared/auth'

export default function OrganizerLayout() {
  const location = useLocation()

  if (hasUserRole('ORG_CONSUMER') && location.pathname !== '/org/validate') {
    return <Navigate to="/org/validate" replace />
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
