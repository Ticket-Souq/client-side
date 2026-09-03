import type { Page } from '@playwright/test'

export const ORG_HEAD = 'ORG_HEAD'
export const ORG_AGENT = 'ORG_AGENT'
export const ORG_CONSUMER = 'ORG_CONSUMER'

function base64Url(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url')
}

/**
 * Unsigned fake JWT. The app only base64-decodes the payload client-side
 * (see src/shared/jwt.ts) and never verifies a signature, so this is enough
 * to satisfy hasUserRole() / isAuthenticated().
 */
export function mockJwt(roles: string[]): string {
  const now = Math.floor(Date.now() / 1000)
  const header = base64Url({ alg: 'none', typ: 'JWT' })
  const payload = base64Url({
    sub: 'org-user-1',
    email: 'org@example.com',
    roles,
    iat: now,
    exp: now + 3600,
  })
  return `${header}.${payload}.sig`
}

/**
 * Authenticate as the given roles: drops a valid sq_access cookie and stubs
 * GET /api/v1/user/profile. Register AFTER setupUiOnlyMocks so the profile
 * override wins (Playwright matches later registrations first).
 * Call before page.goto().
 */
export async function loginAs(
  page: Page,
  roles: string[],
  profile: { name: string; email: string } = { name: 'Org User', email: 'org@example.com' },
) {
  await page.context().addCookies([
    { name: 'sq_access', value: mockJwt(roles), domain: 'localhost', path: '/' },
  ])
  await page.route('**/api/v1/user/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...profile, roles }),
    })
  })
}
