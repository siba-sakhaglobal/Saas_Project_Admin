# Skill: Project Setup & User Interview

Load this skill when: user wants to start a new project, needs setup help, or you need to gather requirements.

## Platform Overview

Sakha CMS is a multi-tenant, project-scoped headless CMS with 17+ built-in modules + unlimited custom modules via SurrealDB. Developers use the SDK to build frontends — the backend is ready-made.

### Repositories

| Repo | Purpose | URL |
|------|---------|-----|
| **SaaS Project SDK** | Multi-language SDK (JS, TS, Python, PHP) | https://github.com/siba-sakhaglobal/Saas_Project_SDK |
| **SaaS Project Admin** | Admin panel (React) — optional | https://github.com/siba-sakhaglobal/Saas_Project_Admin |

### API Credentials

Users need an API Key + Secret:
1. Visit **https://sakhaglobal.com** and request a project
2. Receive: `REACT_APP_API_KEY` (starts with `sk_live_`) and `REACT_APP_API_SECRET` (starts with `sec_`)
3. Key is scoped to one project — determines which data you access

---

## Interview Workflow

Ask these in conversation — don't dump all at once. Adapt based on answers.

### 1. Project Identity
- "What are you building?" (e-commerce, NGO, blog, booking, marketplace, etc.)
- "What's the brand name?"
- "Do you have a logo?"
- "What's the primary color / brand palette?"

### 2. API Credentials
- "Do you already have a Sakha CMS API key?"
  - **Yes** → Ask for key + secret
  - **No** → "Request one at https://sakhaglobal.com"

### 3. Target Platform
- "Website, mobile app, or both?"
- "Framework preference?" (React/Next.js, Vue/Nuxt, Svelte, Flutter)
- "Need SSR/SEO?" → Recommend Next.js or Nuxt

### 4. Feature Requirements

Map needs to modules. Ask about each category:

**Content:** Blog? Events? Banners/sliders? Media gallery?
**E-Commerce:** Selling products? Cart/checkout? Invoicing? Payment tracking? Shipping?
**Services:** Offer services? Appointment booking? Vendors/partners?
**NGO:** Accept donations? Team profiles? Impact stories?
**Users:** Registration/login? User groups?
**Analytics:** Dashboard with traffic/engagement?
**Custom:** Anything else? → Custom modules handle it (reviews, wishlist, forum, FAQ, etc.)

### 5. Pages & Design
- "What pages do you need?"
- "Design preference?" → Show UI style gallery: https://ui-ux-pro-max-skill.nextlevelbuilder.io/#styles
- "Reference sites you like?"

---

## Project Setup Steps

### Step 1: Create project

```bash
npx create-next-app@latest my-project --typescript  # or React, Vue, etc.
cd my-project
```

### Step 2: Install SDK

```bash
npm install @sakha/cms-sdk-js
# Or from GitHub:
git clone https://github.com/siba-sakhaglobal/Saas_Project_SDK.git /tmp/sdk
cp -r /tmp/sdk/javascript vendor/cms-sdk-js
```

### Step 3: Configure environment

```env
REACT_APP_API_URL=https://your-backend.example.com
REACT_APP_API_KEY=sk_live_YOUR_KEY
REACT_APP_API_SECRET=sec_YOUR_SECRET
```

### Step 4: Initialize SDK

```javascript
import { SakhaCMS } from '@sakha/cms-sdk-js';

const cms = new SakhaCMS({
  baseUrl: process.env.REACT_APP_API_URL,
  apiKey: process.env.REACT_APP_API_KEY,
  apiSecret: process.env.REACT_APP_API_SECRET,
});

export default cms;
```

### Step 5 (Optional): Install Admin Panel

```bash
git clone https://github.com/siba-sakhaglobal/Saas_Project_Admin.git admin
cd admin && npm install && cp .env.example .env
# Edit .env with API credentials
npm start
```

### Step 6: Install UI/UX Skill

```bash
npx uipro-cli install
# OR: git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git /tmp/uiux && cp -r /tmp/uiux/.claude/skills/* .claude/skills/
```
