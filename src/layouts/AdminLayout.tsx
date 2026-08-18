import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { UserProfileProvider } from '../shared/hooks/useUserProfile'
import { LayoutShell } from '../shared/components/layout/LayoutShell'
import { LoadingState } from '../shared/components/display/StateViews/StateViews'

export default function AdminLayout() {
  return (
    <UserProfileProvider>
      <LayoutShell>
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </LayoutShell>
    </UserProfileProvider>
  )
}
