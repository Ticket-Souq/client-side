# TicketsMarche Design System v2
Reference: `ticketsmarche-homepage.html`

This is the build spec for every new page. The goal: white space does the work, yellow is used sparingly and only with intent, and the one recurring motif — the **ticket stub** (dashed perforation + punch-hole notches) — is what makes the product recognizable. Don't introduce a second signature element; reuse this one.

---

## 1. Design Principles

1. **White is the surface, not a background color to fill.** Most of every page should be plain white. Yellow appears only on: primary buttons, active nav state, tags/eyebrows, price, and small accent details (dot in logo, notch dividers). If more than ~10% of a viewport is yellow, pull back.
2. **Cards show art, not text — text is a hover reveal.** Event/listing cards never print the title, date, or venue by default. That information lives in a scrim that slides up on hover/focus. This keeps grids and rows visually quiet.
3. **Horizontal rows over vertical stacks.** Any list of more than 3 similar items (events, venues, organizations, tickets) scrolls horizontally with `scroll-snap`, not a vertical stack of cards. Vertical stacking is reserved for forms, settings, and detail pages.
4. **One big hero, not a banner strip.** The top of a primary page is a single large, dominant card — not a row of stat tiles or a shallow banner. On ticketing pages this is the ticket-stub hero; on other page types (dashboard, admin) it can be a single large summary card, but it stays singular and large.
5. **The ticket-stub motif is the only "signature" device.** Dashed vertical/horizontal perforation line + two white circular "punch" notches. Use it for hero cards and, at small scale, do not overuse it elsewhere — one strong repeated idea beats many decorative ones.

---

## 2. Color Palette

```css
--white:          #ffffff;   /* page background, primary surface */
--ink:            #15150f;   /* primary text, dark surfaces (hero bg, stub bg) */
--ink-soft:       #3c3b34;   /* secondary nav/footer link color */
--text-secondary: #726f63;   /* supporting text, eyebrows, captions */
--border:         #eae7dc;   /* hairline dividers */

--yellow:         #ffc629;   /* primary accent — CTAs, active states, price */
--yellow-deep:    #e0a600;   /* hover/pressed state of yellow */
--yellow-pale:    #fff6d9;   /* pale tint for light-mode art backgrounds */

--radius:         14px;      /* default card radius */
```

**Usage rules**
- `--white` is the default background for every page and every content surface (cards, inputs, modals) unless the surface is intentionally dark (hero art, ticket stub, dark card variant).
- `--ink` doubles as both the primary text color on white and the background color of dark surfaces (hero art panel, ticket stub panel). Don't introduce a second dark tone.
- `--yellow` is the **only** accent color in the system. No blue, green, or additional brand hues. Semantic states (error/success), if needed later, should be added deliberately and sparingly — don't reach for the default red/green pair without checking they still read as "quiet" against this palette.
- Text on yellow fills (buttons) uses `--ink`, never white.
- Text on dark fills (hero, stub) uses `--white` at full opacity for primary content, and `rgba(255,255,255,0.45–0.75)` for secondary/meta text.

---

## 3. Typography

Three typefaces, each with one job. Don't add a fourth.

| Role | Font | Used for |
|---|---|---|
| Display | `'Bebas Neue', sans-serif` | Hero titles, logo wordmark, stub price — big, condensed, all-caps-friendly moments |
| Body / UI | `'Inter', sans-serif` | All body copy, nav, buttons, card titles, form labels — the default font |
| Mono / meta | `'IBM Plex Mono', monospace` | Dates, times, venues, eyebrows, tags, prices' labels — anything that reads like print on a physical ticket |

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

**Type scale**

| Use | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Hero title | Bebas Neue | 64px (44px mobile) | 400 | `line-height:0.95`, max-width ~560px |
| Stub price | Bebas Neue | 40px | 400 | color `--yellow` |
| Logo | Bebas Neue | 26px | 400 | letter-spacing 0.03em |
| Row/section title | Inter | 22px | 600 | |
| Card title (in hover overlay) | Inter | 15px | 600 | white on scrim |
| Body / nav links | Inter | 14px | 500 | |
| Button label | Inter | 14px | 600 | |
| Eyebrow / tag / mono meta | IBM Plex Mono | 11–12px | 400–500 | uppercase, letter-spacing 0.1–0.14em |
| Stub label | IBM Plex Mono | 10px | 400 | uppercase, letter-spacing 0.12em, `rgba(255,255,255,0.45)` |

