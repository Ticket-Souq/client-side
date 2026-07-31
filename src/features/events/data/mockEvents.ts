import type { EventCardResponse, EventDetail, Zone, TicketTier } from '../types/event.types'

export interface Event {
  id: string;
  title: string;
  dateTime: string;
  venueId: string;
  venueName: string;
  description: string;
  category: string;
  mode: "seat";
}

export const mockEvents: Event[] = [
  {
    id: "evt-1",
    title: "Jazz Night Under the Stars",
    dateTime: "2026-08-15T20:00:00",
    venueId: "venue-mock-1",
    venueName: "Grand Hall Amphitheatre",
    description:
      "An evening of live jazz featuring renowned local artists. Open-air seating under the summer sky with premium sound and lighting.",
    category: "Concert",
    mode: "seat",
  },
  {
    id: "evt-2",
    title: "Hamlet – A Modern Revival",
    dateTime: "2026-09-10T19:30:00",
    venueId: "venue-mock-2",
    venueName: "Theatre Stage, Downtown Arts Centre",
    description:
      "A bold contemporary take on Shakespeare's classic tragedy. Striking visuals, a reimagined score, and a cast that brings new depth to timeless words.",
    category: "Theatre",
    mode: "seat",
  },
  {
    id: "evt-3",
    title: "Tech Talks 2026",
    dateTime: "2026-10-05T09:00:00",
    venueId: "venue-mock-3",
    venueName: "Convention Hall A",
    description:
      "A full-day conference covering AI, web development, and product design. Keynotes from industry leaders and hands-on workshops.",
    category: "Conference",
    mode: "seat",
  },
]

export const MOCK_CARDS: EventCardResponse[] = [
  { id: 'evt-1', title: 'Nile Nights Festival', posterUrl: '', status: 'PUBLISHED', startDate: '2026-07-25T19:00:00', endDate: '2026-07-25T23:59:00', category: 'Music', venueName: 'Cairo Festival Grounds', priceFrom: 450, currency: 'EGP', ticketsAvailable: 1200, ticketsSold: 850, mode: 'ZONE_BASED' },
  { id: 'evt-2', title: 'Rooftop Jazz Evening', posterUrl: '', status: 'PUBLISHED', startDate: '2026-07-22T20:00:00', endDate: '2026-07-22T23:00:00', category: 'Music', venueName: 'Zamalek Sky Lounge', priceFrom: 350, currency: 'EGP', ticketsAvailable: 200, ticketsSold: 150, mode: 'SEAT_BASED' },
  { id: 'evt-3', title: 'Comedy Night Cairo', posterUrl: '', status: 'PUBLISHED', startDate: '2026-07-18T21:00:00', endDate: '2026-07-18T23:30:00', category: 'Theatre', venueName: 'Downtown Comedy Club', priceFrom: 250, currency: 'EGP', ticketsAvailable: 300, ticketsSold: 290, mode: 'SEAT_BASED' },
  { id: 'evt-4', title: 'Art Expo 2026', posterUrl: '', status: 'PUBLISHED', startDate: '2026-07-30T10:00:00', endDate: '2026-07-30T18:00:00', category: 'Conference', venueName: 'Cairo Opera House', priceFrom: 200, currency: 'EGP', ticketsAvailable: 500, ticketsSold: 180, mode: 'SEAT_BASED' },
  { id: 'evt-5', title: 'Cairo Food Festival', posterUrl: '', status: 'PUBLISHED', startDate: '2026-08-14T12:00:00', endDate: '2026-08-14T22:00:00', category: 'Food', venueName: 'New Cairo Exhibition Park', priceFrom: 120, currency: 'EGP', ticketsAvailable: 2000, ticketsSold: 600, mode: 'ZONE_BASED' },
  { id: 'evt-6', title: 'Marathon 2026', posterUrl: '', status: 'PUBLISHED', startDate: '2026-09-09T06:00:00', endDate: '2026-09-09T12:00:00', category: 'Sports', venueName: 'Sheikh Zayed Track', priceFrom: 300, currency: 'EGP', ticketsAvailable: 5000, ticketsSold: 3200, mode: 'SEAT_BASED' },
  { id: 'evt-7', title: 'Electronic Music Summit', posterUrl: '', status: 'PENDING', startDate: '2026-08-20T22:00:00', endDate: '2026-08-21T06:00:00', category: 'Music', venueName: 'The Roof, New Cairo', priceFrom: 600, currency: 'EGP', ticketsAvailable: 800, ticketsSold: 0, mode: 'ZONE_BASED' },
  { id: 'evt-8', title: 'Hamlet – Modern Revival', posterUrl: '', status: 'DRAFT', startDate: '2026-09-10T19:30:00', endDate: '2026-09-10T22:00:00', category: 'Theatre', venueName: 'Downtown Arts Centre', priceFrom: 800, currency: 'EGP', ticketsAvailable: 150, ticketsSold: 0, mode: 'SEAT_BASED' },
  { id: 'evt-9', title: 'Tech Talks 2026', posterUrl: '', status: 'CANCELLED', startDate: '2026-10-05T09:00:00', endDate: '2026-10-05T17:00:00', category: 'Conference', venueName: 'Convention Hall A', priceFrom: 500, currency: 'EGP', ticketsAvailable: 0, ticketsSold: 120, mode: 'SEAT_BASED' },
  { id: 'evt-10', title: 'Sufi Night Under the Stars', posterUrl: '', status: 'PUBLISHED', startDate: '2026-08-01T20:00:00', endDate: '2026-08-01T23:00:00', category: 'Music', venueName: 'Citadel Amphitheatre', priceFrom: 400, currency: 'EGP', ticketsAvailable: 600, ticketsSold: 420, mode: 'ZONE_BASED' },
]

