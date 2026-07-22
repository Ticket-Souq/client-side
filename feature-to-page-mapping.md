# Feature → UI Page Mapping

**Generated:** 2026-07-23  
**Source:** Client-side React features ↔ UI/UX HTML mockups  
**UI/UX Base:** `ui-ux/`

---

## Summary

| Feature | Status | Pages | Style |
|---------|--------|-------|-------|
| Landing / Home Page | ✅ Complete | `landing.html` | Public |
| Authentication — Login | ✅ Complete | `customer/auth-login.html`, `admin/auth-login.html`, `organizer/auth-login.html` | Authentication |
| Authentication — Register | ✅ Complete | `customer/auth-register.html`, `admin/auth-register.html`, `organizer/auth-register.html` | Authentication |
| Authentication — Forgot Password | ✅ Complete | `customer/auth-forgot-password.html`, `admin/auth-forgot-password.html`, `organizer/auth-forgot-password.html` | Authentication |
| Authentication — Reset Password | ✅ Complete | `customer/auth-reset-password.html`, `admin/auth-reset-password.html`, `organizer/auth-reset-password.html` | Authentication |
| Authentication — Email Verification | ✅ Complete | `customer/auth-email-verify.html`, `admin/auth-email-verify.html`, `organizer/auth-email-verify.html` | Authentication |
| Authentication — Change Password | ✅ Complete | `customer/auth-change-password.html`, `admin/auth-change-password.html`, `organizer/auth-change-password.html` | Authentication |
| Customer Dashboard | ✅ Complete | `customer/index.html` | Customer Dashboard |
| Event Discovery & Browsing | ✅ Complete | `customer/events.html` | Customer |
| Event Detail | ✅ Complete | `customer/event-detail.html` | Customer |
| Zone Selection / Purchase | 🟡 Partial | `customer/zone-purchase.html`, `customer/availability.html` | Customer |
| Seat Selection | ✅ Complete | `customer/availability.html` | Customer |
| Checkout & Payment | ✅ Complete | `customer/payment.html` | Customer |
| Payment Success | 🟡 Missing | — | Customer |
| Payment Cancellation | 🟡 Missing | — | Customer |
| Ticket Management — List | ✅ Complete | `customer/tickets.html` | Customer |
| Ticket Management — Detail | ✅ Complete | `customer/ticket-detail.html` | Customer |
| Reservation Timeline | 🟡 Missing | — | Customer |
| Refunds (Customer) | ✅ Complete | `customer/refunds.html` | Customer |
| Profile (Customer) | ✅ Complete | `customer/profile.html` | Customer |
| Settings (Customer) | ✅ Complete | `customer/settings.html` | Customer |
| Notifications | ✅ Complete | `customer/notifications.html`, `admin/notifications.html`, `organizer/notifications.html` | Shared |
| Outlets | ✅ Complete | `customer/outlets.html` | Customer |
| Contact Us | ✅ Complete | `customer/contact.html` | Customer |
| Organizer Dashboard | ✅ Complete | `organizer/index.html` | Organizer Dashboard |
| Organizer Event Management | ✅ Complete | `organizer/events.html` | Organizer |
| Organizer Event Creation | ✅ Complete | `organizer/create-event.html` | Organizer |
| Organizer Venue Management | ✅ Complete | `organizer/venues.html` | Organizer |
| Organizer Venue Templates | ✅ Complete | `organizer/venue-templates.html` | Organizer |
| Organizer Analytics | ✅ Complete | `organizer/analytics.html` | Organizer |
| Organizer QR Scanner / Validation | ✅ Complete | `organizer/qr-scanner.html` | Organizer |
| Organizer Org Management | ✅ Complete | `organizer/org-management.html` | Organizer |
| Organizer Team Management | ✅ Complete | `organizer/org-members.html` | Organizer |
| Organizer Refunds | ✅ Complete | `organizer/refunds.html` | Organizer |
| Organizer Profile | ✅ Complete | `organizer/profile.html` | Organizer |
| Organizer Settings | ✅ Complete | `organizer/settings.html` | Organizer |
| Admin Dashboard | ✅ Complete | `admin/index.html` | Admin Dashboard |
| Admin Event Oversight | ✅ Complete | `admin/events.html` | Admin |
| Admin Venue Oversight | ✅ Complete | `admin/venues.html` | Admin |
| Admin Organization Management | ✅ Complete | `admin/org-management.html` | Admin |
| Admin System Monitoring | ✅ Complete | `admin/system-monitoring.html` | Admin |
| Admin Audit Logs | ✅ Complete | `admin/audit-logs.html` | Admin |
| Admin Refunds | ✅ Complete | `admin/refunds.html` | Admin |
| Admin User Management | 🟡 Missing | — | Admin |
| Admin Profile | ✅ Complete | `admin/profile.html` | Admin |
| Admin Settings | ✅ Complete | `admin/settings.html` | Admin |
| Error — 401 Unauthorized | ✅ Complete | `customer/401.html`, `admin/401.html`, `organizer/401.html` | Shared / Error |
| Error — 403 Forbidden | ✅ Complete | `customer/403.html`, `admin/403.html`, `organizer/403.html` | Shared / Error |
| Error — 404 Not Found | ✅ Complete | `customer/404.html`, `admin/404.html`, `organizer/404.html` | Shared / Error |
| Error — 500 Server Error | ✅ Complete | `customer/500.html`, `admin/500.html`, `organizer/500.html` | Shared / Error |
| Portal Selection | ✅ Complete | `landing.html` | Public |

---

# Detailed Mapping

## Public / Landing

### Landing Page

**Feature Description:** Public-facing homepage that introduces Ticket Souq, showcases featured events, provides category browsing, and offers portal selection (Customer / Organizer / Admin).

### Matching Pages

- `landing.html`

### Coverage

✅ Complete

**Implemented:**
- Sticky nav with logo, Events/Outlets/Contact Us links, Sign in button
- Hero ticket-stub card (Nile Nights Festival) with artwork, stub details, "Book now" CTA
- Horizontal scroll sections: "This week in Cairo", "Aqua parks", "Concerts & festivals"
- "Choose your portal" section with 3 portal cards (Customer, Organizer, Admin)
- Full footer with Discover, Support, Company link columns

### Style

Public / Marketing

---

## Authentication

### Feature Description

User authentication flow covering sign in, registration, password recovery, email verification, and password change.

### Matching Pages

**Per portal (6 pages × 3 portals = 18 files):**

- `customer/auth-login.html`, `admin/auth-login.html`, `organizer/auth-login.html`
- `customer/auth-register.html`, `admin/auth-register.html`, `organizer/auth-register.html`
- `customer/auth-forgot-password.html`, `admin/auth-forgot-password.html`, `organizer/auth-forgot-password.html`
- `customer/auth-reset-password.html`, `admin/auth-reset-password.html`, `organizer/auth-reset-password.html`
- `customer/auth-email-verify.html`, `admin/auth-email-verify.html`, `organizer/auth-email-verify.html`
- `customer/auth-change-password.html`, `admin/auth-change-password.html`, `organizer/auth-change-password.html`

### Coverage

✅ Complete

**Implemented:**
- Login: email + password form, "Remember me" toggle, "Forgot password?" link, "Sign up" link
- Register: Full name, Email, Password, Confirm password; Customer/Organization tabs in customer portal
- Forgot password: Email input, submit
- Reset password: New password + confirm
- Email verification: 6-digit code input, "Check your email" instructional text
- Change password (authenticated): Old password, new password, confirm
- All pages have consistent layout: centered card, logo link back to site, footer

