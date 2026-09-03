import type { Page } from '@playwright/test'
import {
  mockEvents,
  mockEventDetailZone,
  mockEventDetailSeat,
  paginatedEventsResponse,
  mockManagementEvents,
  mockOrgTickets,
  mockMembers,
  mockGeneratedAccounts,
  mockVenues,
  mockAnalyticsKpis,
  mockSalesPace,
  mockAnalyticsEvents,
  mockValidationTicket,
} from './fixtures'

/**
 * UI-only mocks. Intercepts all network calls so tests work without a backend.
 * Call `setupUiOnlyMocks(page)` at the start of each test (or in beforeEach).
 */
export async function setupUiOnlyMocks(page: Page, overrides?: {
  eventDetail?: any
  events?: any[]
}) {
  const detail = overrides?.eventDetail ?? mockEventDetailZone
  const events = overrides?.events ?? mockEvents

  // Event list / search
  await page.route('**/api/v1/event/search**', async route => {
    const url = new URL(route.request().url())
    const title = url.searchParams.get('title')?.toLowerCase() ?? ''
    const filtered = title ? events.filter(e => e.title.toLowerCase().includes(title)) : events
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: filtered, totalElements: filtered.length, totalPages: 1, number: 0, size: 20 }) })
  })
  await page.route(/\/api\/v1\/event(\?.*)?$/, async route => {
    const url = route.request().url()
    if (!url.includes('/api/v1/event')) { await route.continue(); return }
    if (url.includes('/api/v1/event/search') || url.includes('/api/v1/event/categories') || url.includes('/api/v1/event/')) { await route.continue(); return }
    if (route.request().method() === 'GET') {
      const paginated = { content: events, totalElements: events.length, totalPages: 1, number: 0, size: 50 }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated) })
      return
    }
    await route.continue()
  })
  await page.route('**/api/v1/event/categories**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(['Music','Sports','Technology','General']) })
  })
  // Single event by id
  await page.route(/\/api\/v1\/event\/[^/]+$/, async route => {
    if (route.request().method() === 'GET') {
      const url = route.request().url()
      const id = url.split('/').pop()?.split('?')[0]
      const isSeat = id === mockEventDetailSeat.id
      const body = isSeat ? mockEventDetailSeat : (id === detail.id ? detail : { ...detail, id })
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
      return
    }
    await route.continue()
  })
  // Venue template for seat map
  await page.route('**/api/v1/venue/**', async route => {
    // Generic venue/template success with minimal seat map layout
    if (route.request().url().includes('/templates/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'tpl-1',
          name: 'Template 1',
          layout: JSON.stringify({
            categories: [{ id: 'cat-a', name: 'Orchestra', color: '#FFD700' }],
            rows: [{ id: 'row-1', label: 'A', cells: [
              { id: 'cell-1', label: '1', categoryId: 'cat-a', x: 0, y: 0, width: 1, height: 1 },
              { id: 'cell-2', label: '2', categoryId: 'cat-a', x: 1, y: 0, width: 1, height: 1 },
              { id: 'cell-3', label: '3', categoryId: 'cat-a', x: 2, y: 0, width: 1, height: 1 },
            ]}],
          }),
        }),
      })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })
  // Auth endpoints - default success (tests can override with page.route again)
  await page.route('**/api/v1/auth/login', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access: 'mock.jwt.token', refresh: 'mock.refresh' }) })
      return
    }
    await route.continue()
  })
  await page.route('**/api/v1/auth/register', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
  })
  await page.route('**/api/v1/auth/email-varification**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
  })
  await page.route('**/api/v1/auth/password-forgot**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
  })
  // Notifications
  await page.route('**/api/v1/notification**', async route => {
    if (route.request().url().includes('unread-count')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 0 }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    }
  })
  // Tickets / reservations
  await page.route('**/api/v1/ticket**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })
  await page.route('**/api/v1/reservation**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })
  // Locks
  await page.route('**/api/v1/event/locks/**', async route => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reservationId: 'res-123', expiresAt }) })
  })
  // Analytics / admin fallbacks
  await page.route('**/api/v1/analytics/**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
  })
  await page.route('**/api/v1/user/**', async route => {
    if (route.request().url().includes('/profile')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'Test User', email: 'test@example.com', roles: ['CUSTOMER'] }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    }
  })
  await page.route('**/api/v1/audit**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })
  // No catch-all: let unmocked API calls fall through (will 404) but don't break vite
}

/**
 * Organizer-area mocks. Register AFTER setupUiOnlyMocks (later registrations
 * win on overlap). Does not touch auth — pair with loginAs() from orgAuth.
 */
export async function setupOrgMocks(page: Page) {
  // Event management list (paginated EventFullResponse — the generic
  // single-event mock would otherwise return a non-paginated object here).
  await page.route(/\/api\/v1\/event\/management/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: mockManagementEvents,
          totalElements: mockManagementEvents.length,
          totalPages: 1,
          number: 0,
          size: 20,
        }),
      })
      return
    }
    await route.continue()
  })

  // Cancel event (DELETE /api/v1/event/{id})
  await page.route(/\/api\/v1\/event\/[^/?]+$/, async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
      return
    }
    await route.continue()
  })

  // Create event (POST /api/v1/event, FormData body)
  await page.route(/\/api\/v1\/event(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'evt-new' }) })
      return
    }
    await route.continue()
  })

  // Team members
  await page.route(/\/api\/v1\/auth\/org\/members/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMembers) })
      return
    }
    await route.continue()
  })

  // Activate / deactivate member (POST|DELETE /api/v1/auth/org, plain-text body)
  await page.route(/\/api\/v1\/auth\/org$/, async (route) => {
    if (route.request().method() === 'POST' || route.request().method() === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
      return
    }
    await route.continue()
  })

  // Generate member accounts
  await page.route('**/api/v1/auth/org/generate-accounts', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockGeneratedAccounts) })
      return
    }
    await route.continue()
  })

  // Organizer tickets by event
  await page.route('**/api/v1/ticket/organizer/*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockOrgTickets) })
      return
    }
    await route.continue()
  })

  // Analytics overview (shaped data; generic {} fallback from
  // setupUiOnlyMocks still covers summary/timeline drill-down calls).
  await page.route('**/api/v1/analytics/overview/kpis*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAnalyticsKpis) })
  })
  await page.route('**/api/v1/analytics/overview/sales-pace*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSalesPace) })
  })
  await page.route('**/api/v1/analytics/overview/events*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAnalyticsEvents) })
  })

  // Venues list (paginated — the generic venue mock returns a bare array).
  await page.route(/\/api\/v1\/venue(\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: mockVenues,
          totalElements: mockVenues.length,
          totalPages: 1,
          number: 0,
          size: 100,
        }),
      })
      return
    }
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'ven-3', name: 'New Test Venue', address: 'Test Address', type: 'ZONE_BASED' }),
      })
      return
    }
    await route.continue()
  })

  // Delete venue
  await page.route(/\/api\/v1\/venue\/[^/?]+$/, async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
      return
    }
    await route.continue()
  })

  // QR validation: ticket lookup (valid + not-found variants)
  await page.route('**/api/v1/ticket/ticket-123', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockValidationTicket) })
      return
    }
    await route.continue()
  })
  await page.route('**/api/v1/ticket/ticket-123/consume', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockValidationTicket, consumed: true }),
      })
      return
    }
    await route.continue()
  })
  await page.route('**/api/v1/ticket/ticket-404', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ status: 404, error: 'Not Found', message: 'Ticket not found' }),
      })
      return
    }
    await route.continue()
  })
}
