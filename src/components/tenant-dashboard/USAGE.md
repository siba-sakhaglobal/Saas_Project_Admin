# Tenant Dashboard Tabs

Three React/MUI tab components for the Sakha MicroSite CMS tenant admin dashboard.

## Components

### 1. MembersTab
**Purpose:** List and manage tenant team members.

**Features:**
- Fetch members from `GET /api/members` or fallback to `GET /api/tenant-dashboard/overview`
- Table view: Name, Email, Role, Joined date
- Role badges with colors: admin=#2563EB, editor=#10B981, viewer=#94A3B8
- Invite dialog: email field + role dropdown
- Empty state with CTA
- Loading skeletons, error handling with retry

**File:** `MembersTab.jsx` (~280 lines)

**Usage:**
```jsx
import { MembersTab } from '@/components/tenant-dashboard';

<MembersTab />
```

---

### 2. ApiKeysTab
**Purpose:** Full API key management with key+secret system.

**Features:**
- Fetch keys: `GET /api/api-keys` + projects `GET /api/projects`
- Key list: name, project chip, masked/revealed key toggle, copy button, revoke action
- Create key dialog: name, optional project, scopes (default: *)
- Credentials dialog (one-time display):
  - API Key: visible, copyable
  - API Secret: amber colored, one-time display
  - Download CSV button
- Revoke key with confirmation
- Empty state with CTA
- Loading skeletons, full error handling

**File:** `ApiKeysTab.jsx` (~345 lines)

**Endpoints:**
- `GET /api/api-keys` - list all keys
- `GET /api/projects` - list projects
- `POST /api/api-keys` - create key (returns key + secret)
- `DELETE /api/api-keys/:id` - revoke key

**Usage:**
```jsx
import { ApiKeysTab } from '@/components/tenant-dashboard';

<ApiKeysTab />
```

---

### 3. ModulesTab
**Purpose:** Read-only view of enabled/disabled modules for tenant's plan.

**Features:**
- Fetch: `GET /api/tenant-dashboard/modules`
- Data structure: `{ planName, coreModules: [{name, enabled}], addonModules: [{name, enabled}] }`
- Two sections: "Core Modules" and "Add-on Modules"
- Module cards grid (3 desktop, 2 tablet, 1 mobile)
- Each card: icon, name (slug → display format), status badge
- Visual distinction: enabled (green) vs disabled (gray, dimmed, "Upgrade to unlock")
- Plan name badge in header
- Module name formatting: "api-keys" → "Api Keys"

**File:** `ModulesTab.jsx` (~190 lines)

**Usage:**
```jsx
import { ModulesTab } from '@/components/tenant-dashboard';

<ModulesTab />
```

---

## Design System

All components follow the design system:
- **Background:** #F8FAFC
- **Cards:** #fff with border #E2E8F0
- **Primary:** #2563EB, **Success:** #10B981, **Error:** #DC2626, **Warning:** #F59E0B
- **Text:** #1E293B (heading), #64748B (body), #94A3B8 (muted)
- **Cards:** borderRadius 3, border '1px solid #E2E8F0'
- **Buttons:** borderRadius 2, textTransform 'none', fontWeight 600

## API Integration

All components use:
- `apiClient` from `@/services/apiService` — auto-attaches auth headers, auto-unwraps envelope
- `useAuth()` from `@/services/authService` — for user, tenant, logout context

## Error Handling

- Network errors: displayed in Alert with retry action
- Endpoint 404s: graceful fallback or "Coming soon" state
- Input validation: email, required fields, etc.
- Loading states: Skeleton placeholders during data fetch
- Empty states: Icon + descriptive message + CTA button

## Key Implementation Details

### MembersTab
- Dual endpoint support: `/api/members` → `/api/tenant-dashboard/overview`
- Email validation using regex
- Role-based colors mapped to standardized palette

### ApiKeysTab
- Dual endpoint support for invite: `/api/members/invite` → `/api/invitations`
- Key masking: first 8 chars + `••••••••` + last 4 chars
- Eye icon toggle for reveal/hide (state per key)
- CSV download: `Project,API Key,API Secret` format
- Secret shown only once in credentials dialog (amber background for visual emphasis)

### ModulesTab
- Pure read-only component (no mutations)
- Module name slugs auto-converted to display format
- Plan badge displays plan name from API response
- Disabled modules show "Upgrade to unlock" text

---

## Integration Example

```jsx
import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { MembersTab, ApiKeysTab, ModulesTab } from '@/components/tenant-dashboard';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
        <Tab label="Members" />
        <Tab label="API Keys" />
        <Tab label="Modules" />
      </Tabs>

      {activeTab === 0 && <MembersTab />}
      {activeTab === 1 && <ApiKeysTab />}
      {activeTab === 2 && <ModulesTab />}
    </Box>
  );
};

export default DashboardPage;
```

---

## Files Created

```
/home/sakha/Sakha-MicroSite-CMS/apps/tenant-admin/src/components/tenant-dashboard/
├── MembersTab.jsx        (280 lines)
├── ApiKeysTab.jsx        (345 lines)
├── ModulesTab.jsx        (190 lines)
├── index.js              (exports)
└── USAGE.md              (this file)
```