**Missing (client-side):**
- Customer register has role tabs (Customer/Organization); admin and organizer register pages do not have tabs (direct form)
- Registration with Organization Name field only present in customer portal variant

### Style

Authentication

---

## Customer Dashboard

**Feature Description:** Authenticated customer's home page showing a welcome greeting, upcoming event count, upcoming bookings, recent activity, recommendations, and quick action buttons.

### Matching Pages

- `customer/index.html`

### Coverage

✅ Complete

**Implemented:**
- Hero summary card with "Welcome back, Ahmed!" and "2 upcoming events" stat
- "My Upcoming Bookings" horizontal scroll (5 event cards with artwork, date corner tag, hover-reveal title/venue)
- "Recent Activity" vertical list (purchases, confirmations, cancellations, wishlist items)
- "Recommended for You" horizontal scroll (5 event suggestions)
- "Quick Actions" buttons: Browse Events, View My Tickets, Contact Support

### Style

Customer Dashboard

---

## Event Discovery & Browsing

**Feature Description:** Browse and search events with category and date filters, featured event hero, popular and upcoming event grids.

### Matching Pages

- `customer/events.html`

### Coverage

✅ Complete

**Implemented:**
- Search input, category dropdown (Music/Sports/Theatre/Conference/Food), date filter dropdown
- Featured event hero card with artwork, tags, description, "Get Tickets" CTA
- "Popular This Week" horizontal scroll (6 event cards linking to event-detail.html)
- "Upcoming Events" grid (6 cards with badge, title, date/venue, price, "View Details" button)
- Navigation: Events tab active, links to Tickets, Dashboard, Profile

### Style

Customer

---

## Event Detail

**Feature Description:** Full event page with ticket-stub hero, about description, lineup/artists, venue info, ticket tiers sidebar, share options, and similar events.

### Matching Pages

- `customer/event-detail.html`

### Coverage

✅ Complete

**Implemented:**
- "Back to Events" link
- Ticket-stub hero with artwork, date/time/venue, stub details (price tier, category, duration), "Get Tickets" CTA
- "About this event" description section
- "Lineup" artist list (name, stage, time) with avatar placeholders
- "Venue" info (location, capacity, doors open)
- Sidebar: "Ticket tiers" (VIP EGP 1,500 with perks; Standard EGP 450), "Share event" (Copy link / Share buttons)
- "Similar events" horizontal scroll row

### Style

Customer

---

## Zone Selection / Purchase

**Feature Description:** Select ticket zone for zone-based events, view zone map, availability, quantity controls, and proceed to checkout.

### Matching Pages

- `customer/zone-purchase.html`
- `customer/availability.html` (supplementary seat/availability view)

### Coverage

🟡 Partial

**Implemented:**
- Zone map visualization: STAGE, VIP (120 spots), Standard A (340), Standard B (280), General (500)
- Legend: Available / Selected / Limited / Sold out
- Sidebar: "Your selection" with zone name, availability, price, quantity +/- controls, timer lock warning, total price, "Clear selection" and "Continue to checkout" buttons
- "Zone info" list with all zone prices

**Missing (in mockups vs. client-side):**
- No dedicated "availability check" page in client-side routes (mockup has `availability.html` for checking seat/venue availability before purchase)
- Zone purchase in client-side navigates to `/customer/booking/checkout`, mockup links to `payment.html`
- No loading/empty/error states in mockup

### Style

Customer

---

## Seat Selection

**Feature Description:** Interactive seat map for seat-based events, allowing customers to pick specific seats and view their selection summary.

### Matching Pages

- `customer/availability.html`

### Coverage

✅ Complete

**Implemented:**
- Visual seat map: Rows A-F, seat labels, dots for Available/Selected/Taken/Accessible, Stage area
- Legend
- Sidebar: "Seat Selection Summary" with selected seats, count, timer lock, total price, "Clear selection" and "Continue to checkout" buttons

**Note:** Client-side implements this as `EventSelect.tsx` using `SeatPicker` component. Mockup renders it as a standalone availability checker with event/venue/date selectors.

### Style

Customer

---

## Checkout & Payment

**Feature Description:** Order summary, payment form with credit card or mock payment, billing address, and payment history.

### Matching Pages

- `customer/payment.html`

### Coverage

✅ Complete

**Implemented:**
- Order summary ticket-stub card (event name, ticket type, quantity, price, gate opens time)
- "Payment details" form: Contact info (Email, Phone), Payment method tabs (Credit card / Mock payment), Card details (number, expiry, CVC, cardholder name), Billing address (Country, City, Address, ZIP)
- "Pay EGP 3,000" primary CTA button
- "Order summary" sidebar (line items: VIP × 2, Service fee, Tax, Total, VAT note)
- "Payment history" table (5 transactions with Date, Order ID, Description, Amount, Method, Status badges)

**Note:** Client-side uses Stripe Elements for actual payment; mockup shows a traditional card form. The Stripe integration is a runtime detail not reflected in the static HTML mockup.

### Style

Customer

---

## Payment Success / Cancellation

**Feature Description:** Post-payment result pages showing success confirmation or cancellation notice.

### Matching Pages

- None dedicated. `customer/payment.html` contains the payment form but no success/cancel views.

### Coverage

❌ Missing

**Client-side implementation:**
- `PaymentSuccess.tsx` — checkmark icon, event title, seat info, total, "View My Tickets" and "Browse Events" CTAs
- `PaymentCancel.tsx` — X icon, message "No charges have been made", "Try Again" and "Browse Events" CTAs

**Suggested pages:**
- `customer/payment-success.html`
- `customer/payment-cancel.html`

---

## Ticket Management — List

**Feature Description:** List all user tickets grouped by reservation/event with status badges and quick-action links.

### Matching Pages

- `customer/tickets.html`

### Coverage

✅ Complete

**Implemented:**
- "My Tickets" heading with count badge "3 upcoming"
- Reservation list (3 reservation cards): each shows event name, date/time, venue, ticket count, total price, status badge (Confirmed/Pending), "View Tickets" action button
- Status badge color coding: Confirmed (green), Pending (orange), Cancelled (red)
- "View Tickets" links to `ticket-detail.html#res-{id}` using CSS `:target` deep-linking

### Style

Customer

---

## Ticket Management — Detail

**Feature Description:** Individual ticket view showing ticket cards with QR codes, seat/zone details, and event info.

### Matching Pages

- `customer/ticket-detail.html`

### Coverage

✅ Complete

**Implemented:**
- "Back to My Tickets" link
- Multiple ticket groups (per reservation) shown via CSS `:target` mechanism
- Each group: event name, date/time, venue, status badge
- Ticket cards: badge (VIP/Regular/Balcony), Row, Seat, Price, QR art placeholder, ticket ID code
- QR code: CSS-only decorative placeholder (101×101px grid pattern with finder squares)
- Ticket stub notch effect (semicircle cutouts)
- Responsive grid: 2 columns desktop, 1 column mobile

### Style

Customer

---

## Reservation Timeline

**Feature Description:** Timeline-style list of all reservations showing status progression.

### Matching Pages

- None

### Coverage

❌ Missing

**Client-side implementation:**
- `Reservations.tsx` — timeline list with colored dots, connector lines, event cards with status badges

**Suggested pages:**
- `customer/reservations.html`

---

## Refunds (Customer)

**Feature Description:** Request a refund for an order and view refund history.

### Matching Pages

- `customer/refunds.html`

### Coverage

✅ Complete

