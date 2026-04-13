# Dame Wine

A private wine tracking app for a group of friends — built around the WSET Level 2 framework. Track what you've tasted, discover new wines, and relive tasting events together.

---

## Features

### Wine Cellar
A shared catalog of wines that the whole group contributes to. Pre-seeded with 35 WSET Level 2 reference wines spanning all 6 types, key grape varieties, and major wine regions.

- Browse and filter by type, grape variety, region, and vintage year
- Add new wines to the catalog with full details (variety, region, country, year, tasting notes)
- Each wine has a permanent detail page showing all friends' ratings and comments

### Tasting Tracking
Every user maintains their own record for each wine.

- **Wishlist** — flag wines you want to try
- **Tasted** — mark wines you've had, with a 1–5 star rating and tasting notes
- Notes are personal but visible to all friends on the wine detail page

### My List
A personal dashboard showing your wishlist and all wines you've tasted, with ratings and comments. Filter by status. Link directly to any wine's detail page.

### Home / Profile Dashboard
Your personal stats at a glance after logging in.

- **World map** — countries you've tasted wine from highlighted in burgundy
- **Stats** — total tasted, number of distinct varieties, regions, and countries explored
- **Grape variety breakdown** — bar chart of all varieties you've tried with counts
- **Region breakdown** — same for wine regions
- **Wine type summary** — Red / White / Rosé / Sparkling / Dessert / Fortified counts
- **Average rating** and wishlist count
- **Recent tastings** — quick links to your last 5 wines

### Tasting Events
Plan and document tasting nights with the group.

- Create events with name, date/time, location, and notes
- Invite friends from the user list (host is auto-included)
- Attach wines from the cellar catalog to the event
- The event detail page shows **every attendee's rating and comment for each wine side-by-side**, so the whole group can compare notes from the same night
- Past and upcoming events are shown separately

### Authentication
Simple name + password login. No email required — just pick a name and join.

---

## Data Entities

### User
Represents a member of the friend group.

| Field | Type | Description |
|---|---|---|
| id | Int | Primary key |
| name | String | Unique display name (used to log in) |
| passwordHash | String | bcrypt hash of password |
| createdAt | DateTime | Account creation time |

### Wine
A bottle in the shared catalog.

| Field | Type | Description |
|---|---|---|
| id | Int | Primary key |
| name | String | Full wine name (e.g. "Château Margaux") |
| variety | String | Grape variety (e.g. "Cabernet Sauvignon") |
| type | String | RED / WHITE / ROSE / SPARKLING / DESSERT / FORTIFIED |
| region | String | Wine region (e.g. "Bordeaux") |
| country | String | Country of origin |
| year | Int? | Vintage year (null = non-vintage) |
| description | String? | Tasting notes / profile |
| createdBy | Int? | User ID who added it (null = seeded) |
| createdAt | DateTime | When added to catalog |

### Tasting
A user's personal record for a specific wine.

| Field | Type | Description |
|---|---|---|
| id | Int | Primary key |
| userId | Int | FK → User |
| wineId | Int | FK → Wine |
| status | String | WISHLIST or TASTED |
| rating | Int? | 1–5 stars (set when TASTED) |
| comment | String? | Personal tasting notes |
| tastedAt | DateTime? | When the wine was consumed |
| createdAt | DateTime | When the record was created |

Unique constraint: one record per (user, wine) pair.

### TastingEvent
A planned or past tasting meeting.

| Field | Type | Description |
|---|---|---|
| id | Int | Primary key |
| name | String | Event name (e.g. "Friday Night Tasting") |
| location | String? | Where it's happening |
| scheduledAt | DateTime | Date and time of the event |
| notes | String? | Host notes about the event |
| createdBy | Int | FK → User (host) |
| createdAt | DateTime | When the event was created |

### EventAttendee
Which users are attending a given event.

| Field | Type | Description |
|---|---|---|
| eventId | Int | FK → TastingEvent |
| userId | Int | FK → User |

Composite primary key: (eventId, userId).

### EventWine
Which wines are on the menu for a given event.

| Field | Type | Description |
|---|---|---|
| eventId | Int | FK → TastingEvent |
| wineId | Int | FK → Wine |

Composite primary key: (eventId, wineId).

---

## Pages

| Route | Description |
|---|---|
| `/` | Redirects to `/home` (logged in) or `/login` |
| `/login` | Sign in with name + password |
| `/register` | Create a new account |
| `/home` | Personal profile dashboard with stats and world map |
| `/wines` | Browse the wine catalog with filters |
| `/wines/[id]` | Wine detail — tasting notes from all friends |
| `/wines/add` | Add a new wine to the catalog |
| `/my-list` | Your wishlist and tasted wines |
| `/events` | Upcoming and past tasting events |
| `/events/new` | Create a tasting event |
| `/events/[id]` | Event detail — all attendees' notes per wine |
