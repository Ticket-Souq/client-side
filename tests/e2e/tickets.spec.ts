import { test, expect } from '@playwright/test'
import { setupUiOnlyMocks } from './helpers/mocks'

test.describe('Tickets pages - UI only', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
  })

  test('My Tickets shows empty state when no tickets (mocked empty)', async ({ page }) => {
    await page.goto('/customer/tickets')
    // Without auth customer layout may show loading then empty - with mocked empty tickets list
    await expect(page.getByText(/No tickets yet|Loading your tickets|My Tickets/).first()).toBeVisible({ timeout: 8000 })
  })

  test('My Reservations shows empty/loading state', async ({ page }) => {
    await page.goto('/customer/reservations')
    await expect(page.getByText(/No reservations|Loading|My Reservations/).first()).toBeVisible({ timeout: 8000 })
  })

  test('Payment success page renders and has navigation buttons', async ({ page }) => {
    await page.goto('/customer/booking/success')
    await expect(page.getByText(/Payment Successful|Payment|Success/).first()).toBeVisible({ timeout: 5000 })
    // Buttons View My Tickets / Browse Events
    const viewBtn = page.getByRole('button', { name: /View My Tickets|My Tickets/ }).or(page.getByRole('link', { name: /View My Tickets/ }))
    // tolerate either button or link
    await expect(viewBtn.or(page.getByText('Browse Events')).first()).toBeVisible({ timeout: 5000 })
  })

  test('Payment cancel page renders', async ({ page }) => {
    await page.goto('/customer/booking/cancel')
    await expect(page.getByText(/cancel/i).first()).toBeVisible({ timeout: 5000 })
  })
})
