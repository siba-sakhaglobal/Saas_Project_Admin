# Skill: SDK API Reference

Load this skill when: you need to write code that calls the CMS API, need exact method signatures, or need to know what fields are available.

## Response Format

All SDK methods return `{ data, meta }`:
- `data` — the response payload
- `meta` — pagination `{ total, page, limit }` (null for non-list endpoints)

Errors throw `SdkError` with `.status`, `.message`, `.details`.

## Core Modules

### Blog (`cms.blog`)
| Method | Path | Description |
|--------|------|-------------|
| `list(params)` | GET /api/blog/posts | Params: `{ page, limit, search, status, category }` |
| `get(id)` | GET /api/blog/posts/:id | Single post |
| `create(body)` | POST /api/blog/posts | Body: `{ title, slug, content, excerpt, coverImage, status, category, tags }` |
| `update(id, body)` | PUT /api/blog/posts/:id | Update post |
| `delete(id)` | DELETE /api/blog/posts/:id | Delete post |
| `publish(id)` | PUT /api/blog/posts/:id/publish | Publish draft |
| `unpublish(id)` | PUT /api/blog/posts/:id/unpublish | Unpublish |
| `stats()` | GET /api/blog/stats | `{ total, published, draft }` |
| `authors()` | GET /api/blog/authors | Author list |
| `listCategories()` | GET /api/blog/categories | Category list |
| `createCategory(body)` | POST /api/blog/categories | `{ name, slug, color }` |
| `updateCategory(id, body)` | PUT /api/blog/categories/:id | Update |
| `deleteCategory(id)` | DELETE /api/blog/categories/:id | Delete |

### Events (`cms.events`)
| Method | Path | Description |
|--------|------|-------------|
| `list(params)` | GET /api/events | `{ page, limit, search, status, category }` |
| `get(id)` | GET /api/events/:id | |
| `create(body)` | POST /api/events | `{ title, description, coverImage, startDate, endDate, location, maxAttendees, status, category }` |
| `update(id, body)` | PUT /api/events/:id | |
| `delete(id)` | DELETE /api/events/:id | |
| `stats()` | GET /api/events/stats/overview | |
| `listCategories()` | GET /api/events/categories/list | |
| `createCategory(body)` | POST /api/events/categories | |
| `updateCategory(id, body)` | PUT /api/events/categories/:id | |
| `deleteCategory(id)` | DELETE /api/events/categories/:id | |

### Donations (`cms.donations`)
| Method | Path | Description |
|--------|------|-------------|
| `listCampaigns(params)` | GET /api/donations/campaigns | `{ page, limit, search, status }` |
| `getCampaign(id)` | GET /api/donations/campaigns/:id | With donations |
| `createCampaign(body)` | POST /api/donations/campaigns | `{ title, description, goalCents, coverImage, startDate, endDate, status }` |
| `updateCampaign(id, body)` | PUT /api/donations/campaigns/:id | |
| `deleteCampaign(id)` | DELETE /api/donations/campaigns/:id | |
| `listDonations(params)` | GET /api/donations/donations | |
| `stats()` | GET /api/donations/stats/overview | totalRaised, totalDonors, averageDonation |

### Products (`cms.products`)
| Method | Path | Description |
|--------|------|-------------|
| `list(params)` | GET /api/products | `{ page, limit, search, status, category }` |
| `get(id)` | GET /api/products/:id | Full details |
| `create(body)` | POST /api/products | `{ name, slug, description, priceCents, sku, status, categoryId }` |
| `update(id, body)` | PUT /api/products/:id | |
| `delete(id)` | DELETE /api/products/:id | |
| `stats()` | GET /api/products/stats | |
| `listCategories()` | GET /api/products/categories | |
| `getCategoryTree()` | GET /api/products/categories/tree | Hierarchical |
| `createCategory(body)` | POST /api/products/categories | `{ name, slug, parentId }` |
| `listTags()` | GET /api/products/tags | |
| `createTag(body)` | POST /api/products/tags | `{ name, color }` |
| `listAttributes()` | GET /api/products/attributes | |
| `createAttribute(body)` | POST /api/products/attributes | `{ name, type, options }` |

### Orders (`cms.orders`) — path: `/api/order`
| `list(params)` | `get(id)` | `create(body)` | `update(id, body)` | `delete(id)` | `stats()` |
Body: `{ customerName, customerEmail, customerPhone, items, shippingAddress, billingAddress }`
Fields: `id, orderNumber (auto), items[], subtotalCents, taxCents, totalCents, status`

