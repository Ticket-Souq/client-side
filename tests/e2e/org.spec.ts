import { test, expect } from '@playwright/test'
import { setupUiOnlyMocks, setupOrgMocks } from './helpers/mocks'
import { loginAs, ORG_HEAD, ORG_AGENT, ORG_CONSUMER } from './helpers/orgAuth'
import { OrgPom } from './pom/OrgPom'

test.describe('Organizer - UI only (ORG_HEAD)', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
    await setupOrgMocks(page)
    await loginAs(page, [ORG_HEAD])
  })

  test('root redirects organizer to event management', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/org/events')
    await expect(page.getByRole('heading', { name: 'Event Management' })).toBeVisible()
  })

  test('events page lists managed events with create action', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoEvents()
    await expect(page.getByRole('heading', { name: 'Event Management' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create event' })).toBeVisible()
    await expect(org.eventCard('Cairo Jazz Festival')).toBeVisible()
    await expect(org.eventCard('Tech Summit 2026')).toBeVisible()
  })

  test('create button navigates to event creation form', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoEvents()
    await page.getByRole('button', { name: 'Create event' }).click()
    await expect(page).toHaveURL('/org/events/create')
    await expect(page.getByRole('heading', { name: 'Create Event' })).toBeVisible()
  })

  test('expanding an event shows reserved tickets', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoEvents()
    await expect(org.eventCard('Cairo Jazz Festival')).toBeVisible()
    await org.expandFirstEvent().click()
    await org.showTicketsBtn('Cairo Jazz Festival').click()
    const card = org.eventCard('Cairo Jazz Festival')
    await expect(card.getByText('Jane Attendee')).toBeVisible()
    await expect(card.getByText('John Guest')).toBeVisible()
  })

  test('cancel event calls API and shows success toast', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoEvents()
    await expect(org.eventCard('Cairo Jazz Festival')).toBeVisible()
    await org.expandFirstEvent().click()
    await org.cancelEventBtn('Cairo Jazz Festival').click()
    await expect(org.toast('Event cancelled')).toBeVisible({ timeout: 5000 })
  })

  test('team page lists members with role tabs', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoTeam()
    await expect(page.getByRole('heading', { name: 'Team Members' })).toBeVisible()
    await expect(org.memberRow('head@org.com')).toBeVisible()
    await expect(org.memberRow('agent@org.com')).toBeVisible()
    await expect(org.memberRow('consumer@org.com')).toBeVisible()
  })

  test('team tabs filter members by role', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoTeam()
    await expect(org.memberRow('agent@org.com')).toBeVisible()
    await org.tab('Agents').click()
    await expect(org.memberRow('agent@org.com')).toBeVisible()
    await expect(org.memberRow('consumer@org.com')).toHaveCount(0)
    await org.tab('Consumers').click()
    await expect(org.memberRow('consumer@org.com')).toBeVisible()
    await expect(org.memberRow('agent@org.com')).toHaveCount(0)
  })

  test('generate members flow shows credentials modal', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoTeam()
    await expect(org.memberRow('agent@org.com')).toBeVisible()
    await org.generateBtn().click()
    await org.agentsCountInput().fill('1')
    await org.confirmBtn().click()
    await expect(page.getByRole('heading', { name: 'Generated Accounts' })).toBeVisible()
    await expect(page.getByText('agent1@org.com')).toBeVisible()
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByRole('heading', { name: 'Generated Accounts' })).toHaveCount(0)
  })

  test('analytics page renders revenue overview', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoAnalytics()
    await expect(page.getByText('Total revenue')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Revenue by Event' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Ticket Sales' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Event Performance' })).toBeVisible()
    await expect(page.getByText('Cairo Jazz Festival').first()).toBeVisible()
  })

  test('venues page lists venues', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoVenues()
    await expect(page.getByRole('heading', { name: 'Venues' })).toBeVisible()
    await expect(org.venueRow('Main Hall')).toBeVisible()
    await expect(org.venueRow('Open Air Stage')).toBeVisible()
  })

  test('add venue flow shows success toast', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoVenues()
    await expect(org.venueRow('Main Hall')).toBeVisible()
    await org.addVenueBtn().click()
    await org.venueNameInput().fill('New Test Venue')
    await org.createVenueBtn().click()
    await expect(page.getByText('Venue created successfully')).toBeVisible({ timeout: 5000 })
  })

  test('delete venue asks for confirmation and shows toast', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoVenues()
    await expect(org.venueRow('Main Hall')).toBeVisible()
    await org.venueRow('Main Hall').getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText('Delete this venue?')).toBeVisible()
    await org.dangerBtn().click()
    await expect(page.getByText('Venue deleted')).toBeVisible({ timeout: 5000 })
  })

  test('venue templates page renders seat-map editor shell', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoTemplates()
    // no venue selected -> editor prompts to pick one
    await expect(page.getByText('Select a venue')).toBeVisible()
  })
})

