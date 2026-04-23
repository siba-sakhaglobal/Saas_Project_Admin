# SaaS Project Admin

A multi-tenant, project-scoped admin panel for managing CMS content, e-commerce, and business operations. Built with React and powered by the [SaaS Project SDK](https://github.com/siba-sakhaglobal/Saas_Project_SDK).

## Features

- Blog, Events, Donations management
- Products, Orders, Invoices, Transactions
- Services, Appointments, Vendors
- Shipments, Banners, Team management
- Media library with S3 uploads
- User management with groups
- Analytics dashboard
- Role-based access control

## Prerequisites

- Node.js 18+
- npm 9+
- A running CMS backend API
- API Key and Secret from the CMS admin panel

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/siba-sakhaglobal/Saas_Project_Admin.git
cd Saas_Project_Admin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install dependencies (includes SDK)

The SDK is bundled in the `vendor/` directory. Running `npm install` will install everything:

```bash
npm install
```

To update the SDK to the latest version:

```bash
# Clone the SDK repo and copy the JS SDK
git clone https://github.com/siba-sakhaglobal/Saas_Project_SDK.git /tmp/sdk
cp -r /tmp/sdk/javascript/* vendor/cms-sdk-js/
rm -rf /tmp/sdk
npm install
```

### 4. Configure environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Your CMS backend API URL
REACT_APP_API_URL=https://your-cms-api.example.com

# API Key & Secret (get these from your CMS admin panel → API Keys)
REACT_APP_API_KEY=sk_live_YOUR_KEY_HERE
REACT_APP_API_SECRET=sec_YOUR_SECRET_HERE

# Dev server port
PORT=3003
```

#### Getting your API Key

1. Log into your CMS admin panel
2. Go to **Dashboard** → **API Keys** tab
3. Click **Create API Key**
4. Select the project you want this admin panel to manage
5. Copy the **Key** and **Secret** (the secret is only shown once)
6. Paste them into your `.env` file

### 5. Start the development server

```bash
npm start
```

The app will open at `http://localhost:3003`.

### 6. Login

Use your CMS admin credentials (email + password) to log in. The API key identifies which project you're managing; the login identifies who you are and what permissions you have.

## How It Works

This admin panel uses **two-layer authentication**:

| Layer | Purpose | Source |
|-------|---------|--------|
| **API Key + Secret** | Identifies which project this panel manages | `.env` file |
| **Email + Password** | Identifies the user and their permissions | Login form |

- The API key is resolved on app load to determine the project scope
- All API calls include the user's JWT token (for auth) and the project ID (from the key)
- No project switching — this panel is locked to one project

## Build for Production

```bash
npm run build
```

Serve the `build/` directory with any static file server:

```bash
npx serve -s build -l 3003
```

Or use PM2:

```bash
pm2 serve build 3003 --name saas-project-admin --spa
```

## SDK

This project uses the [SaaS Project SDK](https://github.com/siba-sakhaglobal/Saas_Project_SDK) for all API communication. The SDK is available in:

- **JavaScript** — `@sakha/cms-sdk-js`
- **TypeScript** — `@sakha/cms-sdk`
- **Python** — `sakha-cms`
- **PHP** — `sakha/cms-sdk`

See the [SDK repository](https://github.com/siba-sakhaglobal/Saas_Project_SDK) for full documentation.

> **IMPORTANT:** This project includes a **Claude Code Skill** file at `.claude/skills/Sakha-CMS-SKILL.md`. If you are using [Claude Code](https://claude.ai/code), VS Code with Claude extension, or any Claude-powered IDE — **the skill file will automatically guide Claude** to understand the entire platform, interview you about your requirements, and build the frontend for you. You don't need to read the docs manually.

---

## Build Your Own Website with Claude Code

This is the fastest way to build a website on top of the Sakha CMS platform. Clone this repo, open it in your favorite editor with Claude Code, and describe what you want.

### Step 1: Clone and open

```bash
git clone https://github.com/siba-sakhaglobal/Saas_Project_Admin.git
cd Saas_Project_Admin
```

### Step 2: Open in your editor with Claude Code

Open the project in VS Code, JetBrains, or any editor with Claude Code extension. Or use the Claude Code CLI:

```bash
claude
```

### Step 3: Tell Claude what you want

Just type your requirement. Here are some example prompts to get started:

**For an NGO Website:**
> "I want to build a charity website for 'Hope Foundation'. We run donation campaigns, organize community events, publish impact stories on our blog, and need to showcase our team. We have banners for the homepage. Build me a Next.js website with all these features. My API key is sk_live_xxx and secret is sec_yyy."

**For an E-Commerce Store:**
> "Build me an online store called 'Urban Threads' selling clothing. I need product listings with categories, a shopping cart, checkout with order creation, invoice generation, and user registration. Use React with Tailwind CSS. I'll get my API key from sakhaglobal.com."

**For a Doctor Booking Site:**
> "Create a medical clinic website called 'HealthFirst Clinic'. Doctors are listed as team members, treatments as services, patients can book appointments, and we publish health tips on a blog. Use Next.js for SEO."

**For a Blog/Magazine:**
> "I want a content website called 'TechPulse' with blog posts, categories, author profiles, a media gallery, and analytics dashboard. Build it with Next.js SSR for SEO."

**For a Service Marketplace:**
> "Build a freelancer marketplace called 'SkillHub'. Vendors list their services, clients book appointments, we track orders and payments. Need user registration for both vendors and clients."

That's it. Claude will interview you for any missing details, set up the project, install the SDK, and build the entire frontend.

---

## Tech Stack

- React 18 (Create React App)
- Material UI + Tailwind CSS
- React Router v6
- React Query (TanStack Query)
- Recharts for analytics
- Lucide React icons

## License

MIT
