# 🌐 Trippy API Reference

Base URL: `/api` (same origin as the app). All request/response bodies are JSON.

- **Frontend calls use relative paths** (e.g. `/api/auth/login`), so no CORS origin is needed in production.
- **Errors** are always `{ "error": "<message>" }` with an appropriate status code.
- **Auth** uses a bearer token in the form `Authorization: Bearer <userId>:<role>` (e.g. `Bearer user-abc123:user`), issued by the login/register endpoints. Tokens are stored client-side in `localStorage` under `trippy_token` / `trippy_user`.

> **Fallback policy:** endpoints that depend on external services (Gemini, weather) never hard-fail — they return simulated/static data when keys are missing or providers error. See the [fallback matrix](DEPLOYMENT.md#fallback-matrix).

**Legend:** 🔓 public · 🔒 any authenticated user · 🛡️ admin only

---

## Table of contents

- [System](#system)
- [Authentication](#authentication)
- [Destinations](#destinations)
- [Packages](#packages)
- [Bookings](#bookings)
- [Reviews](#reviews)
- [Blogs](#blogs)
- [Saved Trips](#saved-trips)
- [Favorites](#favorites)
- [Contact](#contact)
- [Notifications](#notifications)
- [Weather](#weather)
- [Proxies](#proxies)
- [Gemini AI](#gemini-ai)

---

## System

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/firebase-config` | 🔓 | Firebase client configuration with the web API key injected from `FIREBASE_API_KEY` (keeps the key out of the static bundle) |

**Response** — the contents of `firebase-applet-config.json` plus `apiKey`. If `FIREBASE_API_KEY` is unset, `apiKey` is omitted.

---

## Authentication

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | Create an account |
| POST | `/auth/login` | 🔓 | Email/password login |
| POST | `/auth/google` | 🔓 | Link/lookup a Google sign-in (called by the client after Firebase popup) |
| GET | `/auth/me` | 🔒 | Validate the current session |
| PUT | `/auth/profile` | 🔓→🔒 | Update own profile |

**POST `/auth/register`**
```jsonc
// request
{ "name": "Ada", "email": "ada@example.com", "password": "secret" }
// 200 response
{ "user": { "id": "user-xxxx", "name": "Ada", "email": "ada@example.com", "role": "user", "created_at": "..." },
  "token": "user-xxxx:user" }
// 400 if fields missing or email already registered
```

**POST `/auth/login`** — `{ "email", "password" }` → same `{ user, token }` shape. `401` on bad credentials.

**POST `/auth/google`** — `{ "name", "email", "photoURL" }` → finds or creates the user, returns `{ user, token }`. (`400` without email.)

**GET `/auth/me`** — returns `{ "user": {...} }`; `401` if the token is missing/unknown. Used on app boot to restore sessions.

**PUT `/auth/profile`** — `{ "name"?, "email"?, "phone"?, "profile_image"? }` → `{ "user": {...} }`. `400` if the new email belongs to another account.

---

## Destinations

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/destinations` | 🔓 | Full catalogue (used by the carousel + admin selects) |
| GET | `/destinations/:id` | 🔓 | Single destination (fetched when a detail modal opens) |
| POST | `/destinations` | 🛡️ | Create a destination (admin panel / AI discovery) |

**POST `/destinations`** body mirrors the `Destination` type:

```jsonc
{
  "name": "Goa", "description": "...", "country": "India", "city": "Panaji",
  "latitude": 15.29, "longitude": 74.12,
  "image_url": "https://images.unsplash.com/...",
  "budget_range": "₹45,000 - ₹65,000", "best_season": "October - May",
  "category": "beach",            // beach | mountains | adventure | family
  "travel_style": "luxury",       // luxury | adventure | budget
  "climate": "tropical",          // tropical | alpine | moderate | desert
  "is_featured": false
}
```

`403` for non-admins.

---

## Packages

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/packages` | 🔓 | All tour packages |
| GET | `/packages/:id` | 🔓 | Single package (fetched when a modal opens) |
| POST | `/packages` | 🛡️ | Create a package (admin panel) |

**POST `/packages`**: `{ name, description, destination_id, price, duration, difficulty ("easy"|"moderate"|"hard"), inclusions: [], exclusions: [], itinerary: [], image_url, is_featured }`. `403` for non-admins.

---

## Bookings

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/bookings` | 🔒 | Own bookings (admins receive **all** bookings) |
| POST | `/bookings` | 🔒 | Create a booking (also emits a "Booking Confirmed 🎉" notification) |
| PUT | `/bookings/:id/status` | 🔒 / 🛡️ | Update status |

**POST `/bookings`**
```jsonc
{ "packageId": "pkg-xxx", "travelers": 2, "totalCost": 50000,
  "startDate": "2026-12-01", "endDate": "2026-12-05" }
```
→ returns the `Booking` record (status `confirmed`). `400` if required fields are missing.

**PUT `/bookings/:id/status`**
```jsonc
{ "status": "cancelled" }   // pending | confirmed | cancelled
```
- **Admins** may set any status.
- **Owners** may only set `cancelled` (this powers the Dashboard cancel button).
- `404` unknown booking · `403` when a non-admin/non-owner tries · `400` for an invalid status.
- Emits a "Booking Status Updated" notification to the owner.

---

## Reviews

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/reviews` | 🔓 | All reviews, optionally filtered by `?destination_id=` and/or `?package_id=` |
| POST | `/reviews` | 🔒 | Write a review (destination modal) |

**POST `/reviews`**
```jsonc
{ "rating": 5, "comment": "Amazing sunsets!", "destination_id": "dest-xxx" }
// package_id optional — reviews can target either entity
```
→ returns the `Review` (author name/image taken from the authenticated user). `400` if rating or comment is missing.

---

## Blogs

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/blogs` | 🔓 | All posts |
| GET | `/blogs/:id` | 🔓 | Single post (fetched when the reader opens) |
| POST | `/blogs` | 🛡️ | Create a post (admin panel; author taken from the token) |
| GET | `/blogs/:id/comments` | 🔓 | Comments for a post |
| POST | `/blogs/:id/comments` | 🔒 | Add a comment |

**POST `/blogs/:id/comments`** — `{ "comment": "Great write-up!" }` → the `BlogComment` record. `400` without text.

---

## Saved Trips

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/trips` | 🔒 | Own saved AI itineraries |
| POST | `/trips` | 🔒 | Save a generated itinerary (planner "Save Travel Plan") |
| DELETE | `/trips/:id` | 🔒 (owner) | Delete a saved trip |

**POST `/trips`**
```jsonc
{ "name": "Elite Escape to Goa", "itinerary": { /* generated trip JSON */ },
  "budget": 50000, "destination_id": "dest-xxx",
  "start_date": "2026-12-01", "end_date": "2026-12-05" }
```
→ `400` unless `name` and `itinerary` are present.

**DELETE `/trips/:id`** → `{ "success": true }` · `404` if the trip doesn't exist **or** belongs to another user.

---

## Favorites

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/favorites` | 🔒 | Own favorite destinations (`Favorite[]`) |
| POST | `/favorites/toggle` | 🔒 | Toggle a bookmark |

**POST `/favorites/toggle`** — `{ "destinationId": "dest-xxx" }` → `{ "favorited": true|false }`. `400` without an ID.

---

## Contact

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/contact` | 🛡️ | Admin inbox (Dashboard → Admin panel) |
| POST | `/contact` | 🔓 | Submit a message (footer contact modal / newsletter) |

**POST `/contact`**
```jsonc
{ "name": "Ada", "email": "ada@example.com",
  "subject": "Partnership", "message": "Hello..." }
```
→ returns the `ContactMessage` (`status: "unread"`). `400` if any field is missing.

---

## Notifications

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/notifications` | 🔒 | Own bulletins (`Notification[]`) |
| POST | `/notifications/:id/read` | 🔒 | Mark one as read → `{ "success": true }` |

Notifications are created automatically on booking confirmation and status changes.

---

## Weather

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/weather` | 🔓 | Current conditions for a city **or** coordinates |

```
GET /api/weather?city=Goa
GET /api/weather?lat=15.29&lon=74.12
```
`400` if neither `city` nor `lat`/`lon` is supplied.

**Response** (shape is identical across providers):
```jsonc
{ "temp": 29, "description": "Partly Cloudy", "humidity": 74,
  "wind_speed": 11, "condition": "Clouds", "city": "Goa",
  "country": "IN", "source": "openweathermap" }
```
`source` tells you which tier answered: `openweathermap` → `open-meteo` → `fallback` → `error-fallback`. The server-side chain never returns a 5xx.

---

## Proxies

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/proxy/countries` | 🔓 | Country dataset for the 3D globe (proxied from restcountries.com with a 6s timeout) |

`502` if the upstream fails — the globe falls back to its built-in country catalog.

---

## Gemini AI

All four endpoints accept an optional `"model"` field. Supported selections include `gemini-3.5-flash` (default), `gemini-2.5-flash`, `gemini-1.5-flash` and `simulated-cognitive-node` (forces offline mode). Server-side, every call retries through a **model fallback chain** on transient errors (400/401/403 stop immediately).

If `GEMINI_API_KEY` is unset, responses are simulated — the HTTP status stays `200`.

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/gemini/generate-trip` | 🔓 | Day-by-day itinerary generation |
| POST | `/gemini/chat` | 🔓 | Concierge chat with Google Search grounding |
| POST | `/gemini/discover-destination` | 🔓 | Create a destination from a free-text query |
| POST | `/gemini/recommendations` | 🔓 | 5 destination recommendations |

### POST `/gemini/generate-trip`
```jsonc
// request
{ "destination": "Goa", "budget": 50000, "days": 5, "travelers": 2,
  "interests": ["Beach", "Food"], "specialRequirements": "vegetarian" }
// 200 — normalized trip (supports both AI and frontend schemas)
{ "tripName": "...", "destination": "Goa", "duration": 5, "travelers": 2, "budget": 50000,
  "itinerary": [{ "day": 1, "title": "...", "activities": ["..."] }],
  "budget_breakdown": { "flight_transit": 17500, "lodging": 15000,
                        "food_dining": 10000, "sightseeing_shopping": 7500 },
  "packing_list": ["..."], "weather_tips": "...",
  "_fallback": false }   // _fallback:true when simulated
```
`400` without `destination`.

### POST `/gemini/chat`
```jsonc
// request
{ "userMessage": "Best beaches in Goa?",
  "messages": [{ "role": "user", "text": "..." }, { "role": "model", "text": "..." }] }
// 200
{ "text": "…concierge answer…",
  "sources": [{ "title": "TripAdvisor", "uri": "https://…" }] }   // Google Search grounding
```
`400` without `userMessage`. On provider failure a polished concierge fallback message is returned instead of an error.

### POST `/gemini/discover-destination`
```jsonc
// request
{ "query": "Zermatt" }
// 200 — a fully-formed Destination record (saved to the catalogue)
{ "id": "dest-xxx", "name": "Zermatt", "country": "Switzerland", "category": "mountains", ... }
```
If a destination with that name/city already exists it is returned as-is. Offline/error paths persist a simulated destination so the UI always receives a record.

### POST `/gemini/recommendations`
```jsonc
// request
{ "budget": "mid", "days": 7, "interests": ["adventure"] }
// 200 — exactly 5 items
[{ "name": "Leh Ladakh", "country": "India", "description": "…",
   "vibe": "Adventurous", "climate": "Cool alpine, 12°C", "avgCost": "₹35,000" }, …]
```

---

## Endpoint inventory (37)

| Domain | Count | Endpoints |
|---|---|---|
| System | 1 | `GET /firebase-config` |
| Auth | 5 | `register` · `login` · `google` · `me` · `profile` |
| Destinations | 3 | `GET /` · `GET /:id` · `POST /` |
| Packages | 3 | `GET /` · `GET /:id` · `POST /` |
| Bookings | 3 | `GET /` · `POST /` · `PUT /:id/status` |
| Reviews | 2 | `GET /` · `POST /` |
| Blogs | 5 | `GET /` · `GET /:id` · `POST /` · `GET /:id/comments` · `POST /:id/comments` |
| Saved trips | 3 | `GET /` · `POST /` · `DELETE /:id` |
| Favorites | 2 | `GET /` · `POST /toggle` |
| Contact | 2 | `GET /` · `POST /` |
| Notifications | 2 | `GET /` · `POST /:id/read` |
| Weather | 1 | `GET /weather` |
| Proxies | 1 | `GET /proxy/countries` |
| Gemini AI | 4 | `generate-trip` · `chat` · `discover-destination` · `recommendations` |

> Every endpoint above is exercised by the frontend. Admin-only routes are used by the Dashboard's admin panel (visible to the seeded demo admin).
