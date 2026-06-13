# Sniply API — Backend Reference

This document describes the Sniply URL shortener backend (`apps/api`). It is intended for frontend developers and agents building the web app (`apps/web`).

---

## Quick reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check |
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Sign in, receive tokens |
| `GET` | `/api/auth/me` | Yes | Current user profile |
| `POST` | `/api/links` | Yes | Create short link |
| `GET` | `/api/links` | Yes | List user's links |
| `GET` | `/api/links/:id` | Yes | Get single link |
| `DELETE` | `/api/links/:id` | Yes | Delete link |
| `GET` | `/api/analytics/:id` | Yes | Click summary for a link |
| `GET` | `/api/analytics/:id/timeseries` | Yes | Clicks over time |
| `GET` | `/api/analytics/:id/breakdown` | Yes | Clicks by dimension |
| `GET` | `/:shortCode` | No | Public redirect (records click) |

**Default base URL (local dev):** `http://localhost:4000`

---

## Server setup

### Running locally

```bash
cd apps/api
bun install
bun run index.ts
```

Server listens on **port 4000**.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ACCESS_TOKEN_SECRET` | Yes | JWT signing secret for access tokens |
| `REFRESH_TOKEN_SECRET` | Yes | JWT signing secret for refresh tokens |

### Global middleware

- **CORS** — enabled for all origins (no restrictions configured)
- **JSON body parser** — `Content-Type: application/json` required for POST bodies
- **Morgan** — request logging in dev mode

All authenticated routes expect:

```
Authorization: Bearer <accessToken>
```

---

## Authentication

### Token model

| Token | Lifetime | Usage |
|-------|----------|-------|
| Access token | 15 minutes | Sent on every protected API request |
| Refresh token | 30 days | Issued on login and stored in DB |

JWT payload (both tokens):

```ts
{
  userId: string;  // cuid
  email: string;
}
```

### Important: no refresh endpoint

Login returns both `accessToken` and `refreshToken`, but **there is no `/api/auth/refresh` route** yet. `verifyRefreshToken` exists in the backend but is unused.

**Frontend implication:** when the access token expires (~15 min), the user must log in again unless a refresh endpoint is added later. Store tokens securely (e.g. httpOnly cookies or secure local storage) and handle `401` responses by redirecting to login.

### Error responses (auth)

| Status | `message` | When |
|--------|-----------|------|
| `401` | `"Missing token"` | No `Authorization` header or not `Bearer ...` |
| `401` | `"Invalid token"` | Expired or invalid access token |
| `401` | `"Invalid credentials"` | Wrong email/password on login |
| `400` | varies | Registration failure (e.g. duplicate email) |

---

## Data models

Types below mirror the Prisma schema. Date fields are ISO 8601 strings in JSON responses.

### User

```ts
interface User {
  id: string;           // cuid
  email: string;
  createdAt: string;    // ISO datetime
  updatedAt: string;    // only on full DB records; /me omits updatedAt
}
```

`passwordHash` is never returned to clients.

### Link

```ts
interface Link {
  id: string;           // cuid — use this for analytics and detail APIs
  shortCode: string;    // 6-char random or custom alias
  originalUrl: string;
  userId: string;
  startsAt: string | null;   // optional scheduled start
  expiresAt: string | null;    // optional expiry
  clickCap: number | null;     // max clicks before redirect blocked
  clickCount: number;          // total redirects served (includes bots)
  createdAt: string;
  updatedAt: string;
}
```

**Short URL format:** `{API_ORIGIN}/{shortCode}`

Example: `http://localhost:4000/abc123`

Auto-generated `shortCode` values are **6 characters** from `[0-9A-Za-z]`.

### Analytics types

```ts
interface AnalyticsSummary {
  total: number;    // all clicks (including bots)
  unique: number;   // first-time visitors (by IP + user-agent hash)
  bots: number;
  humans: number;   // total - bots
}

interface BreakdownItem {
  label: string;      // dimension value, or "Unknown" if null
  count: number;
  percentage: number; // rounded integer 0–100
}

interface TimeSeriesPoint {
  period: string;     // bucket label (UTC); see Time series section
  clicks: number;     // human clicks only (bots excluded)
}
```

