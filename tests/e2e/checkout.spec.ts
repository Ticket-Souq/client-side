import { test, expect } from '@playwright/test'
import { setupUiOnlyMocks } from './helpers/mocks'

function seedReservation() {
  return {
    reservationId: 'res-123',
    eventId: 'evt-1',
    bookingModel: 'ZONE',
    seatIds: ['sec-vip_0'],
    expiresAt: new Date(Date.now() + 600 * 1000).toISOString(),
    tickets: [{ key: 'sec-vip_0', label: 'VIP', sectionName: 'VIP', price: 500, sectionId: 'sec-vip' }],
    holderNames: {} as Record<string, string>,
  }
}

test.describe('Checkout - UI only', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
  })

  test('guard shows Browse Events when no reservation', async ({ page }) => {
    await page.goto('/customer/booking/checkout')
    await expect(page.getByText('No reservation data found')).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('button', { name: 'Browse Events' })).toBeVisible()
  })

  test('with valid reservation shows order summary, timer and payment', async ({ page }) => {
    const r = seedReservation()
    await page.addInitScript(res => localStorage.setItem('reservation', JSON.stringify(res)), r)
    await page.goto('/customer/booking/checkout')
    await expect(page.getByText('Order Summary')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Tickets (1)')).toBeVisible()
    await expect(page.getByText('VIP')).toBeVisible()
    await expect(page.getByText('Total')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible()
    // TimerBanner shows MM:SS
    await expect(page.getByText('Reservation lock')).toBeVisible()
    await expect(page.getByText(/\d{2}:\d{2}/).first()).toBeVisible()
  })

  test('pay button triggers confirm modal', async ({ page }) => {
    const r = seedReservation()
    await page.addInitScript(res => localStorage.setItem('reservation', JSON.stringify(res)), r)
    await page.goto('/customer/booking/checkout')
    const payBtn = page.getByRole('button', { name: /^Pay/ }).first()
    await expect(payBtn).toBeVisible({ timeout: 8000 })
    await payBtn.click()
    await expect(page.getByText('Confirm payment')).toBeVisible({ timeout: 3000 })
    await expect(page.getByText(/You will not be able to refund/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible()
    // dismiss via Go back
    await page.getByRole('button', { name: 'Go back' }).click()
    await expect(page.getByText('Confirm payment')).toHaveCount(0)
  })

  test('cancel reservation triggers confirm modal then navigates to event', async ({ page }) => {
    const r = seedReservation()
    await page.addInitScript(res => localStorage.setItem('reservation', JSON.stringify(res)), r)
    await page.goto('/customer/booking/checkout')
    await expect(page.getByText('Order Summary')).toBeVisible({ timeout: 8000 })
    await page.getByRole('button', { name: 'Cancel reservation' }).first().click()
    await expect(page.getByText('Cancel reservation').first()).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('button', { name: 'Keep reservation' })).toBeVisible()
    // overlay click dismissed is also tested elsewhere; test confirm cancel
    await page.getByRole('button', { name: 'Cancel reservation' }).last().click()
    await expect(page).toHaveURL(/\/events\/evt-1/)
    // storage cleared
    const val = await page.evaluate(() => localStorage.getItem('reservation'))
    expect(val).toBeNull()
  })

  test('expired reservation shows Session expired', async ({ page }) => {
    const r = { ...seedReservation(), expiresAt: new Date(Date.now() + 3000).toISOString() }
    await page.addInitScript(res => localStorage.setItem('reservation', JSON.stringify(res)), r)
    await page.goto('/customer/booking/checkout')
    // Wait for countdown to expire (timer starts at ~3s)
    await expect(page.getByText('Session expired')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Back to event' })).toBeVisible()
  })

  test('Browse Events button from guard navigates home', async ({ page }) => {
    await page.goto('/customer/booking/checkout')
    await page.getByRole('button', { name: 'Browse Events' }).click()
    await expect(page).toHaveURL('/')
  })
})
