// Shared mock data for UI-only tests. No real backend needed.

export const mockEvents = [
  {
    id: 'evt-1',
    title: 'Cairo Jazz Festival',
    posterUrl: '',
    bannerUrl: '',
    location: 'Cairo Opera House',
    categoryName: 'Music',
    category: 'Music',
    status: 'PUBLISHED',
    startDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    venueName: 'Main Hall',
    priceFrom: 150,
    description: 'Annual jazz gathering',
    organizerName: 'Jazz Org',
  },
  {
    id: 'evt-2',
    title: 'Tech Summit 2026',
    posterUrl: '',
    bannerUrl: '',
    location: 'New Capital Hall',
    categoryName: 'Technology',
    category: 'Technology',
    status: 'PUBLISHED',
    startDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    venueName: 'Hall A',
    priceFrom: 0,
  },
  {
    id: 'evt-3',
    title: 'Football Cup Final',
    posterUrl: '',
    bannerUrl: '',
    location: 'Cairo Stadium',
    categoryName: 'Sports',
    category: 'Sports',
    status: 'PUBLISHED',
    startDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    venueName: 'Stadium',
  },
]

export const mockEventDetailZone = {
  id: 'evt-1',
  title: 'Cairo Jazz Festival',
  description: 'A great night of jazz with international artists.',
  location: 'Cairo Opera House',
  venueTemplateId: null,
  eventCategoryName: 'Music',
  organization: 'Jazz Org',
  PosterUrl: '',
  bannerUrl: null,
  status: 'PUBLISHED',
  bookingModel: 'ZONE' as const,
  startDate: new Date(Date.now() + 2 * 86400000).toISOString(),
  finishDate: new Date(Date.now() + 2 * 86400000 + 3600000 * 3).toISOString(),
  sections: [
    {
      id: 'sec-vip',
      templateSectionId: null,
      name: 'VIP',
      capacity: 50,
      remainingCapacity: 42,
      color: '#FFD700',
      price: 500,
      seats: [],
    },
    {
      id: 'sec-general',
      templateSectionId: null,
      name: 'General',
      capacity: 200,
      remainingCapacity: 180,
      color: '#3B82F6',
      price: 150,
      seats: [],
    },
    {
      id: 'sec-free',
      templateSectionId: null,
      name: 'Free Zone',
      capacity: 100,
      remainingCapacity: 100,
      color: '#10B981',
      price: 0,
      seats: [],
    },
  ],
}

export const mockEventDetailSeat = {
  ...mockEventDetailZone,
  id: 'evt-seat-1',
  title: 'Seat Event - Theater Night',
  bookingModel: 'SEAT' as const,
  venueTemplateId: 'tpl-1',
  sections: [
    {
      id: 'sec-a',
      templateSectionId: 'cat-a',
      name: 'Orchestra',
      capacity: 20,
      remainingCapacity: 15,
      color: '#FFD700',
      price: 300,
      seats: Array.from({ length: 5 }, (_, i) => ({
        id: `seat-${i + 1}`,
        templateSeatId: `cell-${i + 1}`,
        status: 'AVAILABLE' as const,
      })),
    },
  ],
}

export const paginatedEventsResponse = {
  content: mockEvents,
  totalElements: mockEvents.length,
  totalPages: 1,
  number: 0,
  size: 50,
}

// ── Organizer fixtures ──────────────────────────────────────────────

// Management list reuses the full event-detail shape (EventFullResponse).
export const mockManagementEvents = [
  { ...mockEventDetailZone },
  {
    ...mockEventDetailZone,
    id: 'evt-2',
    title: 'Tech Summit 2026',
    description: 'Two days of talks and demos.',
    location: 'New Capital Hall',
    eventCategoryName: 'Technology',
    organization: 'Tech Org',
  },
]

export const mockOrgTickets = [
  {
    id: 'orgt-1',
    ticketType: 'ZONE',
    eventTitle: 'Cairo Jazz Festival',
    price: 150,
    reservationStatus: 'ACTIVE',
    consumed: false,
    holderName: 'Jane Attendee',
    row: null,
    seatNumber: null,
    seatCategory: null,
    zoneCategory: 'General',
    templateSeatId: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'orgt-2',
    ticketType: 'ZONE',
    eventTitle: 'Cairo Jazz Festival',
    price: 500,
    reservationStatus: 'ACTIVE',
    consumed: false,
    holderName: 'John Guest',
    row: null,
    seatNumber: null,
    seatCategory: null,
    zoneCategory: 'VIP',
    templateSeatId: null,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
]

export const mockMembers = [
  {
    userId: 'u-head',
    name: 'Org Head',
    email: 'head@org.com',
    memberRole: 'HEAD',
    orgId: 'org-1',
    organizationName: 'Jazz Org',
    active: true,
  },
  {
    userId: 'u-agent',
    name: 'Amy Agent',
    email: 'agent@org.com',
    memberRole: 'AGENT',
    orgId: 'org-1',
    organizationName: 'Jazz Org',
    active: true,
  },
  {
    userId: 'u-cons',
    name: 'Carl Consumer',
    email: 'consumer@org.com',
    memberRole: 'CONSUMER',
    orgId: 'org-1',
    organizationName: 'Jazz Org',
    active: false,
  },
]

export const mockGeneratedAccounts = [
  { userId: 'gen-1', email: 'agent1@org.com', password: 'Pass123!', role: 'AGENT' },
  { userId: 'gen-2', email: 'consumer1@org.com', password: 'Pass456!', role: 'CONSUMER' },
]

export const mockVenues = [
  { id: 'ven-1', name: 'Main Hall', address: 'Cairo Opera House', type: 'SEAT_BASED' },
  { id: 'ven-2', name: 'Open Air Stage', address: 'Giza Park', type: 'ZONE_BASED' },
]

export const mockAnalyticsKpis = {
  revenue: { value: 125000, currency: 'EGP', deltaPct: 12 },
  ticketsSold: { value: 340, capacity: 500 },
  checkInRate: { valuePct: 80, noShowPct: 20 },
  avgTicketPrice: { value: 367, currency: 'EGP' },
}

export const mockSalesPace = {
  granularity: 'day',
  series: Array.from({ length: 5 }, (_, i) => ({
    date: new Date(Date.now() - (4 - i) * 86400000).toISOString(),
    ticketsCumulative: (i + 1) * 40,
  })),
}

export const mockAnalyticsEvents = {
  events: [
    {
      eventId: 'evt-1',
      name: 'Cairo Jazz Festival',
      date: new Date(Date.now() + 2 * 86400000).toISOString(),
      sold: 200,
      capacity: 350,
      revenue: 90000,
      noShowPct: 10,
    },
  ],
  page: 0,
  totalPages: 1,
}

// Single ticket for the QR-validation manual-entry flow (TicketResponse shape).
export const mockValidationTicket = {
  id: 'ticket-123',
  eventId: 'evt-1',
  ticketType: 'ZONE',
  eventTitle: 'Cairo Jazz Festival',
  eventStartDate: new Date(Date.now() + 2 * 86400000).toISOString(),
  eventFinishDate: new Date(Date.now() + 2 * 86400000 + 3600000 * 3).toISOString(),
  eventPosterUrl: '',
  eventStatus: 'ACTIVE',
  price: 150,
  reservationStatus: 'ACTIVE',
  consumed: false,
  zoneCategory: 'General',
  row: null,
  seatNumber: null,
  seatCategory: null,
  holderName: 'John Doe',
  createdAt: new Date(Date.now() - 86400000).toISOString(),
}