**Implemented:**
- "Request a refund" form: Order ID input, Reason textarea, Submit button
- "My refund history" table: Refund ID, Order ID, Event, Amount, Reason, Status badges (Approved/Pending), Date
- Stats row: Total requests (4), Pending (2), Amount refunded (EGP 3,450)

### Style

Customer

---

## Profile (Customer)

**Feature Description:** View and edit user profile, change password, deactivate account.

### Matching Pages

- `customer/profile.html`

### Coverage

✅ Complete

**Implemented:**
- Avatar, name, email, phone, location
- "Member since" date, "Customer" badge
- "Edit profile" button, "Change password" link to `auth-change-password.html`
- "Deactivate account" danger zone with warning text and button

### Style

Customer

---

## Settings (Customer)

**Feature Description:** Manage account settings, notification preferences, and security options.

### Matching Pages

- `customer/settings.html`

### Coverage

✅ Complete

**Implemented:**
- "Account Settings" card: Email (change link), Language (English/Arabic/French), Timezone dropdown
- "Notification Preferences" card: Email/SMS/Push/Marketing toggles
- "Security" card: Password (change password link), Two-factor authentication toggle

### Style

Customer

---

## Notifications

**Feature Description:** View and manage notifications across all portals.

### Matching Pages

- `customer/notifications.html`
- `admin/notifications.html`
- `organizer/notifications.html`

### Coverage

✅ Complete

**Implemented (consistent across all portals):**
- "Notifications" heading with unread count badge
- "Mark all as read" button
- Notification list (8 items with read/unread indicators): title, preview text, timestamp, "Mark read" button
- Portal-specific notification content: Customer (ticket confirmations, reminders), Admin (org requests, system alerts), Organizer (sales, approvals)

### Style

Shared

---

## Outlets

**Feature Description:** Find physical ticket outlet locations with search and city filtering.

### Matching Pages

- `customer/outlets.html`

### Coverage

✅ Complete

**Implemented:**
- Search input, city filter (All cities / Cairo / Alexandria / Giza / Sharm El Sheikh)
- Outlet grid by city: Cairo (4 outlets), Alexandria (2 outlets), Sharm El Sheikh (1 outlet)
- Each outlet card: building icon, name, location, hours, "Open Now" badge

**Note:** Client-side has this as a placeholder ("coming soon"), but mockup is fully designed.

### Style

Customer

---

## Contact Us

**Feature Description:** Contact form and support information.

### Matching Pages

- `customer/contact.html`

### Coverage

✅ Complete

**Implemented:**
- "Send us a message" form: Full name, Email, Subject dropdown (General inquiry / Ticket support / Refund request / Partnership / Other), Message textarea, "Send Message" button
- "Reach us directly" info cards: Email, Phone, Office address, Hours
- Footer

**Note:** Client-side has this as a placeholder ("coming soon"), but mockup is fully designed.

### Style

Customer

---

## Organizer Dashboard

**Feature Description:** Organizer's home page with greeting, stats, recent activity, upcoming events, and quick actions.

### Matching Pages

- `organizer/index.html`

### Coverage

✅ Complete

**Implemented:**
- Greeting: "Good morning, Alex", stat "12 Upcoming events this month"
- "Recent Activity" horizontal scroll (6 activity cards: purchases, transfers, connections, updates)
- "Upcoming Events" horizontal scroll (6 event cards with date artwork)
- "Quick Actions": Create Event, Browse Venues, Manage Tickets, Analytics

### Style

Organizer Dashboard

---

## Organizer Event Management

**Feature Description:** Full event management interface with search, filters, event details, ticket types, inventory, QR generation, and ticket validation.

### Matching Pages

- `organizer/events.html`

### Coverage

✅ Complete

**Implemented:**
- "Event Management" heading + "Create event" button
- Search + category + status filters
- Horizontal scroll event cards (6)
- Detailed event card: date, time, venue, category, tags, description, Edit/Unpublish/Delete buttons
- "Categories & Tags" management section
- "Ticket Types" table: type badge, price, available/total counts, status toggle
- "Inventory overview" stats: Total tickets, Sold, Available
- "QR Code & Barcode" section with placeholder QR, ticket ID, "Generate QR" button
- "Validate Ticket" section: search input + Validate button, VALID/INVALID result display

### Style

Organizer

---

## Organizer Event Creation

**Feature Description:** Create new events with basic info, event type (seat-based or zone-based), category selection, and tags.

### Matching Pages

- `organizer/create-event.html`

### Coverage

✅ Complete

**Implemented:**
- "Cancel" link back to events list
- "Basic Information": Event name, Event URL (auto-prefix), Description
- "Event Type" selection: Seat-Based (with venue/template selector and seat grid preview) or Zone-Based (info card)
- "Additional Settings": Category chips (Music/Sports/Theatre/Conference/Food/Arts/Family) with inline JS toggle, Tags input with pill rendering
- Action buttons: "Save as Draft" and "Create Event"
- Inline JavaScript for event type switching, category selection, and tag management

### Style

Organizer

---

## Organizer Venue Management

**Feature Description:** Manage venues with search, filters, cards, and CRUD operations.

### Matching Pages

- `organizer/venues.html`

### Coverage

✅ Complete

**Implemented:**
- "Create venue" button
- Search + status + capacity filters
- Horizontal scroll venue cards (6 with capacity/status badges)
- Venue table: Name, Location, Capacity, Status badges (Active/Inactive), Actions (Edit/Delete)

### Style

Organizer

---

## Organizer Venue Templates

**Feature Description:** Create and manage venue seating templates with visual seat map designer.

### Matching Pages

- `organizer/venue-templates.html`

### Coverage

✅ Complete

**Implemented:**
- "Create template" button
- Horizontal scroll template cards (6): Classic Theatre, Concert Bowl, Banquet Hall, Classroom Style, Outdoor Stage, VIP Lounge
- "Classic Theatre Layout" visual seat grid: full chart with Stage, Orchestra, Mezzanine, Balcony sections, aisles, legend
- Templates table: Template Name, Layout Type, Total Seats, Sections, Created date, Actions (Edit/Delete)

**Note:** Client-side implements this as an interactive seat map editor with drag-and-drop, undo/redo, category management. The mockup shows a static representation.

### Style

Organizer

---

## Organizer Analytics

**Feature Description:** Business analytics dashboard with revenue, sales, event performance, and customer metrics.

### Matching Pages

- `organizer/analytics.html`

### Coverage

✅ Complete

**Implemented:**
- Revenue summary: "EGP 284,500 this month", "12.3% up from last month"
- "Export report" button
- Analytics grid: Revenue bar chart, Ticket sales donut chart (Standard 58%, VIP 18%, Group 12%, Early Bird 12%), Event performance horizontal bars, Customer growth line chart, Organization analytics stat list, Payment methods pie chart

### Style

Organizer

---

## Organizer QR Scanner / Validation

**Feature Description:** Scan and validate tickets via camera or manual entry, view recent scans.

### Matching Pages

- `organizer/qr-scanner.html`

### Coverage

✅ Complete

**Implemented:**
- Event selector dropdown
- Camera scanner viewport: video element, overlay frame, scanning line animation, Start/Stop buttons
- No-camera fallback UI
- "Manual Entry" section: Ticket ID input + Validate button
- Validation result card: VALID/INVALID badge, ticket details (Event, Type, Row, Seat), timestamp
- "Recent Scans" table: Ticket ID, Event, Type, Status, Time
- Full inline JavaScript: camera access, mock ticket database, validation logic, scan history

**Note:** Client-side has this as a placeholder stub, but the mockup is fully functional with inline JS.

### Style

Organizer

---

## Organizer Organization Management