test.describe('Organizer - event creation (ORG_HEAD)', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
    await setupOrgMocks(page)
    await loginAs(page, [ORG_HEAD])
  })

  test('create form renders with required fields', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoCreate()
    await expect(page.getByRole('heading', { name: 'Create Event' })).toBeVisible()
    await expect(page.getByText('Event name').first()).toBeVisible()
    await expect(page.getByText('Description').first()).toBeVisible()
    await expect(org.createSubmitBtn()).toContainText('Create Event')
  })

  test('empty submit shows validation error toast', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoCreate()
    await expect(page.getByRole('heading', { name: 'Create Event' })).toBeVisible()
    await org.createSubmitBtn().click()
    await expect(org.toast('Event name is required')).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL('/org/events/create')
  })
})

test.describe('Organizer - QR validation', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
    await setupOrgMocks(page)
    await loginAs(page, [ORG_HEAD])
  })

  test('validate page renders scanner and manual entry', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoValidate()
    await expect(page.getByRole('heading', { name: 'QR Scanner' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Manual Entry' })).toBeVisible()
    await expect(org.manualInput()).toBeVisible()
  })

  test('manual entry validates ticket and checks it in', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoValidate()
    await org.manualInput().fill('ticket-123')
    await org.validateBtn().click()
    await expect(page.getByText('Valid Ticket')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('John Doe')).toBeVisible()
    await org.checkInBtn().click()
    await expect(page.getByText('Checked in', { exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('unknown ticket id shows invalid state', async ({ page }) => {
    const org = new OrgPom(page)
    await org.gotoValidate()
    await org.manualInput().fill('ticket-404')
    await org.validateBtn().click()
    await expect(page.getByText('Invalid Ticket')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Ticket not found')).toBeVisible()
  })
})

test.describe('Organizer - role guards', () => {
  test.beforeEach(async ({ page }) => {
    await setupUiOnlyMocks(page)
    await setupOrgMocks(page)
  })

  test('consumer is forced to the validate page', async ({ page }) => {
    await loginAs(page, [ORG_CONSUMER])
    await page.goto('/org/events')
    await expect(page).toHaveURL('/org/validate')
    await expect(page.getByRole('heading', { name: 'QR Scanner' })).toBeVisible()
  })

  test('consumer root lands on validate page', async ({ page }) => {
    await loginAs(page, [ORG_CONSUMER])
    await page.goto('/')
    await expect(page).toHaveURL('/org/validate')
  })

  test('agent sees events but no cancel action', async ({ page }) => {
    const org = new OrgPom(page)
    await loginAs(page, [ORG_AGENT])
    await org.gotoEvents()
    await expect(org.eventCard('Cairo Jazz Festival')).toBeVisible()
    await org.expandFirstEvent().click()
    await expect(org.cancelEventBtnAnywhere()).toHaveCount(0)
  })
})
