# Ticket Service API — Frontend Integration Guide

Base URL: `/api/v1/tickets`

All public endpoints require `X-User-Id` header (the authenticated user's UUID, forwarded by the gateway).

## Endpoints

### `GET /api/v1/tickets`
List the current user's tickets, ordered by most recent.

**Headers:** `X-User-Id: 550e8400-e29b-41d4-a716-446655440000`

**Response 200** — array of `TicketResponse`:
```json
[
  {
    "id": "uuid",
    "ticketType": "SEAT",
    "eventTitle": "Summer Concert",
    "eventStartDate": "2024-08-15T20:00:00Z",
    "eventFinishDate": "2024-08-15T23:00:00Z",
    "eventPosterUrl": "https://cdn.ticketsouq.com/posters/summer.jpg",
    "eventStatus": "PUBLISHED",
    "price": 75.00,
    "reservationStatus": "ACTIVE",
    "consumed": false,
    "zoneCategory": null,
    "row": 5,
    "seatNumber": 12,
    "seatCategory": "VIP",
    "createdAt": "2024-08-01T10:30:00"
  }
]
```

### `GET /api/v1/tickets/{id}`
Get a single ticket by ID. The user can only access their own tickets.

**Headers:** `X-User-Id`

**Response 200** — single `TicketResponse`

**Errors:** 404 if not found, 403 if not the owner

### `GET /api/v1/tickets?reservationId={uuid}`
Get all tickets belonging to a reservation. Used after checkout to show the purchased tickets.

## `TicketResponse` Fields

| Field | Type |
|---|---|
| `id` | UUID |
| `ticketType` | `"SEAT"` | `"ZONE"` |
| `eventTitle` | string |
| `eventStartDate` | ISO-8601 |
| `eventFinishDate` | ISO-8601 |
| `eventPosterUrl` | string |
| `eventStatus` | string |
| `price` | number |
| `reservationStatus` | string |
| `consumed` | boolean |
| `zoneCategory` | string | null |
| `row` | number | null |
| `seatNumber` | number | null |
| `seatCategory` | string | null |
| `createdAt` | ISO-8601 |

### Rendering logic:
- if `ticketType == "SEAT"`: show `row`, `seatNumber`, `seatCategory`
- if `ticketType == "ZONE"`: show `zoneCategory`

## Rendering Examples by State

| State | Conditions |
|---|---|
| Active (upcoming) | `consumed: false`, `reservationStatus: "ACTIVE"`, future date |
| Active (past) | `consumed: false`, `reservationStatus: "ACTIVE"`, past date |
| Consumed | `consumed: true` |
| Refunded | `reservationStatus: "REFUNDED"` |
| Cancelled | `reservationStatus: "CANCELLED"` |

## Error Responses

All errors return JSON with the following shape (content varies by gateway config):

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Ticket not found: uuid"
}
```

**Common status codes:**
- `400` — Bad request (validation errors)
- `403` — Forbidden (ticket doesn't belong to user)
- `404` — Not found
- `409` — Conflict (e.g., already consumed)
- `500` — Internal error
