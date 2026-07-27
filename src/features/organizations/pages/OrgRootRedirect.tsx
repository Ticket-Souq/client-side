import { Navigate } from 'react-router-dom'
import { getUserRoles } from '../../../shared/auth'
import Landing from '../../home/pages/Landing'

export default function RootRouter() {
  const roles = getUserRoles()
  if (roles.includes('ORG_HEAD') || roles.includes('ORG_AGENT')) {
    return <Navigate to="/org/events" replace />
  }
  return <Landing />
}