**Feature Description:** View and manage organization profile, members, stats, and employee accounts.

### Matching Pages

- `organizer/org-management.html`

### Coverage

✅ Complete

**Implemented:**
- Organization hero: name, since date, ACTIVE/ORGANIZER badges, contact info
- "Organization Details" grid: Registration #, Tax ID, Address, Website, Founded, Members count
- "Members" section: Add member form (name, email, role, Invite), Members table (avatar, email, role badge, status, Remove)
- "Organization Status": Current status badge, Verification badge
- "Generate Employee Accounts" section with description and button
- "Quick Stats": Total Events (24), Active Members (18), Revenue (EGP 142K)

### Style

Organizer

---

## Organizer Team Management

**Feature Description:** Manage organization team members with roles, statuses, and credentials.

### Matching Pages

- `organizer/org-members.html`

### Coverage

✅ Complete

**Implemented:**
- "Back to organization" link
- Search bar + tab filters (All / Agents / Consumers)
- Members table: #, Name, Email, Role badges (Agent/Consumer), Status badges (Active/Inactive), "View" credentials link, Actions (active/inactive toggles)
- "View generated credentials" collapsible card: Username, Password, Role, Copy link

### Style

Organizer

---

## Organizer Refunds

**Feature Description:** Process and track refund requests.

### Matching Pages

- `organizer/refunds.html`

### Coverage

✅ Complete

**Implemented:**
- "Request a refund" form: Order ID, Reason
- "Refund history" table: Refund ID, Order ID, Customer, Amount, Reason, Status, Date, Actions (Approve/Reject)
- Stats row: Total refunds, Pending, Amount refunded

### Style

Organizer

---

## Organizer Profile

**Feature Description:** View and edit organizer profile, manage organization link, deactivate account.

### Matching Pages

- `organizer/profile.html`

### Coverage

✅ Complete

**Implemented:**
- Avatar, name, email, phone, company, "Member since" date, "Organizer" badge
- "Edit profile", "Manage Organization" (to `org-management.html`), "Change password" (to `auth-change-password.html`)
- "Danger zone": Deactivate account

### Style

Organizer

---

## Organizer Settings

**Feature Description:** Account, organization, notification, and security settings.

### Matching Pages

- `organizer/settings.html`

### Coverage

✅ Complete

**Implemented:**
- "Account settings": Email, Name, Language, Timezone
- "Organization settings": Name, Type, "Manage organization" link
- "Notification preferences": New bookings, Cancellations, Weekly reports, Marketing toggles
- "Security": Password change link, Two-factor auth toggle

### Style

Organizer

---

## Admin Dashboard

**Feature Description:** Admin overview with pending organization requests, recent users, and quick stats.

### Matching Pages

- `admin/index.html`

### Coverage

✅ Complete

**Implemented:**
- "Admin Panel" summary card: "24 Pending organization requests"
- "Organization Requests" table: search/status filter, 5 pending orgs with Approve/Ban buttons
- "Recent Users" horizontal scroll (6 user cards with name/role)

### Style

Admin Dashboard

---

## Admin Event Oversight

**Feature Description:** Admin view of all events with approval/flagging/removal actions.

### Matching Pages

- `admin/events.html`

### Coverage

✅ Complete

**Implemented:**
- Stats: "24 Total / 4 Pending / 2 Flagged"
- Search + category + status filters
- Events table: Event name, Organizer, Date, Status badges (Published/Pending/Flagged), Actions (Approve/Flag/Remove)

### Style

Admin

---

## Admin Venue Oversight

**Feature Description:** Admin view of all venues with verification/flagging/disable actions.

### Matching Pages

- `admin/venues.html`

### Coverage

✅ Complete

**Implemented:**
- Stats: "18 Total / 3 Pending"
- Search + status filter
- Horizontal scroll venue cards (6 with name/capacity/badge)
- Venue table: Name, Organizer, Location, Capacity, Status badges (Active/Pending/Flagged/Disabled), Actions (Verify/Flag/Disable)

### Style

Admin

---

## Admin Organization Management

**Feature Description:** Admin management of all organizations with approval/suspension/ban actions.

### Matching Pages

- `admin/org-management.html`

### Coverage

✅ Complete

**Implemented:**
- Stats: "18 Total / 6 Pending / 2 Banned"
- Search + status filter
- Organizations table: Name, Head, Email, Events count, Status badges (Pending/Active/Banned), Actions (Approve/Reject, Verify/Suspend, Reinstate/Ban)

**Note:** Client-side splits this into `OrganizationsManagement` (list with ban/unban) and `OrganizationApproval` (approve/reject cards). The mockup combines both into one table.

### Style

Admin

---

## Admin System Monitoring

**Feature Description:** System health dashboard with service status, metrics, and observability links.

### Matching Pages

- `admin/system-monitoring.html`

### Coverage

✅ Complete

**Implemented:**
- "System Health" status: "All Services Operational" / "1 Degraded", 99.97% uptime
- "Service Status" cards (6): API Gateway, Auth Service, Payment Service, Kafka Stream, PostgreSQL, Redis Cache with uptime/latency
- "Key Metrics" bar charts: Requests/min, Error rate, Avg response, Active users
- "Recent Logs" viewer with auto-refresh toggle (8 log lines, INFO/WARN/ERROR)
- "Observability" links: Prometheus, Grafana, Loki

### Style

Admin

---

## Admin Audit Logs

**Feature Description:** Filterable audit log of all system actions with pagination.

### Matching Pages

- `admin/audit-logs.html`

### Coverage

✅ Complete

**Implemented:**
- Date range filter (from/to), User filter, Action filter (Login/Logout/Create/Update/Delete/Payment)
- Apply / Reset buttons
- Audit log table: Timestamp, User, Action badges, Details with "View" link, IP Address, Status icons
- Pagination: "Showing 1-10 of 247", page 1-3...25

### Style

Admin

---

## Admin Refunds

**Feature Description:** Process and manage refund requests across the platform.

### Matching Pages

- `admin/refunds.html`

### Coverage

✅ Complete

**Implemented:**
- "Request a refund" form: Order ID, Reason
- "Refund history" table: Refund ID, Order ID, Customer, Amount, Reason, Status badges (Approved/Pending/Rejected), Date, Actions (Approve/Reject)
- Stats row: Total refunds, Pending, Amount refunded

### Style

Admin

---

## Admin User Management

**Feature Description:** Manage platform users.

### Matching Pages

- None

### Coverage

❌ Missing

**Client-side implementation:**
- `UserManagement.tsx` — placeholder stub

**Note:** No dedicated admin user management page exists in the UI/UX mockups. The `admin/org-management.html` focuses on organizations, not individual users.

**Suggested pages:**
- `admin/user-management.html`

---

## Admin Profile

**Feature Description:** Admin profile view with system links.

### Matching Pages

- `admin/profile.html`

### Coverage

✅ Complete

**Implemented:**
- Admin user profile: Avatar, name, email, "Platform Administrator" badge, member since date
- Profile links: "System Settings", "View Audit Logs", "Change password"

### Style

Admin

---

## Admin Settings

**Feature Description:** Account, security, system settings, and notification preferences for admins.

### Matching Pages

- `admin/settings.html`

### Coverage

✅ Complete

**Implemented:**
- "Account Settings": Email, Name, Language, Timezone
- "Security Settings": Password change, Two-factor auth, Active sessions list with Revoke
- "System Settings": Default language, Maintenance mode toggle, Allow new registrations toggle, links to Monitoring and Audit Logs
- "Notification Preferences": New org requests, System alerts, Error reports, Weekly summary toggles

