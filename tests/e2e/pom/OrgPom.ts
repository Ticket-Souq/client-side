import type { Page, Locator } from '@playwright/test'

export class OrgPom {
  readonly page: Page
  constructor(page: Page) { this.page = page }

  async gotoEvents() { await this.page.goto('/org/events') }
  async gotoCreate() { await this.page.goto('/org/events/create') }
  async gotoVenues() { await this.page.goto('/org/venues') }
  async gotoTemplates() { await this.page.goto('/org/venue-templates') }
  async gotoTeam() { await this.page.goto('/org/team') }
  async gotoAnalytics() { await this.page.goto('/org/analytics') }
  async gotoValidate() { await this.page.goto('/org/validate') }

  // Event management (expanded details render for every card, so scope
  // all card assertions to the target card)
  eventCard(title: string): Locator { return this.page.locator('.mgmt-card-wrap', { hasText: title }) }
  expandFirstEvent(): Locator { return this.page.getByText('No poster').first() }
  showTicketsBtn(title: string): Locator {
    return this.eventCard(title).getByRole('button', { name: 'Show Reserved Tickets', exact: true })
  }
  cancelEventBtn(title: string): Locator {
    return this.eventCard(title).getByRole('button', { name: 'Cancel Event', exact: true })
  }
  cancelEventBtnAnywhere(): Locator {
    return this.page.getByRole('button', { name: 'Cancel Event', exact: true })
  }

  // Toasts portal to document.body, outside #root — scope by container to
  // avoid matching identical page content (e.g. inline field errors).
  toast(text: string): Locator {
    return this.page.locator('body > div:not(#root)', { hasText: text })
  }

  // Event create
  createSubmitBtn(): Locator { return this.page.locator('button[type="submit"]') }

  // Team
  tab(name: 'All' | 'Agents' | 'Consumers'): Locator {
    return this.page.locator('.tabs .tab', { hasText: name }).first()
  }
  memberRow(email: string): Locator { return this.page.locator('tbody tr', { hasText: email }) }
  generateBtn(): Locator { return this.page.getByRole('button', { name: 'Generate Members' }) }
  agentsCountInput(): Locator {
    // modal labels are not associated via for/id, so scope by exact label text
    return this.page.locator('.modal-field:has(.modal-label:text-is("Agents")) input')
  }
  confirmBtn(): Locator { return this.page.locator('.modal-card').getByRole('button', { name: 'Confirm' }) }

  // Venues
  venueRow(name: string): Locator { return this.page.locator('tbody tr', { hasText: name }) }
  addVenueBtn(): Locator { return this.page.getByRole('button', { name: 'Add Venue' }) }
  venueNameInput(): Locator { return this.page.locator('.modal-card').getByPlaceholder('Venue name') }
  createVenueBtn(): Locator { return this.page.locator('.modal-card').getByRole('button', { name: 'Create Venue' }) }
  dangerBtn(): Locator { return this.page.locator('button.btn-danger') }

  // QR validation
  manualInput(): Locator { return this.page.getByPlaceholder('Enter ticket ID or URL…') }
  validateBtn(): Locator { return this.page.getByRole('button', { name: 'Validate', exact: true }) }
  checkInBtn(): Locator { return this.page.getByRole('button', { name: 'Check in ticket' }) }
}