---

## Endpoints

### `GET /health`

Health check. No auth.

**Response `200`**

```json
{ "status": "ok" }
```

---

### `POST /api/auth/register`

Create a new user.

**Request body**

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

No server-side validation beyond duplicate-email check. Frontend should validate email format and password strength.

**Response `201`**

```json
{
  "id": "clx...",
  "email": "user@example.com"
}
```

**Response `400`**

```json
{ "message": "User already exists" }
```

---

### `POST /api/auth/login`

Authenticate and receive tokens.

**Request body**

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response `200`**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Response `401`**

```json
{ "message": "Invalid credentials" }
```

---

### `GET /api/auth/me`

Returns the authenticated user's profile. Requires access token.

**Response `200`**

```json
{
  "id": "clx...",
  "email": "user@example.com",
  "createdAt": "2026-06-13T10:00:00.000Z"
}
```

Returns `null` JSON body if user was deleted but token still valid (edge case).

---

### `POST /api/links`

Create a short link. Requires access token.

**Request body**

```json
{
  "originalUrl": "https://example.com/long-page",
  "alias": "my-link",
  "startsAt": "2026-06-14T00:00:00.000Z",
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "clickCap": 1000
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `originalUrl` | string | Yes | Stored as-is; no URL format validation |
| `alias` | string | No | Custom `shortCode`; must be globally unique |
| `startsAt` | ISO string | No | Link inactive before this time |
| `expiresAt` | ISO string | No | Link expires after this time |
| `clickCap` | number | No | Max redirects allowed |

If `alias` is omitted, a random 6-character code is generated.

**Response `201`** — full `Link` object

```json
{
  "id": "clx...",
  "shortCode": "my-link",
  "originalUrl": "https://example.com/long-page",
  "userId": "clx...",
  "startsAt": "2026-06-14T00:00:00.000Z",
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "clickCap": 1000,
  "clickCount": 0,
  "createdAt": "2026-06-13T10:00:00.000Z",
  "updatedAt": "2026-06-13T10:00:00.000Z"
}
```

**Response `400`**

```json
{ "message": "Alias already exists" }
```

---

### `GET /api/links`

List all links for the authenticated user, newest first. Requires access token.

**Response `200`** — array of `Link`

```json
[
  {
    "id": "clx...",
    "shortCode": "abc123",
    "originalUrl": "https://example.com",
    "userId": "clx...",
    "startsAt": null,
    "expiresAt": null,
    "clickCap": null,
    "clickCount": 42,
    "createdAt": "2026-06-13T10:00:00.000Z",
    "updatedAt": "2026-06-13T12:00:00.000Z"
  }
]
```

No pagination, filtering, or search.

---

### `GET /api/links/:id`

Get one link by **link id** (cuid), not `shortCode`. Requires access token. Only returns links owned by the user.

**Response `200`** — `Link` object

**Response `404`**

```json
{ "message": "Link not found" }
```

---

### `DELETE /api/links/:id`

Delete a link by id. Requires access token. Cascades delete all associated clicks.

**Response `204`** — empty body

**Response `404`**

```json
{ "message": "Link not found" }
```

---

### `GET /api/analytics/:id`

Click summary for a link. `:id` is the **link id** (cuid). Requires access token and link ownership.

**Response `200`**

```json
{
  "total": 150,
  "unique": 98,
  "bots": 12,
  "humans": 138
}
```

**Response `404`**

```json
{ "message": "Link not found" }
```

---

### `GET /api/analytics/:id/timeseries`

Human clicks bucketed over time. Bots are excluded from counts.

**Query parameters**

| Param | Type | Default | Values |
|-------|------|---------|--------|
| `granularity` | string | `"hour"` | `"hour"`, `"day"`, `"week"` |
| `last` | number | see below | Positive integer — number of buckets to look back |

Default `last` when omitted:

| `granularity` | Default window |
|---------------|----------------|
| `hour` | last 24 hours |
| `day` | last 30 days |
| `week` | last 12 weeks |

**Example**

```
GET /api/analytics/clx.../timeseries?granularity=day&last=7
```

**Response `200`**

```json
[
  { "period": "2026-06-07", "clicks": 5 },
  { "period": "2026-06-08", "clicks": 12 },
  { "period": "2026-06-09", "clicks": 3 }
]
```

**Period format (UTC)**

| `granularity` | `period` example | Meaning |
|---------------|------------------|---------|
| `hour` | `"2026-06-13 14:00"` | UTC hour bucket |
| `day` | `"2026-06-13"` | UTC calendar day |
| `week` | `"2026-06-09"` | Monday of that ISO week (UTC) |

Only buckets with at least one click are returned (no zero-fill).

**Response `400`**

```json
{ "message": "granularity must be hour, day, or week" }
```

```json
{ "message": "last must be a positive number" }
```

> **Note:** This route does not currently verify link ownership before querying. Always use link ids from the authenticated user's link list.

---

### `GET /api/analytics/:id/breakdown`

Top 10 breakdown of human clicks by dimension. Bots excluded.

**Query parameters**

| Param | Required | Values |
|-------|----------|--------|
| `by` | Yes | `"device"`, `"browser"`, `"os"`, `"country"`, `"city"` |

**Example**

```
GET /api/analytics/clx.../breakdown?by=country
```

**Response `200`**

```json
[
  { "label": "US", "count": 45, "percentage": 52 },
  { "label": "GB", "count": 20, "percentage": 23 },
  { "label": "Unknown", "count": 5, "percentage": 6 }
]
```

Percentages are rounded integers; sum may not equal 100 due to rounding.

**Response `400`**

```json
{ "message": "Invalid breakdown field" }
```

> **Note:** Same ownership caveat as timeseries — no explicit ownership check on this route.

---

### `GET /:shortCode`

Public redirect endpoint. Mounted at the server root (not under `/api`). No auth.

When a visitor opens `https://your-domain.com/{shortCode}`:

