import { useSearchParams } from 'react-router-dom'
import OrganizerMaps from '../../venues/pages/OrganizerMaps'

export default function VenueTemplates() {
  const [params] = useSearchParams()
  const venueId = params.get('venueId') ?? undefined

  return <OrganizerMaps initialVenueId={venueId} />
}
