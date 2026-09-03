import { test, expect } from '@playwright/test'
import { setupUiOnlyMocks } from './helpers/mocks'

test.describe('Event reserve - UI only (ZONE model)', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
  })

  test('renders zone sections with qty controls', async ({ page }) => {
    await page.goto('/events/evt-1/reserve')
    await expect(page.getByRole('heading', { name: /Select Your Zone/ })).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('VIP').first()).toBeVisible()
    await expect(page.getByText('General').first()).toBeVisible()
    // qty is 0 initially
    await expect(page.getByText('Select tickets above').or(page.getByText('Click on a seat'))).toBeVisible()
  })

  test('increment qty shows selected tickets panel and total', async ({ page }) => {
    await page.goto('/events/evt-1/reserve')
    // find first + button (zone increment)
    const plusButtons = page.getByRole('button', { name: '+' })
    await expect(plusButtons.first()).toBeVisible({ timeout: 8000 })
    await plusButtons.first().click()
    await expect(page.getByText('1 ticket selected')).toBeVisible()
    await expect(page.getByText('Total')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Proceed to Checkout' })).toBeVisible()
  })

  test('second zone is disabled after selecting one zone', async ({ page }) => {
    await page.goto('/events/evt-1/reserve')
    const plusButtons = page.getByRole('button', { name: '+' })
    await plusButtons.first().click()
    // second zone plus should be disabled (otherDisabled)
    await expect(plusButtons.nth(1)).toBeDisabled()
  })

  test('can remove ticket with minus', async ({ page }) => {
    await page.goto('/events/evt-1/reserve')
    const plus = page.getByRole('button', { name: '+' }).first()
    const minus = page.getByRole('button', { name: '–' }).first()
    await plus.click()
    await expect(page.getByText('1 ticket selected')).toBeVisible()
    await minus.click()
    await expect(page.getByText('Select tickets above')).toBeVisible()
  })

  test('holder name required for guest tickets (multi-ticket)', async ({ page }) => {
    await page.goto('/events/evt-1/reserve')
    const plus = page.getByRole('button', { name: '+' }).first()
    await plus.click()
    await plus.click()
    // first ticket is "For you" no input, second is Guest with input
    await expect(page.getByPlaceholder('Enter holder name')).toBeVisible()
    const proceed = page.getByRole('button', { name: 'Proceed to Checkout' })
    // without holder name, button is disabled (canProceed false)
    await expect(proceed).toBeDisabled()
    await page.getByPlaceholder('Enter holder name').fill('Guest One')
    await expect(proceed).toBeEnabled()
  })

  test('proceed without auth redirects to login', async ({ page }) => {
    await page.goto('/events/evt-1/reserve')
    await page.getByRole('button', { name: '+' }).first().click()
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})


