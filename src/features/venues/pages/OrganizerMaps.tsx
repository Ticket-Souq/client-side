import { PublisherApp } from '../components/PublisherApp'

interface Props {
  initialVenueId?: string
}

export default function OrganizerMaps({ initialVenueId }: Props) {
  return (
    <PublisherApp
      initialVenueId={initialVenueId}
    />
  )
}