### Style

Admin

---

## Error Pages

**Feature Description:** Standard HTTP error pages for all portals.

### Matching Pages

**Per portal (4 pages × 3 portals = 12 files):**

- `customer/401.html`, `admin/401.html`, `organizer/401.html`
- `customer/403.html`, `admin/403.html`, `organizer/403.html`
- `customer/404.html`, `admin/404.html`, `organizer/404.html`
- `customer/500.html`, `admin/500.html`, `organizer/500.html`

### Coverage

✅ Complete

**Implemented (consistent design across all portals):**
- Error notch decorative graphic
- Monospace subtitle (UNAUTHORIZED / FORBIDDEN / PAGE NOT FOUND / SERVER ERROR)
- Large error code (401 / 403 / 404 / 500) in Bebas Neue
- Descriptive message
- "Back to home" CTA button

### Style

Shared / Error

---

# Page → Feature Mapping

## Root

---

### `landing.html`

**Features:**
- Landing page / marketing home
- Portal selection (Customer, Organizer, Admin)
- Featured event showcase
- Category browsing

**Style:** Public / Marketing

**Related Pages:**
- `customer/auth-login.html`
- `customer/events.html`
- `customer/outlets.html`
- `customer/contact.html`

---

## Customer Portal

---

### `customer/index.html`

**Features:**
- Customer dashboard
- Upcoming bookings preview
- Recent activity feed
- Event recommendations
- Quick actions (Browse Events, View Tickets, Contact Support)

**Style:** Customer Dashboard

**Related Pages:**
- `customer/events.html`
- `customer/tickets.html`
- `customer/profile.html`

---

### `customer/events.html`

**Features:**
- Event discovery & browsing
- Search events
- Category filter
- Date filter
- Featured event hero
- Popular events row
- Upcoming events grid

**Style:** Customer

**Related Pages:**
- `customer/event-detail.html`
- `customer/zone-purchase.html`

---

### `customer/event-detail.html`

**Features:**
- Event detail view
- Ticket-stub hero
- About event description
- Lineup / artists
- Venue information
- Ticket tiers sidebar
- Share event
- Similar events
- "Get Tickets" CTA

**Style:** Customer

**Related Pages:**
- `customer/events.html`
- `customer/zone-purchase.html`
- `customer/availability.html`

---

### `customer/zone-purchase.html`

**Features:**
- Zone-based ticket selection
- Zone map visualization
- Quantity controls with +/- stepper
- Timer lock warning
- Price calculation
- "Continue to checkout" CTA

**Style:** Customer

**Related Pages:**
- `customer/event-detail.html`
- `customer/payment.html`
- `customer/availability.html`

---

### `customer/availability.html`

**Features:**
- Seat availability checker
- Interactive seat map
- Seat selection summary
- Event/venue/date selectors
- "Continue to checkout" CTA

**Style:** Customer

**Related Pages:**
- `customer/zone-purchase.html`
- `customer/payment.html`

---

### `customer/payment.html`

**Features:**
- Order summary
- Payment form (credit card / mock)
- Billing address
- Payment history
- "Pay" button

**Style:** Customer

**Related Pages:**
- `customer/zone-purchase.html`
- `customer/availability.html`
- `customer/tickets.html`

---

### `customer/tickets.html`

**Features:**
- My tickets list
- Reservation cards with status badges
- "View Tickets" deep-link to detail
- Upcoming count

**Style:** Customer

**Related Pages:**
- `customer/ticket-detail.html`

---

### `customer/ticket-detail.html`

**Features:**
- Ticket detail view
- QR code display (CSS art)
- Ticket ID
- Seat/zone information
- Multiple ticket cards per reservation
- "Back to My Tickets" navigation

**Style:** Customer

**Related Pages:**
- `customer/tickets.html`

---

### `customer/refunds.html`

**Features:**
- Request a refund form
- Refund history table
- Refund stats (total, pending, amount refunded)

**Style:** Customer

**Related Pages:**
- `customer/tickets.html`
- `customer/contact.html`

---

### `customer/profile.html`

**Features:**
- View profile
- Edit profile
- Change password link
- Deactivate account

**Style:** Customer

**Related Pages:**
- `customer/auth-change-password.html`
- `customer/settings.html`

---

### `customer/settings.html`

**Features:**
- Account settings (email, language, timezone)
- Notification preferences (email, SMS, push, marketing)
- Security (password, two-factor auth)

**Style:** Customer

**Related Pages:**
- `customer/auth-change-password.html`
- `customer/profile.html`

---

### `customer/notifications.html`

**Features:**
- Notification list
- Read/unread indicators
- Mark all as read
- Per-notification mark read

**Style:** Shared

**Related Pages:**
- `customer/index.html`

---

### `customer/outlets.html`

**Features:**
- Physical outlet directory
- Search by city
- Outlet cards with hours, location, status

**Style:** Customer

**Related Pages:**
- `customer/contact.html`

---

### `customer/contact.html`

**Features:**
- Contact form
- Support information (email, phone, office, hours)

**Style:** Customer

**Related Pages:**
- `customer/outlets.html`

---

### `customer/auth-login.html`

**Features:**
- User login
- "Remember me" toggle
- "Forgot password" link
- "Sign up" link

**Style:** Authentication

**Related Pages:**
- `customer/auth-register.html`
- `customer/auth-forgot-password.html`

---

### `customer/auth-register.html`

**Features:**
- User registration
- Customer / Organization role tabs
- Full name, email, password, confirm password

**Style:** Authentication

**Related Pages:**
- `customer/auth-login.html`

---

### `customer/auth-forgot-password.html`

**Features:**
- Forgot password request

**Style:** Authentication

**Related Pages:**
- `customer/auth-reset-password.html`
- `customer/auth-login.html`

---

### `customer/auth-reset-password.html`

**Features:**
- Reset password form

**Style:** Authentication

**Related Pages:**
- `customer/auth-login.html`

---

### `customer/auth-email-verify.html`

**Features:**
- Email verification code input (6-digit)

**Style:** Authentication

**Related Pages:**
- `customer/auth-login.html`

---

### `customer/auth-change-password.html`

**Features:**
- Change password (authenticated)

**Style:** Authentication

**Related Pages:**
- `customer/profile.html`
- `customer/settings.html`

---

### `customer/401.html`, `403.html`, `404.html`, `500.html`

**Features:**
- HTTP error pages (Unauthorized, Forbidden, Not Found, Server Error)

**Style:** Shared / Error

**Related Pages:**
- `landing.html`

---

## Admin Portal

---

### `admin/index.html`

**Features:**
- Admin dashboard
- Pending organization requests table
- Recent users scroll

**Style:** Admin Dashboard

**Related Pages:**
- `admin/org-management.html`
- `admin/events.html`

---

### `admin/events.html`

**Features:**
- Event oversight
- Approve / Flag / Remove events
- Search and filter events

**Style:** Admin

**Related Pages:**
- `admin/venues.html`

---

### `admin/venues.html`

**Features:**
- Venue oversight
- Verify / Flag / Disable venues
- Search and filter venues

**Style:** Admin

**Related Pages:**
- `admin/events.html`

---

### `admin/org-management.html`

**Features:**
- Organization management
- Approve / Reject / Ban organizations
- Search and filter

**Style:** Admin

**Related Pages:**
- `admin/index.html`

---

### `admin/system-monitoring.html`

**Features:**
- System health dashboard
- Service status cards
- Key metrics charts
- Recent logs viewer
- Observability links

**Style:** Admin

**Related Pages:**
- `admin/audit-logs.html`

