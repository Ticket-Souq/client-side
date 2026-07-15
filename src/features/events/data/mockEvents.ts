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
];