Rules of thumb: **Bebas Neue only above 24px** (it gets illegible small). **Mono only for metadata**, never for paragraphs. **Inter for everything a user reads at length.**

---

## 4. Layout & Spacing

- Container: `.wrap { max-width:1200px; margin:0 auto; padding:0 32px; }` (20px on mobile). Use this on every page for consistent margins.
- Section rhythm: hero section `56px` top / `72px` bottom padding; subsequent row sections `52px` vertical padding.
- Card gaps: `18px` between horizontally-scrolling cards; `16px` between form fields.
- Radius: `14px` default (`--radius`) for cards, `20px` for the hero, `999px` (pill) for buttons and tags.
- Grid for two-part cards (e.g. hero): `grid-template-columns: 1fr 320px` desktop → single column stacked on mobile (`≤860px`).

---

## 5. Core Components

### 5.1 Header / Nav
```
Sticky, position:sticky; top:0; z-index:50
Background: rgba(255,255,255,0.92) + backdrop-filter: blur(8px)
Border-bottom: 1px solid var(--border)
Height: 76px
Layout: logo (left) — nav links (center/right) — actions (right)
Active nav link: 2px yellow underline via ::after
```
Logo pattern: small 9px yellow dot + Bebas Neue wordmark, all caps. Reuse this exact logo mark on every page.

### 5.2 Buttons
```css
.btn { height:44px; padding:0 24px; border-radius:999px; font:600 14px Inter; }
.btn-primary  { background:var(--yellow); color:var(--ink); }      /* hover -> --yellow-deep */
.btn-ghost    { background:transparent; color:var(--ink); font-weight:500; } /* hover -> --text-secondary */
```
- Exactly one primary (yellow) CTA visible per view/card. Everything else is ghost or a plain text link.
- Press state: `transform:scale(0.97)` on `:active`. No box-shadows on buttons.

### 5.3 Hero — Ticket-Stub Card
This is the signature component. Structure:
```
.ticket-card         -> grid, 1fr / 320px, dark bg (--ink), 20px radius, overflow hidden
  .ticket-art        -> left panel: gradient art + radial yellow glows + optional "beam" light-streaks
    .ticket-tag      -> pill, mono, uppercase, yellow-on-transparent-yellow
    .ticket-title    -> Bebas Neue 64px
    .ticket-meta     -> mono, two items (date/time . venue), rgba white 0.75
  .ticket-stub       -> right panel: dark, dashed left border (2px dashed rgba(255,255,255,0.22))
    .stub-notch (top & bottom) -> 28px white circle, positioned at left:-14px, top/bottom:-14px -- this punches the "hole" through the perforation
    .stub-row -> label (mono, 10px, uppercase, dim) + value (Inter, 16px, 600)
    .stub-price -> Bebas Neue, 40px, yellow
    .stub-cta -> full-width primary button
```
On mobile (`≤860px`): collapse to a single column, dashed border moves to `border-top`, notches hidden.

**Reuse this component whenever a page needs one dominant, ticket-like summary object** — e.g. an order confirmation, a "your ticket" view, a featured-item hero on any listing page. Keep the notch + dashed-line detail; that's the whole point of the motif.

### 5.4 Horizontal Row + Hover-Reveal Card
```
.row-section  -> 52px vertical padding
.row-head     -> flex, space-between: title (22px/600) + "See all ->" link (13px/600, --text-secondary)
.hscroll      -> flex, gap 18px, overflow-x:auto, scroll-snap-type:x mandatory, scrollbar hidden
.ecard        -> flex:0 0 220px, height:290px, radius var(--radius), overflow hidden, position:relative
  .art        -> absolute inset:0, one of the art-* pattern classes (background only, no text)
  .corner     -> small 34px white circle, top-right, mono 3-letter tag (e.g. month "JUL") -- the only info visible by default
  .overlay    -> absolute, top:60% to bottom, gradient scrim (rgba(10,10,7,0.94) -> transparent),
                translateY(14px) + opacity:0 by default,
                on :hover/:focus -> translateY(0) + opacity:1 (260ms cubic-bezier(0.22,1,0.36,1))
    .ev-title -> Inter 15px/600, white
    .ev-meta  -> IBM Plex Mono 11px, rgba white 0.7
```
Card art on hover also darkens slightly: `filter:brightness(0.85) saturate(1.05)`. This is what makes the reveal read as "focus," not just a popup.