---

### `admin/audit-logs.html`

**Features:**
- Audit log viewer
- Date/user/action filters
- Paginated log table

**Style:** Admin

**Related Pages:**
- `admin/system-monitoring.html`

---

### `admin/refunds.html`

**Features:**
- Refund management
- Approve / Reject refunds
- Refund history

**Style:** Admin

**Related Pages:**
- `admin/events.html`

---

### `admin/profile.html`

**Features:**
- Admin profile view
- Links to system settings, audit logs

**Style:** Admin

**Related Pages:**
- `admin/settings.html`
- `admin/auth-change-password.html`

---

### `admin/settings.html`

**Features:**
- Account settings
- Security settings (password, 2FA, sessions)
- System settings (maintenance mode, registration toggle)
- Notification preferences

**Style:** Admin

**Related Pages:**
- `admin/system-monitoring.html`
- `admin/audit-logs.html`
- `admin/auth-change-password.html`

---

### `admin/notifications.html`

**Features:**
- Notification list (admin-specific content)
- Mark read / mark all read

**Style:** Shared

**Related Pages:**
- `admin/index.html`

---

### `admin/auth-*.html` (6 pages)

**Style:** Authentication

**(Duplicate of customer auth patterns)**

---

### `admin/4*.html`, `500.html`

**Style:** Shared / Error

---

## Organizer Portal

---

### `organizer/index.html`

**Features:**
- Organizer dashboard
- Recent activity
- Upcoming events
- Quick actions

**Style:** Organizer Dashboard

**Related Pages:**
- `organizer/events.html`
- `organizer/venues.html`
- `organizer/analytics.html`

---

### `organizer/events.html`

**Features:**
- Event management
- Event CRUD
- Ticket types management
- Inventory overview
- QR code generation
- Ticket validation

**Style:** Organizer

**Related Pages:**
- `organizer/create-event.html`
- `organizer/qr-scanner.html`

---

### `organizer/create-event.html`

**Features:**
- Event creation form
- Seat-based / zone-based event type
- Category and tag selection

**Style:** Organizer

**Related Pages:**
- `organizer/events.html`

---

### `organizer/venues.html`

**Features:**
- Venue management
- Create / Edit / Delete venues
- Search and filter

**Style:** Organizer

**Related Pages:**
- `organizer/venue-templates.html`

---

### `organizer/venue-templates.html`

**Features:**
- Venue template management
- Seat map designer (static visualization)
- Template CRUD

**Style:** Organizer

**Related Pages:**
- `organizer/venues.html`
- `organizer/events.html`

---

### `organizer/analytics.html`

**Features:**
- Revenue analytics
- Ticket sales breakdown
- Event performance
- Customer growth
- Payment methods

**Style:** Organizer

**Related Pages:**
- `organizer/index.html`
- `organizer/events.html`

---

### `organizer/qr-scanner.html`

**Features:**
- QR code scanning (camera)
- Manual ticket validation
- Recent scans log
- Valid/invalid result display

**Style:** Organizer

**Related Pages:**
- `organizer/events.html`

---

### `organizer/org-management.html`

**Features:**
- Organization profile
- Member management
- Employee account generation
- Quick stats

**Style:** Organizer

**Related Pages:**
- `organizer/org-members.html`
- `organizer/profile.html`

---

### `organizer/org-members.html`

**Features:**
- Team member management
- Role filtering
- Credential viewing

**Style:** Organizer

**Related Pages:**
- `organizer/org-management.html`

---

### `organizer/refunds.html`

**Features:**
- Refund management
- Approve / Reject refunds

**Style:** Organizer

**Related Pages:**
- `organizer/events.html`

---

### `organizer/profile.html`

**Features:**
- Organizer profile
- Manage organization link
- Deactivate account

**Style:** Organizer

**Related Pages:**
- `organizer/org-management.html`
- `organizer/auth-change-password.html`

---

### `organizer/settings.html`

**Features:**
- Account settings
- Organization settings
- Notification preferences
- Security settings

**Style:** Organizer

**Related Pages:**
- `organizer/org-management.html`
- `organizer/auth-change-password.html`

---

### `organizer/notifications.html`

**Features:**
- Notifications (organizer-specific content)

**Style:** Shared

**Related Pages:**
- `organizer/index.html`

---

### `organizer/auth-*.html` (6 pages)

**Style:** Authentication

---

### `organizer/4*.html`, `500.html`

**Style:** Shared / Error

---

# Folder Organization

```
ui-ux/
├── landing.html
├── ticket-feature.md
├── design (1).md
├── css/
│   └── ticketsmarche.css                  # Shared design system
│
├── src/
│   └── components/
│       ├── display/
│       │   ├── ArtPattern/
│       │   ├── Avatar/
│       │   ├── Badge/
│       │   ├── Card/
│       │   ├── QRCode/
│       │   └── Table/
│       ├── form/
│       │   ├── Button/
│       │   ├── Countdown/
│       │   ├── Input/
│       │   ├── Modal/
│       │   ├── QuantityStepper/
│       │   ├── Select/
│       │   └── Toggle/
│       ├── layout/
│       │   ├── FilterBar/
│       │   ├── Footer/
│       │   ├── Header/
│       │   ├── HorizontalScroll/
│       │   └── Sidebar/
│       └── ticket/
│           ├── EventCard/
│           ├── FeaturedEvent/
│           ├── OrderHero/
│           ├── SeatMap/
│           ├── TicketCard/
│           ├── TicketHero/
│           └── ZoneMap/
│
├── customer/
│   ├── index.html                        # Dashboard
│   ├── events.html                       # Event discovery
│   ├── event-detail.html                 # Event detail
│   ├── zone-purchase.html                # Zone selection
│   ├── availability.html                 # Seat availability / seat map
│   ├── payment.html                      # Checkout / Payment
│   ├── tickets.html                      # My Tickets list
│   ├── ticket-detail.html                # Ticket detail
│   ├── refunds.html                      # Refund request + history
│   ├── profile.html                      # User profile
│   ├── settings.html                     # User settings
│   ├── notifications.html                # Notifications
│   ├── outlets.html                      # Physical outlets
│   ├── contact.html                      # Contact / Support
│   ├── auth-login.html
│   ├── auth-register.html
│   ├── auth-forgot-password.html
│   ├── auth-reset-password.html
│   ├── auth-email-verify.html
│   ├── auth-change-password.html
│   ├── 401.html
│   ├── 403.html
│   ├── 404.html
│   ├── 500.html
│   └── css/
│
├── admin/
│   ├── index.html                        # Admin dashboard
│   ├── events.html                       # Event oversight
│   ├── venues.html                       # Venue oversight
│   ├── org-management.html               # Organization management
│   ├── system-monitoring.html            # System health
│   ├── audit-logs.html                   # Audit logs
│   ├── refunds.html                      # Refund management
│   ├── profile.html                      # Admin profile
│   ├── settings.html                     # Admin settings
│   ├── notifications.html                # Notifications
│   ├── auth-login.html
│   ├── auth-register.html
│   ├── auth-forgot-password.html
│   ├── auth-reset-password.html
│   ├── auth-email-verify.html
│   ├── auth-change-password.html
│   ├── 401.html
│   ├── 403.html
│   ├── 404.html
│   ├── 500.html
│   └── css/
│
└── organizer/
    ├── index.html                        # Organizer dashboard
    ├── events.html                       # Event management
    ├── create-event.html                 # Event creation
    ├── analytics.html                    # Analytics
    ├── venues.html                       # Venue management
    ├── venue-templates.html              # Venue template designer
    ├── org-management.html               # Organization management
    ├── org-members.html                  # Team members
    ├── qr-scanner.html                   # QR validation
    ├── refunds.html                      # Refund management
    ├── profile.html                      # Organizer profile
    ├── settings.html                     # Organizer settings
    ├── notifications.html                # Notifications
    ├── auth-login.html
    ├── auth-register.html
    ├── auth-forgot-password.html
    ├── auth-reset-password.html
    ├── auth-email-verify.html
    ├── auth-change-password.html
    ├── 401.html
    ├── 403.html
    ├── 404.html
    ├── 500.html
    └── css/
```