### Invoices (`cms.invoices`) — path: `/api/invoice`
| `list` | `get` | `create` | `update` | `delete` | `stats` |
Body: `{ orderId, customerName, items, dueDate }`
Fields: `id, invoiceNumber (auto), items[], totalCents, status, dueDate, paidAt`

### Transactions (`cms.transactions`) — path: `/api/transaction`
| `list` | `get` | `create` | `update` | `delete` | `stats` |
Body: `{ orderId, invoiceId, amountCents, type, paymentMethod, gatewayRef }`

### Services (`cms.services`) — path: `/api/service`
| `list` | `get` | `create` | `update` | `delete` | `stats` |
Body: `{ name, slug, description, priceCents, duration, category, featured, image }`

### Appointments (`cms.appointments`) — path: `/api/appointment`
| `list` | `get` | `create` | `update` | `delete` | `stats` |
Body: `{ serviceId, customerName, customerEmail, startAt, endAt, notes }`

### Shipments (`cms.shipments`) — path: `/api/shipment`
| `list` | `get` | `create` | `update` | `delete` | `stats` |
Body: `{ orderId, carrier, trackingNumber, shippingAddress, estimatedDelivery }`

### Vendors (`cms.vendors`) — path: `/api/vendor`
| `list` | `get` | `create` | `update` | `delete` | `stats` |
Body: `{ name, slug, email, phone, company, description, logo, rating, commissionPercent }`

### Banners (`cms.banners`) — path: `/api/banner`
| `list` | `get` | `create` | `update` | `delete` | `stats` |
Body: `{ title, subtitle, imageUrl, mobileImageUrl, linkUrl, placement, bgColor, textColor, status, sortOrder }`

### Team (`cms.team`) — path: `/api/team`
| `list` | `get` | `create` | `update` | `delete` | `stats` | `categories()` |
Body: `{ name, designation, email, phone, bio, avatarUrl, socialLinks, category }`

### Media (`cms.media`) — path: `/api/media`
| `list` | `get` | `update` | `delete` | `bulkDelete(ids)` | `stats` |
| `presignUpload(body)` | `register(body)` | `presignDownload(body)` |
Upload flow: presignUpload → PUT to S3 → register

### Users (`cms.users`) — path: `/api/v1/users`
| `signupFields()` | `register(body)` | `login(body)` | `refresh(body)` | `me()` | `logout()` |
Register: `{ email, password, fullName, phone }`
Returns: `{ endUser, accessToken, refreshToken }`

### Analytics (`cms.analytics`) — path: `/api/analytics`
| `all(params)` | `overview(params)` | `traffic(params)` | `donations(params)` | `content(params)` | `events()` |
Params: `{ timeRange: '7d' | '30d' | '90d' | '1y' }`

### User Groups (`cms.userGroups`) — path: `/api/user-groups`
| `list` | `get` | `create` | `update` | `delete` | `tree()` | `stats()` |
| `assign(body)` | `bulkAssign(body)` | `seedDefault()` |
| `createSubgroup(groupId, body)` | `updateSubgroup(groupId, subId, body)` | `deleteSubgroup(groupId, subId)` |

### Raw Client (`cms.raw()`)
For endpoints not in SDK: `cms.raw().get('/api/some-path', { params })`, `.post()`, `.put()`, `.delete()`

---

## Custom Modules (`cms.custom('table')`) — SurrealDB-backed

Any table, any structure, instant — no backend changes.

### CRUD
| Method | Description |
|--------|-------------|
| `cms.custom('table').list(params)` | List. Params: `{ page, limit, search, sort, order, ...filters }` |
| `cms.custom('table').get(id)` | Get by ID |
| `cms.custom('table').create(body)` | Create (any JSON) |
| `cms.custom('table').update(id, body)` | Update |
| `cms.custom('table').delete(id)` | Delete |
| `cms.custom('table').count(filters)` | Count records |

### Aggregates (no raw queries needed)
| Method | Description |
|--------|-------------|
| `avg(field, filters)` | Average of numeric field |
| `sum(field, filters)` | Sum |
| `min(field, filters)` | Minimum |
| `max(field, filters)` | Maximum |
| `groupBy(field, filters)` | Group + count |
| `distinct(field, filters)` | Unique values |
| `recent(limit)` | Latest N records |
| `findBy(field, value, params)` | Filter shorthand |
| `search(term, fields, params)` | Text search |

### Helpers
| `cms.customTables()` | List all custom tables |
| `stats(fields)` | Multi-aggregate: `stats({ avg_rating: 'math::mean(rating)' })` |

### Money Note
Responses: dollars (float). Requests: use `Cents` suffix fields (integer) — `priceCents`, `goalCents`, `amountCents`.

### Auto Fields
Every custom record gets: `id`, `created_at`, `updated_at` automatically.
