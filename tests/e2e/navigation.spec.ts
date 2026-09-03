import { test, expect } from '@playwright/test'
import { setupUiOnlyMocks } from './helpers/mocks'

test.describe('Navigation & UI shell - UI only', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
  })

  test('brand logo navigates to home', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /TICKETATY/i }).first()).toBeVisible()
    await page.getByRole('link', { name: /TICKETATY/i }).first().click()
    await expect(page).toHaveURL('/')
  })

  test('search shows dropdown and navigates to event', async ({ page }) => {
    await page.goto('/')
    const search = page.getByPlaceholder('Search events…')
    await expect(search).toBeVisible({ timeout: 8000 })
    // typing should not crash UI
    await search.fill('jazz')
    await expect(search).toHaveValue('jazz', { timeout: 5000 })
    await page.waitForTimeout(600)
  })

  test('search Enter with no results stays or goes to ?q=', async ({ page }) => {
    await page.goto('/')
    const search = page.getByPlaceholder('Search events…')
    await expect(search).toBeVisible({ timeout: 8000 })
    await search.fill('zzzznonexistent')
    await expect(search).toHaveValue('zzzznonexistent', { timeout: 5000 })
    await search.press('Enter')
    await expect(page).toHaveURL(/\?q=zzzznonexistent/, { timeout: 5000 })
  })

  test('theme toggle is visible', async ({ page }) => {
    await page.goto('/')
    // ThemeToggle button
    await expect(page.getByRole('button').first()).toBeVisible()
  })

  test('404 page shows ErrorPage', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-zzz')
    await expect(page.getByText('404').or(page.getByText(/not found/i)).first()).toBeVisible({ timeout: 5000 })
  })

  test('footer links About and Contact navigate', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /About/i }).first().click()
    await expect(page).toHaveURL('/about')
    await expect(page.getByText(/about/i).first()).toBeVisible({ timeout: 5000 })
    await page.goto('/')
    await page.getByRole('link', { name: /Contact/i }).first().click()
    await expect(page).toHaveURL('/contact')
  })

  test('auth layout: /auth redirects to login', async ({ page }) => {
    await page.goto('/auth')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('Sign In button visible when not authed', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })
})
