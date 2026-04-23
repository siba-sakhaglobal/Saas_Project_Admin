# Skill: Architecture & Multi-Module Patterns

Load this skill when: planning page structure, deciding which modules to combine, or writing component code.

---

## CRITICAL: Multi-Module Strategy

**NEVER think single-module.** Most projects use 5-12 modules together.

### The Golden Rule

> "I want an NGO website" does NOT mean "donations module". It means: **Donations** + **Events** + **Blog** + **Team** + **Banners** + **Media** + **Analytics** + **Users** + **Products** (merch). That's 9 modules.

### Module Pairing Matrix

| If user needs... | Always also consider... |
|---|---|
| Products | Orders, Invoices, Transactions, Shipments, Vendors, Banners, Users |
| Donations | Events, Blog, Team, Banners, Media, Analytics |
| Events | Blog, Team, Banners, Media, Donations |
| Blog | Media, Banners, Analytics, Users (comments via custom) |
| Services | Appointments, Team, Banners, Users |
| Orders | Invoices, Transactions, Shipments, Products |
| Team | Blog (authors), Events (organizers), Services (providers) |
| Any project | Banners (always), Media (always), Analytics (always) |

### The "Banners + Media + Analytics" Rule

These 3 go in EVERY project. No exceptions.

### Don't Be a Single-Module Thinker

| User says... | Bad | Good |
|---|---|---|
| "Charity website" | "I'll set up donations" | Donations + Events + Blog + Team + Banners + Media + Analytics + Users |
| "Online store" | "I'll set up products" | Products + Orders + Invoices + Transactions + Shipments + Vendors + Banners + Users + Blog + Analytics |
| "Doctor booking" | "I'll set up appointments" | Services + Appointments + Team + Blog + Banners + Users + Media + Analytics |

---

## Multi-Module Homepage Pattern

```jsx
useEffect(() => {
  Promise.all([
    cms.banners.list({ placement: 'homepage', status: 'active' }),
    cms.donations.listCampaigns({ status: 'active', limit: 4 }),
    cms.events.list({ status: 'upcoming', limit: 3 }),
    cms.blog.list({ status: 'published', limit: 3 }),
    cms.team.list({ limit: 6, active: true }),
    cms.analytics.overview({ timeRange: '30d' }),
  ]).then(([b, d, e, p, t, a]) => {
    setBanners(b.data?.banners || b.data || []);
    setCampaigns(d.data?.campaigns || d.data || []);
    setEvents(e.data?.events || e.data || []);
    setPosts(p.data?.posts || p.data || []);
    setTeam(t.data?.members || t.data || []);
    setStats(a.data?.overview || a.data);
  });
}, []);
```

---

## Project Type Templates

### E-Commerce Store
**Modules:** Products, Orders, Invoices, Transactions, Shipments, Vendors, Banners, Media, Users, Analytics
**Custom:** `reviews`, `wishlists`, `coupons`
**Pages:** Home, Products, Product Detail, Cart, Checkout, Orders, Account
**Framework:** Next.js (SEO)

### NGO / Nonprofit
**Modules:** Blog, Events, Donations, Team, Banners, Media, Analytics, Users
**Custom:** `testimonials`, `impact_stories`, `volunteers`
**Pages:** Home, About, Events, Blog, Donate, Contact
**Framework:** Next.js (SEO)

### Service Booking
**Modules:** Services, Appointments, Team, Banners, Media, Users, Analytics
**Custom:** `reviews`, `availability`
**Pages:** Home, Services, Book, My Appointments, Account
**Framework:** React or Next.js

### Marketplace
**Modules:** Products, Vendors, Orders, Invoices, Transactions, Shipments, Users, Analytics
**Custom:** `reviews`, `disputes`, `seller_applications`
**Pages:** Home, Browse, Vendor, Product, Cart, Checkout, Seller Dashboard

### Blog / Content
**Modules:** Blog, Media, Banners, Analytics, Users
**Custom:** `comments`, `bookmarks`, `newsletter_subscribers`
**Pages:** Home, Blog, Post, Categories, About
**Framework:** Next.js (SSG/SSR)

### Portfolio / Agency
**Modules:** Blog, Team, Products (portfolio items), Media, Banners, Analytics
**Custom:** `case_studies`, `client_testimonials`
**Framework:** Next.js or Astro

---

## Code Patterns

### React Data Fetching
```jsx
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  cms.blog.list({ page: 1, limit: 12, status: 'published' })
    .then(({ data }) => setItems(data?.posts || []))
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);
```

### Next.js SSR
```jsx
export async function getServerSideProps() {
  const { data } = await cms.blog.list({ page: 1, limit: 12 });
  return { props: { posts: data?.posts || [] } };
}
```

### End-User Auth
```jsx
const { data } = await cms.users.register({ email, password, fullName });
localStorage.setItem('user_token', data.accessToken);
```

### Image Upload
```jsx
const { data: presign } = await cms.media.presignUpload({ fileName: file.name, contentType: file.type, folder: 'uploads' });
await fetch(presign.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
const { data: media } = await cms.media.register({ url: presign.publicUrl, fileName: file.name, contentType: file.type, size: file.size });
```

### Core + Custom Combined
```jsx
const [product, reviews] = await Promise.all([
  cms.products.get(id),                                    // Core
  cms.custom('reviews').list({ productId: id, limit: 5 }), // Custom
]);
```

### Custom Module Aggregates
```jsx
const { data } = await cms.custom('reviews').avg('rating', { productId: id });
const { data } = await cms.custom('reviews').groupBy('rating');
```
