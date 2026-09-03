import type { Page, Locator } from '@playwright/test'

export class AuthPom {
  readonly page: Page
  constructor(page: Page) { this.page = page }

  // AuthTextField creates ids from label.toLowerCase().replace(/\s+/g,'-')
  emailInput(): Locator { return this.page.locator('#email') }
  fullNameInput(): Locator { return this.page.locator('#full-name') }
  orgNameInput(): Locator { return this.page.locator('#organization-name') }
  passwordInput(): Locator { return this.page.locator('#password') }
  confirmPasswordInput(): Locator { return this.page.locator('#confirm-password') }
  submitBtn(): Locator { return this.page.locator('button[type="submit"]') }
  forgotLink(): Locator { return this.page.getByRole('link', { name: /forgot password/i }) }
  signUpLink(): Locator { return this.page.getByRole('link', { name: /sign up/i }) }
  signInLink(): Locator { return this.page.getByRole('link', { name: /sign in/i }) }
  fieldErrors(): Locator { return this.page.locator('.field-error') }
  tabs(): Locator { return this.page.locator('.auth-tabs, [role="tablist"]') }
  tabCustomer(): Locator { return this.page.getByRole('button', { name: /customer/i }).first() }
  tabOrganization(): Locator { return this.page.getByRole('button', { name: /organization/i }).first() }

  async gotoLogin() { await this.page.goto('/auth/login') }
  async gotoRegister() { await this.page.goto('/auth/register') }
  async gotoForgot() { await this.page.goto('/auth/forgot-password') }
  async gotoReset(email = 'test@example.com') { await this.page.goto(`/auth/reset-password?email=${encodeURIComponent(email)}`) }
  async gotoVerify(email = '') { await this.page.goto(email ? `/auth/verify-email?email=${encodeURIComponent(email)}` : '/auth/verify-email') }

  async fillLogin(email: string, password: string) {
    await this.emailInput().fill(email)
    await this.passwordInput().fill(password)
  }
}
