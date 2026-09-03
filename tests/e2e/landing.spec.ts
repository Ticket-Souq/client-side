import { test, expect } from '@playwright/test'
import { setupUiOnlyMocks } from './helpers/mocks'

test.describe('Landing page - UI only', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
  })

  test('renders hero eyebrow and event rows', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Events in the next 7 days')).toBeVisible({ timeout: 8000 })
    // category rows
    await expect(page.getByRole('heading', { name: 'Music' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Technology' })).toBeVisible()
  })

  test('clicking hero ticket navigates to event detail', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Cairo Jazz Festival').first()).toBeVisible({ timeout: 8000 })
    // click View Details button inside hero
    await page.getByRole('button', { name: 'View Details' }).first().click()
    await expect(page).toHaveURL(/\/events\/evt-/, { timeout: 8000 })
  })

  test('empty state when no events', async ({ page }) => {
    // Clear default mocks and re-register with empty events
    await page.unrouteAll({ behavior: 'wait' })
    await setupUiOnlyMocks(page, { events: [] })
    await page.goto('/')
    await expect(page.getByText('No events available yet.')).toBeVisible({ timeout: 8000 })
  })

  test('header and footer are visible on landing', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /TICKETATY/i }).first()).toBeVisible()
    await expect(page.getByText('© 2026 Ticketaty')).toBeVisible()
    await expect(page.getByRole('link', { name: 'About Us' }).first()).toBeVisible()
  })
})

test.describe('Event detail - UI only', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
  })

  test('renders event detail with sections and Get Tickets', async ({ page }) => {
    await page.goto('/events/evt-1')
    await expect(page.getByRole('heading', { name: 'Cairo Jazz Festival' })).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('About this event')).toBeVisible()
    await expect(page.getByText('Sections & Pricing')).toBeVisible()
    await expect(page.getByText('VIP')).toBeVisible()
    await expect(page.getByText('General')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Get Tickets' })).toBeVisible()
  })

  test('Get Tickets navigates to reserve page', async ({ page }) => {
    await page.goto('/events/evt-1')
    await page.getByRole('button', { name: 'Get Tickets' }).click()
    await expect(page).toHaveURL('/events/evt-1/reserve')
  })

  test('back button returns to home', async ({ page }) => {
    await page.goto('/events/evt-1')
    await page.getByRole('button', { name: /Back/ }).click()
    await expect(page).toHaveURL('/')
  })

  test('not-found handling for unknown event (mock returns detail anyway - UI still renders)', async ({ page }) => {
    // Even unknown id returns mock detail in UI-only mode, so it still shows title with id
    await page.goto('/events/unknown-id-999')
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })
})