1. Link is looked up by `shortCode`
2. Scheduling / expiry / click-cap rules are evaluated
3. If allowed, `clickCount` is incremented and a `Click` record is created
4. Browser receives HTTP **307** redirect to `originalUrl`

**Click tracking details** (automatic, no frontend action needed):

- Device, browser, OS parsed from `User-Agent`
- Geo (country, city) from IP via geoip-lite
- Bot detection via `isbot`
- Unique visitor = first click from same IP + user-agent hash for that link
- Referer stored from `Referer` header

**Responses**

| Status | Body | Meaning |
|--------|------|---------|
| `307` | Redirect to `originalUrl` | Success |
| `404` | `{ "error": "NOT_FOUND" }` | Unknown short code |
| `200` | `{ "message": "Link not active yet" }` | Before `startsAt` |
| `410` | `{ "message": "Link expired" }` | After `expiresAt` |
| `429` | `{ "message": "Click limit reached" }` | `clickCount >= clickCap` |

For inactive/expired/capped links the API returns JSON instead of redirecting. A dedicated interstitial UI would need to live on the API host or be handled by a future frontend route.

---

## Error response format

Most errors use a consistent shape:

```json
{ "message": "Human-readable error description" }
```

Exceptions:

- `DELETE /api/links/:id` success → empty `204`
- `GET /:shortCode` not found → `{ "error": "NOT_FOUND" }` (not `message`)

There is no global error handler; unhandled server errors may return HTML or a generic Express error.

---

## Frontend integration guide

### Recommended pages / features

| Page / feature | API calls |
|----------------|-----------|
| **Register** | `POST /api/auth/register` → redirect to login |
| **Login** | `POST /api/auth/login` → store `accessToken` (and `refreshToken` for future use) |
| **Dashboard / links list** | `GET /api/links` |
| **Create link form** | `POST /api/links` with `originalUrl`, optional `alias`, `startsAt`, `expiresAt`, `clickCap` |
| **Link detail** | `GET /api/links/:id` |
| **Delete link** | `DELETE /api/links/:id` |
| **Analytics dashboard** | `GET /api/analytics/:id`, `.../timeseries`, `.../breakdown?by=...` |
| **Copy short URL** | Display `{API_ORIGIN}/{link.shortCode}` — no extra API call |
| **User menu / profile** | `GET /api/auth/me` on app load |

