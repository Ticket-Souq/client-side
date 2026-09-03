import { test, expect } from '@playwright/test'
import { setupUiOnlyMocks } from './helpers/mocks'
import { AuthPom } from './pom/AuthPom'

test.describe('Auth - UI only', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
  })

  test('login page renders with email, password and links', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoLogin()
    await expect(auth.emailInput()).toBeVisible()
    await expect(auth.passwordInput()).toBeVisible()
    await expect(auth.submitBtn()).toContainText('Sign in')
    await expect(auth.forgotLink()).toBeVisible()
    await expect(auth.signUpLink()).toBeVisible()
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('login shows validation errors on empty submit', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoLogin()
    await auth.submitBtn().click()
    // useAuthForm forces all touched on submit -> validation messages appear
    await expect(page.locator('.field-error').first()).toBeVisible()
    await expect(page.getByText('This field is required').first()).toBeVisible()
  })

  test('login shows email pattern error', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoLogin()
    await auth.emailInput().fill('not-an-email')
    await auth.emailInput().blur()
    await expect(page.getByText('Enter a valid email')).toBeVisible()
  })

  test('login successful navigates to home', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoLogin()
    await auth.emailInput().fill('user@example.com')
    await auth.passwordInput().fill('password123')
    await auth.submitBtn().click()
    await expect(page).toHaveURL('/')
  })

  test('login error shows toast and stays on page', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ status: 401, error: 'Unauthorized', message: 'Invalid credentials' }) })
    })
    const auth = new AuthPom(page)
    await auth.gotoLogin()
    await auth.emailInput().fill('bad@example.com')
    await auth.passwordInput().fill('wrongpass')
    await auth.submitBtn().click()
    await expect(page.getByText('Invalid credentials')).toBeVisible({ timeout: 5000 })
  })

  test('register page renders tabs and required fields', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoRegister()
    await expect(page.getByText('Create your account')).toBeVisible()
    await expect(auth.emailInput()).toBeVisible()
    await expect(auth.passwordInput()).toBeVisible()
    await expect(auth.confirmPasswordInput()).toBeVisible()
    await expect(auth.fullNameInput()).toBeVisible()
    // customer tab has no org name
    await expect(auth.orgNameInput()).toHaveCount(0)
  })

  test('register switching to organization shows org name field', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoRegister()
    await auth.tabOrganization().click()
    await expect(auth.orgNameInput()).toBeVisible()
    await expect(auth.orgNameInput()).toHaveAttribute('placeholder', 'Your organization name')
  })

  test('register validation: empty submit shows errors', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoRegister()
    await auth.submitBtn().click()
    await expect(page.locator('.field-error').first()).toBeVisible()
  })

  test('register password mismatch stays with error toast', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoRegister()
    await auth.fullNameInput().fill('John Doe')
    await auth.emailInput().fill('john@example.com')
    await auth.passwordInput().fill('password123')
    await auth.confirmPasswordInput().fill('different123')
    await auth.submitBtn().click()
    await expect(page.getByText('Passwords do not match')).toBeVisible({ timeout: 5000 })
  })

  test('register success navigates to verify-email', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoRegister()
    await auth.fullNameInput().fill('John Doe')
    await auth.emailInput().fill('john@example.com')
    await auth.passwordInput().fill('password123')
    await auth.confirmPasswordInput().fill('password123')
    await auth.submitBtn().click()
    await expect(page).toHaveURL(/\/auth\/verify-email\?email=/)
  })

  test('forgot-password page renders and validates', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoForgot()
    await expect(page.getByText('Forgot your password?')).toBeVisible()
    await auth.submitBtn().click()
    await expect(page.getByText('This field is required').first()).toBeVisible()
  })

  test('forgot-password invalid email shows pattern error', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoForgot()
    await auth.emailInput().fill('bad')
    await auth.emailInput().blur()
    await expect(page.getByText('Enter a valid email')).toBeVisible()
  })

  test('forgot-password success navigates to reset-password', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoForgot()
    await auth.emailInput().fill('user@example.com')
    await auth.submitBtn().click()
    await expect(page).toHaveURL(/\/auth\/reset-password\?email=/)
  })

  test('reset-password renders otp + new password fields', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoReset('user@example.com')
    await expect(page.getByText('Set new password')).toBeVisible()
    await expect(page.getByText(/6-digit code sent to user@example.com/)).toBeVisible()
    await expect(page.locator('.auth-code-inputs')).toBeVisible()
    await expect(page.locator('#new-password')).toBeVisible()
    await expect(page.locator('#confirm-new-password')).toBeVisible()
  })

  test('reset-password validation: empty otp shows error', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoReset()
    await page.locator('#new-password').fill('password123')
    await page.locator('#confirm-new-password').fill('password123')
    await auth.submitBtn().click()
    await expect(page.locator('.field-error').first()).toBeVisible()
  })

  test('reset-password mismatch shows toast', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoReset()
    // fill 6-digit otp via inputs
    const inputs = page.locator('.auth-code-inputs input')
    await inputs.nth(0).fill('1'); await inputs.nth(1).fill('2'); await inputs.nth(2).fill('3')
    await inputs.nth(3).fill('4'); await inputs.nth(4).fill('5'); await inputs.nth(5).fill('6')
    await page.locator('#new-password').fill('password123')
    await page.locator('#confirm-new-password').fill('different123')
    await auth.submitBtn().click()
    await expect(page.getByText('Passwords do not match')).toBeVisible({ timeout: 5000 })
  })

  test('reset-password success navigates to login', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoReset('user@example.com')
    const inputs = page.locator('.auth-code-inputs input')
    for (let i = 0; i < 6; i++) await inputs.nth(i).fill(String(i + 1))
    await page.locator('#new-password').fill('password123')
    await page.locator('#confirm-new-password').fill('password123')
    await auth.submitBtn().click()
    await expect(page).toHaveURL('/auth/login')
  })

  test('verify-email without email shows email step', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoVerify('')
    await expect(page.getByText('Check your email')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send verification code' })).toBeVisible()
  })

  test('verify-email with email param auto-sends and shows verify step', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoVerify('auto@example.com')
    // autoSent triggers sendCode -> step verify -> shows CodeInput + Verify button
    await expect(page.locator('.auth-code-inputs')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: 'Verify email' })).toBeVisible()
  })

  test('verify-email manual send transitions to verify step', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoVerify('')
    await page.locator('#email').fill('manual@example.com')
    await page.getByRole('button', { name: 'Send verification code' }).click()
    await expect(page.locator('.auth-code-inputs')).toBeVisible({ timeout: 5000 })
  })

  test('password visibility toggle works', async ({ page }) => {
    const auth = new AuthPom(page)
    await auth.gotoLogin()
    const pwd = auth.passwordInput()
    await expect(pwd).toHaveAttribute('type', 'password')
    await page.getByLabel('Show password').click()
    await expect(pwd).toHaveAttribute('type', 'text')
    await page.getByLabel('Hide password').click()
    await expect(pwd).toHaveAttribute('type', 'password')
  })
})