function makeTiers(priceBase: number, vipExtra: number): TicketTier[] {
  return [
    { id: `tier-vip-${priceBase}`, name: 'VIP', price: priceBase + vipExtra, perks: ['Priority entry', 'Exclusive lounge access', 'Complimentary drinks', 'Best view area'], available: 50, total: 100, active: true },
    { id: `tier-std-${priceBase}`, name: 'Standard', price: priceBase, perks: ['General admission', 'Access to all areas'], available: 200, total: 300, active: true },
    { id: `tier-eb-${priceBase}`, name: 'Early Bird', price: Math.round(priceBase * 0.7), perks: ['General admission', 'Early entry', 'Discounted rate'], available: 0, total: 50, active: false },
  ]
}

function makeZones(): Zone[] {
  return [
    { id: 'vip', name: 'VIP', price: 1500, spotsAvailable: 45, spotsTotal: 120, status: 'available', color: '#ffc629' },
    { id: 'standard-a', name: 'Standard A', price: 450, spotsAvailable: 200, spotsTotal: 340, status: 'available', color: '#4a90d9' },
    { id: 'standard-b', name: 'Standard B', price: 350, spotsAvailable: 5, spotsTotal: 280, status: 'limited', color: '#ff9800' },
    { id: 'general', name: 'General', price: 200, spotsAvailable: 0, spotsTotal: 500, status: 'soldout', color: '#bdbdbd' },
  ]
}

const LINEUPS: Record<string, { name: string; stage: string }[]> = {
  'evt-1': [
    { name: 'Cairokee', stage: 'Main Stage · 9:00 PM' },
    { name: 'Amr Diab', stage: 'Main Stage · 10:30 PM' },
    { name: 'Massar Egbari', stage: 'Side Stage · 8:00 PM' },
    { name: 'DJ Dissh', stage: 'Electronic Stage · 11:00 PM' },
  ],
  'evt-2': [
    { name: 'Jazz Ensemble', stage: 'Main Floor · 9:00 PM' },
    { name: 'Sara M.', stage: 'Main Floor · 10:30 PM' },
    { name: 'Omar K.', stage: 'Balcony · 8:30 PM' },
  ],
  'evt-4': [
    { name: 'Ahmed El Maghrabi', stage: 'Hall 1 · 11:00 AM' },
    { name: 'Laila Hussein', stage: 'Hall 2 · 1:00 PM' },
    { name: 'Contemporary Art Collective', stage: 'Hall 3 · 3:00 PM' },
  ],
}

const DESCRIPTIONS: Record<string, string> = {
  'evt-1': 'Nile Nights Festival brings together top Egyptian and international artists across three stages for an unforgettable night of music under the stars. Experience world-class performances, immersive art installations, and a curated food village at Cairo Festival Grounds. Now in its 3rd year, Nile Nights has become Egypt\'s premier outdoor music festival, drawing over 15,000 attendees last year.',
  'evt-2': 'An intimate evening of smooth jazz and soulful vocals on a rooftop overlooking the Nile. Featuring Cairo\'s finest jazz musicians with a curated selection of wines and small bites. Dress code: smart casual.',
  'evt-3': 'Egypt\'s top comedians take the stage for a night of non-stop laughter. Featuring stand-up, improv, and sketch comedy in an intimate club setting. 18+ event.',
  'evt-4': 'A curated exhibition featuring over 100 works from emerging and established Egyptian artists. Paintings, sculpture, photography, and mixed media installations across three grand halls. Meet-the-artist sessions throughout the week.',
  'evt-5': 'Cairo\'s biggest food festival returns with over 50 vendors, live cooking demonstrations, and tastings from Egypt\'s top restaurants and street food legends. Free entry for children under 12.',
  'evt-6': 'The annual Cairo Marathon returns with full marathon, half marathon, 10K, and 5K categories. The route takes runners through scenic Sheikh Zayed with water stations every 2km. All finishers receive a medal and T-shirt.',
  'evt-7': 'An all-night electronic music experience featuring international and local DJs across two stages. State-of-the-art sound system and immersive visual projections. Limited VIP tables available.',
  'evt-10': 'Experience the transcendent beauty of Sufi music and dance at the historic Citadel. Featuring the Al-Tannoura troupe and special guest performers. A spiritual journey under the Cairo night sky.',
}

const DURATIONS: Record<string, string> = {
  'evt-1': '5 hours',
  'evt-7': '8 hours',
  'evt-6': '6 hours',
}

export const MOCK_EVENTS_DETAIL: EventDetail[] = MOCK_CARDS.map((card) => {
  const basePrice = card.priceFrom ?? 450
  return {
    ...card,
    description: DESCRIPTIONS[card.id] || 'No description available.',
    slug: card.title.toLowerCase().replace(/\s+/g, '-'),
    venueId: `venue-${card.id}`,
    venueAddress: `${card.venueName}, Cairo`,
    mode: card.id === 'evt-1' || card.id === 'evt-7' ? 'ZONE_BASED' : 'SEAT_BASED',
    tags: ['live', card.category?.toLowerCase() || 'event', 'cairo', 'egypt'],
    imageUrl: '',
    endDate: card.startDate,
    visibility: 'PUBLIC',
    tiers: makeTiers(basePrice, card.id === 'evt-1' ? 1050 : card.id === 'evt-7' ? 900 : 600),
    zones: card.id === 'evt-1' || card.id === 'evt-7' ? makeZones() : undefined,
    lineup: LINEUPS[card.id] || undefined,
    duration: DURATIONS[card.id] || '3 hours',
    capacity: card.ticketsAvailable + card.ticketsSold,
  }
})