### Suggested API client pattern

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken(); // your storage helper

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? "Request failed");
  }

  return data;
}
```

### Auth flow

```
Register → Login → Store accessToken
       ↓
App load → GET /api/auth/me (validate session)
       ↓
Protected routes → attach Bearer token
       ↓
401 response → clear token → redirect to /login
```

### Analytics UI hints

- Use **link `id`** (not `shortCode`) in analytics URLs: `/analytics/[id]`
- Summary cards: `total`, `unique`, `humans`, `bots`
- Line/bar chart: timeseries with `granularity=day` default
- Pie/bar breakdowns: call breakdown endpoint per dimension (`device`, `browser`, `os`, `country`, `city`)
- `clickCount` on the `Link` model is updated on every redirect (including bots); analytics summary `total` counts click records in the `Click` table — these should stay roughly in sync

### CORS / deployment

- Frontend dev: `http://localhost:3000` → API `http://localhost:4000` works out of the box
- Production: set `NEXT_PUBLIC_API_URL` to the deployed API origin
- Short links point at the **API host** (redirect lives there), not the Next.js app, unless you add a reverse proxy

---

## Current limitations (not yet implemented)

Use this checklist when scoping frontend work:

| Feature | Status |
|---------|--------|
| Refresh token / silent re-auth | Not implemented |
| Update link (`PATCH`) | Not implemented |
| Link search / pagination | Not implemented |
| URL validation on create | Not implemented |
| Password reset | Not implemented |
| Rate limiting on auth (package installed, not wired) | Not implemented |
| Ownership check on analytics timeseries/breakdown | Partial — summary checks ownership; other two do not |
| Custom interstitial pages for expired/inactive links | Returns JSON only |

---

## Route registration order

From `index.ts`:

1. `/api/auth`
2. `/api/links`
3. `/api/analytics`
4. `/health` (registered before catch-all redirect)
5. `/` → redirect router (`/:shortCode`)

`/health` is safe because it is registered before the `/:shortCode` catch-all.

---

## Example end-to-end flow

```bash
# 1. Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@sniply.dev","password":"secret123"}'

# 2. Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@sniply.dev","password":"secret123"}'
# → { "accessToken": "...", "refreshToken": "..." }

# 3. Create link
curl -X POST http://localhost:4000/api/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"originalUrl":"https://example.com","alias":"demo"}'

# 4. List links
curl http://localhost:4000/api/links \
  -H "Authorization: Bearer <accessToken>"

# 5. Analytics (use id from step 3)
curl http://localhost:4000/api/analytics/<linkId> \
  -H "Authorization: Bearer <accessToken>"

curl "http://localhost:4000/api/analytics/<linkId>/timeseries?granularity=day&last=30" \
  -H "Authorization: Bearer <accessToken>"

curl "http://localhost:4000/api/analytics/<linkId>/breakdown?by=device" \
  -H "Authorization: Bearer <accessToken>"

# 6. Public redirect (in browser or curl -L to follow)
curl -i http://localhost:4000/demo
# → 307 Location: https://example.com
```

---

## File map (backend)

| Path | Role |
|------|------|
| `index.ts` | Express app entry, route mounting |
| `routes/auth.ts` | Register, login, me |
| `routes/links.ts` | CRUD (no update) |
| `routes/analytics.ts` | Summary, timeseries, breakdown |
| `routes/redirect.ts` | Public short-link redirect + click recording |
| `middleware/auth.ts` | Bearer JWT validation |
| `services/authService.ts` | Registration, login, token issuance |
| `services/linkService.ts` | Link creation logic |
| `services/analyticsService.ts` | Aggregation queries |
| `services/clickService.ts` | Click recording (device, geo, bot, unique) |
| `prisma/schema.prisma` | Database models |
