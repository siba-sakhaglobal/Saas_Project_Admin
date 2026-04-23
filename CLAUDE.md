# CLAUDE.md

## What This Project Is

**SaaS Project Admin** — an open-source, project-scoped admin panel for the Sakha CMS Platform. Connects to a headless CMS backend via API Key + Secret. 17+ built-in modules + unlimited custom modules via SurrealDB.

**Repos:**
- SDK: https://github.com/siba-sakhaglobal/Saas_Project_SDK
- Admin: https://github.com/siba-sakhaglobal/Saas_Project_Admin

---

## Hard Rules (Always Loaded)

Read `.claude/memory.md` — contains immutable rules for SDK usage, API paths, auth, multi-module strategy, and error handling. These rules apply to ALL tasks, every time. Never override them.

---

## Skills (Load On Demand)

Do NOT load all skills at once. Read the index below and load only what's needed for the current task.

### Skill Index

| Skill | Path | Load When... |
|-------|------|-------------|
| **Setup & Interview** | `.claude/skills/setup-interview/SKILL.md` | User wants to start a new project, needs setup help, or you need to gather requirements |
| **API & SDK Reference** | `.claude/skills/api-reference/SKILL.md` | Writing code that calls the API, need exact method signatures, field names, or endpoint paths |
| **Architecture & Patterns** | `.claude/skills/architecture-patterns/SKILL.md` | Planning pages, deciding which modules to combine, writing component code, or need code patterns |
| **UI Design & Styles** | `.claude/skills/ui-design/SKILL.md` | Choosing visual styles, building UI components, or user asks about design preferences |

### Loading Strategy

- **User says "I want to build..."** → Load `setup-interview` first. After interview, load `architecture-patterns` for planning, then `api-reference` when writing code.
- **User says "add a blog page"** → Load `api-reference` (for blog methods) + `architecture-patterns` (for multi-module approach).
- **User says "make it look better"** → Load `ui-design`.
- **User asks about endpoints** → Load `api-reference` only.
- **User asks "what can I build?"** → Load `architecture-patterns` (project type templates).

### Skill Dependencies

```
setup-interview → architecture-patterns → api-reference
                                       ↘ ui-design
```

Start with setup, then architecture for planning, then API for coding. UI design can be loaded anytime alongside others.

---

## Architecture

```
Frontend (this repo)  →  SDK (@sakha/cms-sdk-js)  →  CMS Backend
     React app              vendor/cms-sdk-js/         Fastify + MySQL + SurrealDB
```

### Two-Layer Authentication

| Layer | Purpose | Source |
|-------|---------|--------|
| API Key + Secret | Identifies the PROJECT | `.env` file |
| Email + Password | Identifies the USER + permissions | Login form → JWT |

### Key Files

| File | Purpose |
|------|---------|
| `src/services/cms.js` | SDK instance — single entry point for all API calls |
| `src/services/authService.js` | Auth context — login, logout, token management |
| `src/context/ProjectContext.jsx` | Project context — resolves project from API key |
| `src/App.js` | Routing — API key mode skips tenant dashboard |
| `vendor/cms-sdk-js/` | SDK source (installed as dependency) |
| `.env` | API credentials (never commit) |
| `.env.example` | Template for `.env` |

### API Path Quick Reference

| SDK | Path | Note |
|-----|------|------|
| `cms.blog` | `/api/blog` | Posts, categories, authors |
| `cms.events` | `/api/events` | Events, categories |
| `cms.donations` | `/api/donations` | Campaigns, donations |
| `cms.products` | `/api/products` | Products, categories, tags |
| `cms.orders` | `/api/order` | SINGULAR path |
| `cms.invoices` | `/api/invoice` | SINGULAR |
| `cms.transactions` | `/api/transaction` | SINGULAR |
| `cms.services` | `/api/service` | SINGULAR |
| `cms.appointments` | `/api/appointment` | SINGULAR |
| `cms.shipments` | `/api/shipment` | SINGULAR |
| `cms.vendors` | `/api/vendor` | SINGULAR |
| `cms.banners` | `/api/banner` | SINGULAR |
| `cms.team` | `/api/team` | |
| `cms.users` | `/api/v1/users` | End-user auth |
| `cms.analytics` | `/api/analytics` | |
| `cms.media` | `/api/media` | S3 uploads |
| `cms.userGroups` | `/api/user-groups` | |
| `cms.custom('x')` | `/api/custom/x` | SurrealDB-backed |
| `cms.raw()` | Any path | Fallback |

### Development Commands

```bash
npm install          # Install deps (includes SDK)
npm start            # Dev server on port 3003
npm run build        # Production build
```
