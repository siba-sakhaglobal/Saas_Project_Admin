# Hard Rules (Always Active — Never Override)

## SDK Rules
- NEVER hardcode API URLs or keys — always use environment variables
- NEVER bypass the SDK — always use `cms.module.method()` or `cms.custom('table').method()` or `cms.raw()` for non-SDK endpoints
- NEVER write raw SurrealQL in frontend code — use SDK aggregate helpers (`avg`, `sum`, `groupBy`, `distinct`)
- Money: responses are dollars (float), requests use cents (integer) — `priceCents`, `goalCents`, `amountCents`
- API key scopes to one project — NEVER pass project ID manually in SDK calls
- All SDK methods return `{ data, meta }` — always destructure

## API Path Rules (CRITICAL — wrong paths = 404)
- Business modules use SINGULAR paths: `/api/order` NOT `/api/orders`, `/api/invoice` NOT `/api/invoices`
- Content modules: `/api/blog`, `/api/events`, `/api/donations`, `/api/products`, `/api/team`, `/api/media`
- End users: `/api/v1/users` (NOT `/api/users` or `/api/end-users`)
- Analytics: `/api/analytics`
- User groups: `/api/user-groups`
- Custom modules: `/api/custom/{table_name}`

## Multi-Module Rule
- NEVER build with a single module — always combine 5+ modules for real projects
- EVERY project must include: Banners + Media + Analytics (minimum)
- Custom modules (`cms.custom()`) can fill ANY gap — don't tell users "not available"

## Auth Architecture
- API Key + Secret (from .env) → identifies the PROJECT
- Email + Password (login) → identifies the USER and their permissions
- Both are required — key for project scope, JWT for user identity

## UI Rules
- ALWAYS install UI/UX Pro Max skill before building any frontend
- ALWAYS ask user about design style preference — show gallery link
- Use design tokens from the UI skill — don't invent styles from scratch

## File Rules
- NEVER commit `.env` files — only `.env.example` with placeholder values
- SDK lives in `vendor/cms-sdk-js/` — don't embed SDK source directly in `src/`
- Import SDK as: `import { SakhaCMS } from '@sakha/cms-sdk-js'` or from vendor path

## Error Handling
- Wrap all SDK calls in try/catch
- Custom module query errors return friendly messages — don't let raw SurrealDB errors reach users
- If API returns 401 → redirect to login (SDK handles this via `onAuthFailure`)