---

# Style Analysis

## Public / Marketing

**Used by:** `landing.html`

**Theme:**
- Full-page marketing layout
- Ticket-stub hero card with artwork panel + info stub
- Horizontal scroll event rows with hover-reveal cards
- Portal selection cards with SVG icons
- Sticky nav with transparent blur background
- Bold Bebas Neue hero titles (64px)
- Yellow accent (primary CTA, price, logo dot)
- Footer with 3-column link layout
- Responsive: single breakpoint at 860px

**Design System:** TicketsMarche v2

---

## Authentication

**Used by:** All `auth-*.html` pages in every portal

**Theme:**
- Centered single-card layout
- Clean white background with minimal decoration
- Logo link top-left
- Form inputs with border styling
- Role tabs (register: Customer / Organization)
- Compact footer
- Password show/hide toggle
- "Remember me" toggle
- 6-digit code input for email verification
- Consistent spacing and typography

---

## Customer Dashboard

**Used by:** `customer/index.html`

**Theme:**
- Hero summary card (dark ink background, big stat number)
- Horizontal scroll rows for bookings and recommendations
- Vertical activity feed list
- Quick action button row
- Nav: Events, Tickets, Dashboard, Profile

---

## Customer

**Used by:**
- `customer/events.html`
- `customer/event-detail.html`
- `customer/zone-purchase.html`
- `customer/availability.html`
- `customer/payment.html`
- `customer/tickets.html`
- `customer/ticket-detail.html`
- `customer/refunds.html`
- `customer/profile.html`
- `customer/settings.html`
- `customer/outlets.html`
- `customer/contact.html`

**Theme:**
- Consistent sticky nav with 4 links (Events, Tickets, Dashboard, Profile)
- Nav actions: Notifications, Settings, Avatar
- Card-based layouts on white backgrounds
- Ticket-stub hero on event detail pages
- Horizontal scroll for event and item collections
- Tables for data (payment history, refund history)
- Status badges (green=confirmed/active, orange=pending, red=cancelled/error)
- Yellow primary buttons, ghost secondary buttons
- Full footer with Discover / Support / Company columns
- Responsive: 860px breakpoint, mobile nav collapse

---

## Organizer Dashboard

**Used by:** `organizer/index.html`

**Theme:**
- Hero summary card (greeting + stat)
- Activity cards in horizontal scroll (icon + text + timestamp)
- Upcoming events horizontal scroll
- Quick action grid (Create Event, Browse Venues, Manage Tickets, Analytics)
- Nav: Events, Venues, Organization, Dashboard, Profile

---

## Organizer

**Used by:**
- `organizer/events.html`
- `organizer/create-event.html`
- `organizer/venues.html`
- `organizer/venue-templates.html`
- `organizer/analytics.html`
- `organizer/qr-scanner.html`
- `organizer/org-management.html`
- `organizer/org-members.html`
- `organizer/refunds.html`
- `organizer/profile.html`
- `organizer/settings.html`

**Theme:**
- Data-heavy management interfaces
- Tables with action links (Edit, Delete, Approve, Reject)
- Horizontal scroll cards for events, venues, templates
- Event creation form with rich inputs (radio cards, category chips, tag pills)
- Analytics dashboard with multiple chart types (bar, donut, line, pie)
- QR scanner with camera viewport + manual entry fallback
- Organization management with member table + role badges
- Seat map designer (visual grid with sections, aisles, legend)
- Inline JavaScript for interactive features (event type toggle, camera access, validation)

---

## Admin Dashboard

**Used by:** `admin/index.html`

**Theme:**
- Summary card: "Admin Panel" label + stat
- Organization requests table with approve/ban actions
- Recent users horizontal scroll
- Nav: Dashboard, Events, Venues, Organizations, Monitoring, Audit Logs, Profile

---

## Admin

**Used by:**
- `admin/events.html`
- `admin/venues.html`
- `admin/org-management.html`
- `admin/system-monitoring.html`
- `admin/audit-logs.html`
- `admin/refunds.html`
- `admin/profile.html`
- `admin/settings.html`

**Theme:**
- Data-heavy oversight tables
- Stats headers (total / pending / flagged counts)
- Filter bars with search + dropdowns
- System monitoring: service status cards, metric bars, log viewer
- Audit logs: date range filters, action type filters, pagination
- Refund management with approve/reject actions
- Settings include system-level toggles (maintenance mode, registration control)
- Active sessions management with revoke capability

---

## Shared / Error

**Used by:** All `4*.html` and `500.html` across all portals

**Theme:**
- Minimalist error display
- Decorative notch graphic
- Monospace subtitle (uppercase)
- Large error code in Bebas Neue (72px+)
- Descriptive message in body text
- Single "Back to home" yellow CTA button
- Consistent across all three portals

---

# Shared Components

Components reused across multiple pages, organized by source.

## From `css/ticketsmarche.css` (Global Design System)

| Component | CSS Class | Used By |
|-----------|-----------|---------|
| Navigation / Header | `header`, `.nav`, `.logo`, `.nav-links`, `.nav-actions` | All pages |
| Footer | `footer` | All pages |
| Primary Button | `.btn`, `.btn-primary` | All pages |
| Ghost Button | `.btn-ghost` | All pages |
| Danger Button | `.btn-danger` | All pages |
| Small Button | `.btn-sm` | Various |
| Badge — Green | `.badge-green` | Confirmed/Active status |
| Badge — Orange | `.badge-orange` | Pending/Used status |
| Badge — Red | `.badge-red` | Cancelled/Invalid/Error |
| Badge — Yellow | `.badge-yellow` | VIP ticket type |
| Badge — Ink | `.badge-ink` | Regular ticket type |
| Card White | `.card-white` | Forms, settings, detail sections |
| Form Input | `.form-input` | All forms |
| Form Select | `.form-select` | Filters, dropdowns |
| Search Bar | `.search-bar` | Events, Venues, Orgs lists |
| Toggle | `.toggle` | Settings, preferences |
| Avatar | `.avatar`, `.avatar-sm` | All portals |
| Container | `.wrap` | All pages (max-width 1320px) |
| Table | `.table` | Admin and organizer tables |
| Display Font | `.display` (Bebas Neue) | Hero titles, prices |
| Mono Font | `.mono` (IBM Plex Mono) | Dates, codes, labels |

## From `src/components/` (Design Components Folder)

| Component Category | Components | Purpose |
|-------------------|------------|---------|
| **Layout** | Header, Footer, Sidebar, HorizontalScroll, FilterBar | Page structure |
| **Display** | ArtPattern, Avatar, Badge, Card, QRCode, Table | Visual elements |
| **Form** | Button, Input, Select, Toggle, Modal, QuantityStepper, Countdown | Interactive controls |
| **Ticket** | EventCard, FeaturedEvent, OrderHero, SeatMap, TicketCard, TicketHero, ZoneMap | Domain-specific |

## Portal-Specific Components

