import { Navigate } from 'react-router-dom'
import { hasUserRole } from '../../../shared/auth'
import Landing from '../../home/pages/Landing'

export default function RootRouter() {
  if (hasUserRole('ADMIN')) {
    return <Navigate to="/admin/organizations" replace />
  }
  if (hasUserRole('ORG_HEAD') || hasUserRole('ORG_AGENT')) {
    return <Navigate to="/org/events" replace />
  }
  if (hasUserRole('ORG_CONSUMER')) {
    return <Navigate to="/org/validate" replace />
  }
  return <Landing />
}