**Rule:** every list of events/venues/tickets/organizations uses this exact card + row pattern. Don't invent a new card style per page — vary only the `.art-*` background and the two lines of overlay copy.

### 5.5 Abstract Art Backgrounds (`.art-*`)
Since there are no real photos, every card uses a palette-locked abstract pattern instead of a stock image. Six variants exist — reuse these classes verbatim on new pages so the whole product feels drawn from one system, and add new variants only by following the same recipe (a two-color gradient from the palette + one repeating-pattern `::after` layer):

| Class | Base gradient | Pattern overlay |
|---|---|---|
| `.art-waves` | pale yellow gradient | repeating radial-gradient rings (water/ripple feel) |
| `.art-beams` | dark ink gradient | diagonal repeating-linear-gradient in yellow (stage lighting feel) |
| `.art-dots` | light warm gray gradient | dot grid, 16px |
| `.art-grid` | dark ink gradient | yellow line grid, 22px |
| `.art-arc` | radial yellow-to-ink glow | none — single soft radial burst |
| `.art-confetti` | pale yellow gradient | two overlapping dot layers (ink + white), festive feel |

### 5.6 Cards (Generic / Non-Hover)
For non-event bounded content (forms, settings panels, detail sections): white background, `1px solid var(--border)`, `14px` radius, `24px` padding. No shadow by default — shadows are reserved for genuinely floating elements (dropdowns, modals), not static cards, to keep the flat/minimal feel.

### 5.7 Footer
```
Border-top: 1px solid var(--border)
Logo (same mark as header) + 3 link columns (uppercase mono 12px headers, Inter 14px links)
Bottom bar: border-top divider, small text-secondary copyright + tagline, space-between
```

---

## 6. Motion

| Interaction | Duration | Easing |
|---|---|---|
| Card overlay reveal | 260ms (transform) / 220ms (opacity) | `cubic-bezier(0.22,1,0.36,1)` |
| Art darken on hover | 260ms | ease |
| Button hover/press | 150ms | ease |

Keep motion to these three moments. No page-load animations, no parallax — the system is meant to feel calm and flat, with hover-reveal as the one deliberate "trick."

---

## 7. Responsive Rules

- Breakpoint: `860px`.
- Below it: hero collapses to a single column (art stacked above stub), nav links hide (add a menu button on real builds — not yet implemented in the reference file), container padding drops to `20px`, hero title drops to `44px`.
- Horizontal rows keep scrolling behavior at all sizes — they don't reflow into a grid on mobile; that's the point of the pattern.

---

## 8. Applying This to New Pages

When building a new page (event detail, checkout, dashboard, admin table, auth, etc.):

1. Start from the same `<head>` block (fonts, `:root` tokens) and `.wrap` container.
2. Reuse the header and footer verbatim.
3. Pick a hero treatment: ticket-stub card for booking/detail-style pages; for data-heavy pages (dashboards, admin), a single large summary card in the same visual language (dark `--ink` panel + one stat in Bebas Neue + mono labels) — but still just **one** dominant card, not a row of metric tiles.
4. Any collection of items → horizontal `.hscroll` row of `.ecard`s with hover-reveal, not a vertical list or grid.
5. Forms, tables, and settings screens are the exception to "no text on cards" — those need visible labels/values at all times. Keep them on white, bordered, `14px` radius, Inter throughout, mono only for codes/dates/IDs.
6. Never introduce a second accent color or a second display font. If a new page seems to need one, that's a signal to solve it with layout or the existing yellow/ink pairing instead.
