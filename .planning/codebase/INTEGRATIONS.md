# External Integrations

**Analysis Date:** 2026-01-21

## APIs & External Services

**Payment Processing:**
- Not detected

**Email/SMS:**
- Not detected

**External APIs:**
- No runtime API calls detected in application code (no `fetch` usage in `src/`)
- Catalog metadata references Wikimedia sources for attribution - `src/game/catalog.ts`

## Data Storage

**Databases:**
- Not detected

**File Storage:**
- Static catalog assets bundled in `public/catalog/`
- Source metadata links to Wikimedia Commons - `src/game/catalog.ts`

**Caching:**
- Not detected

## Authentication & Identity

**Auth Provider:**
- Not detected

**OAuth Integrations:**
- Not detected

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Analytics:**
- Not detected

**Logs:**
- Console logging only - `src/App.tsx`, `src/game/persistence.ts`

## CI/CD & Deployment

**Hosting:**
- GitHub Pages via Actions - `.github/workflows/pages.yml`
  - Deployment artifact: `dist/`

**CI Pipeline:**
- GitHub Actions workflow runs tests and build - `.github/workflows/pages.yml`

## Environment Configuration

**Development:**
- No required env vars detected
- Google Fonts loaded from `fonts.googleapis.com` - `index.html`

**Staging:**
- Not detected

**Production:**
- GitHub Pages environment configured in Actions workflow - `.github/workflows/pages.yml`

## Webhooks & Callbacks

**Incoming:**
- Not detected

**Outgoing:**
- Not detected

---

*Integration audit: 2026-01-21*
*Update when adding/removing external services*