### Customer Portal
- Reservation card (`.res-card`, `.reservation-list`) — `tickets.html`, `ticket-detail.html`
- Zone map — `zone-purchase.html`
- Seat map — `availability.html`
- Payment form — `payment.html`
- Outlet card — `outlets.html`

### Admin Portal
- Service status card — `system-monitoring.html`
- Audit log table — `audit-logs.html`
- Metric charts — `system-monitoring.html`

### Organizer Portal
- Event card (detailed) — `events.html`
- Analytics charts — `analytics.html`
- QR scanner viewport — `qr-scanner.html`
- Seat map designer — `venue-templates.html`
- Member table — `org-management.html`, `org-members.html`

---

# Missing Features

Features from the client-side implementation that do not have corresponding UI/UX mockup pages.

## Payment Success Page

**Feature:** Post-payment confirmation with order summary and navigation to tickets.

**Suggested Pages:**
- `customer/payment-success.html`

**Reason:** The checkout flow in `customer/payment.html` has no success state. Client-side `PaymentSuccess.tsx` shows a confirmation with checkmark, event details, and CTAs.

---

## Payment Cancellation Page

**Feature:** Post-payment cancellation with "no charges made" message.

**Suggested Pages:**
- `customer/payment-cancel.html`

**Reason:** No cancellation view exists in mockups. Client-side `PaymentCancel.tsx` handles this.

---

## Reservation Timeline

**Feature:** Timeline-style reservation history with status progression.

**Suggested Pages:**
- `customer/reservations.html`

**Reason:** Client-side has `Reservations.tsx` with a timeline component. No mockup exists for this view.

---

## Admin Organization Approval (Separate Page)

**Feature:** Dedicated approval workflow for pending organizations.

**Suggested Pages:**
- `admin/org-approval.html`

**Reason:** Client-side has `OrganizationApproval.tsx` as a separate page. The mockup combines this into `admin/org-management.html` table with inline Approve/Reject. A dedicated page may be needed for a more detailed review workflow.

---

## Admin User Management

**Feature:** Platform-wide user management with search, filtering, and moderation actions.

**Suggested Pages:**
- `admin/user-management.html`

**Reason:** Client-side has `UserManagement.tsx` (stub). No mockup exists. The `admin/org-management.html` only manages organizations, not individual users.

---

# Orphan Pages

These UI/UX pages do not directly correspond to any documented feature in the client-side React app.

## `customer/availability.html`

**Status:** 🟡 Partially orphaned

**Explanation:** This page is a standalone "Seat Availability" checker with event/venue/date selectors. The client-side implements seat selection within the event detail flow (`EventSelect.tsx` inside `events/:eventId/select`) and zone purchase flow (`ZonePurchase.tsx` inside `events/:eventId/zone-purchase`), not as a standalone availability page. It may represent a pre-purchase availability check feature not yet implemented in the React app.

---

## `customer/outlets.html`

**Status:** 🟡 Partially orphaned

**Explanation:** The mockup has a fully designed physical outlet directory with city filters and outlet cards. The client-side has `Outlets.tsx` as a placeholder ("coming soon"). The design is complete but not implemented as a functional feature.

---

## `customer/contact.html`

**Status:** 🟡 Partially orphaned

**Explanation:** The mockup has a full contact form and support information. The client-side has `Contact.tsx` as a placeholder ("coming soon").

---

## `admin/system-monitoring.html`

**Status:** 🟡 Partially orphaned

**Explanation:** The mockup has a complete system monitoring dashboard with service status cards, metric charts, and log viewer. The client-side has `SystemMonitoring.tsx` as a placeholder stub.

---

## `admin/audit-logs.html`

**Status:** 🟡 Partially orphaned

**Explanation:** The mockup has a rich audit log page with filters and pagination. The client-side `Logs.tsx` implements a simpler version with a basic table of mock actions.

---

## `organizer/analytics.html`

**Status:** 🟡 Partially orphaned

**Explanation:** The mockup has a comprehensive analytics dashboard with multiple chart types. The client-side `Dashboard.tsx` is a plain stub. No analytics feature exists in the React app.

---

## `organizer/qr-scanner.html`

**Status:** 🟡 Partially orphaned

**Explanation:** The mockup has a fully functional QR scanner with camera access, manual entry, and scan history — including inline JavaScript. The client-side `QRValidation.tsx` is a placeholder stub with no implementation.

---

## `organizer/org-members.html`

**Status:** 🟡 Partially orphaned

**Explanation:** The mockup has a dedicated team member management page. The client-side `TeamManagement.tsx` is a placeholder stub.

---

# Final Statistics

## Overview

| Metric | Count |
|--------|-------|
| **Total UI/UX HTML pages** | 70 |
| **Unique page types** | 51 |
| **Client-side feature pages (routes)** | ~44 |

## Coverage Breakdown

| Category | Count |
|----------|-------|
| **Fully matched features** | 43 |
| **Partially matched features** | 3 |
| **Missing features (no mockup)** | 4 |
| **Orphan pages (no client-side equivalent)** | 8 |

## Page Counts by Portal

| Portal | Main Pages | Auth Pages | Error Pages | Total |
|--------|-----------|------------|-------------|-------|
| Root | 1 | — | — | **1** |
| Customer | 14 | 6 | 4 | **24** |
| Admin | 12 | 6 | 4 | **22** |
| Organizer | 14 | 6 | 4 | **24** |
| **Total** | **41** | **18** | **12** | **71** |

*(Note: landing.html in root + 24 customer + 22 admin + 24 organizer = 71; initial count of 70 was off by 1 — admin has 21 entries but includes `css/` subdirectory in listing)*

## Feature Status Summary

| Status | Count | Features |
|--------|-------|----------|
| ✅ Complete | 43 | Landing, Auth (6), Customer Dashboard, Event Discovery, Event Detail, Seat Selection, Checkout & Payment, Ticket List, Ticket Detail, Refunds (×3), Profile (×3), Settings (×3), Notifications (×3), Organizer Dashboard, Organizer Events, Event Creation, Venues, Venue Templates, Analytics, QR Scanner, Org Management, Team Management, Organizer Refunds, Admin Dashboard, Event Oversight, Venue Oversight, Org Management, System Monitoring, Audit Logs, Admin Refunds, Error Pages (4) |
| 🟡 Partial | 3 | Zone Selection/Purchase, Customer Outlets (design complete, not implemented), Customer Contact (design complete, not implemented) |
| ❌ Missing | 4 | Payment Success page, Payment Cancel page, Reservation Timeline, Admin User Management |

## Shared Components by Category

| Category | Count |
|----------|-------|
| Layout (Header, Footer, Sidebar, HorizontalScroll, FilterBar) | 5 |
| Display (ArtPattern, Avatar, Badge, Card, QRCode, Table) | 6 |
| Form (Button, Input, Select, Toggle, Modal, QuantityStepper, Countdown) | 7 |
| Ticket (EventCard, FeaturedEvent, OrderHero, SeatMap, TicketCard, TicketHero, ZoneMap) | 7 |
| Global CSS classes (badges, cards, buttons, inputs, etc.) | ~20 |
| **Total shared components** | **~45** |

## Design System Tokens

| Token | Value |
|-------|-------|
| Primary accent | Yellow (`#ffc629`) |
| Background | White (`#ffffff`) |
| Primary text | Ink (`#15150f`) |
| Border | Light beige (`#eae7dc`) |
| Display font | Bebas Neue |
| Body font | Inter |
| Mono font | IBM Plex Mono |
| Border radius | 14px (cards), 999px (buttons/tags), 20px (hero) |
| Breakpoint | 860px |
