# CabinClick

In-flight cabin service platform with a passenger-facing mobile app, an iPad crew dashboard, and a FastAPI backend connected to Supabase.

---

## Repository layout

```
CabinClick/
├── b_msn0Yl57l55-1772294636255/   ← Next.js frontend (passenger + crew)
│   ├── app/
│   │   ├── page.tsx                  Passenger app entry
│   │   └── crew/page.tsx             Crew dashboard entry (/crew)
│   ├── components/
│   │   ├── screens/                  Passenger screens
│   │   └── crew/screens/             Crew screens C1–C7
│   ├── lib/
│   │   ├── i18n.ts                   8-language translations
│   │   ├── language-context.tsx      React locale context
│   │   ├── service-items.ts          Cabin service catalogue
│   │   └── crew-types.ts             Crew types + mock data
│   └── package.json
├── app/                            ← FastAPI backend
│   ├── api/routes/                   Route handlers
│   ├── core/config.py                Env config
│   ├── db/supabase.py                Supabase client
│   ├── schemas/                      Pydantic models
│   └── services/                     Business logic
├── supabase/migrations/            ← DB schema migrations
├── tests/                          ← Backend tests
└── requirements.txt
```

---

## 1 — Frontend (Next.js)

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| pnpm | ≥ 9 |

> **Why pnpm?** npm v10.2.4 + Node v20 has a known arborist bug that breaks symlinks in `node_modules/.bin`. Always use pnpm for this project.

### Install pnpm (if needed)

```bash
npm install -g pnpm
```

### Install dependencies & run dev server

```bash
cd b_msn0Yl57l55-1772294636255
pnpm install
pnpm dev
```

App is live at **http://localhost:3000**

### Available routes

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Passenger app (mobile, portrait) |
| `http://localhost:3000/crew` | Crew dashboard (iPad, landscape) |

### Build for production

```bash
cd b_msn0Yl57l55-1772294636255
pnpm build
pnpm start
```

---

### Passenger app — screen flow

```
Welcome / Boarding
  └─ QR scan (camera) or manual seat entry (e.g. 14A, LH441)
Language selection
  └─ 8 languages: EN · DE · FR · ES · AR · ZH · JA · TR
Dashboard
  └─ Live clock, flight progress bar, service category grid
Service selection
  └─ Drinks / Food / Comfort / Hygiene / Practical / Medical
  └─ Quantity selector for drinks & food (1–5)
Request tracking
  └─ Auto-advances: Submitted → Acknowledged → On the Way → Delivered
SOS flow
  └─ Hold-to-confirm emergency button (1.5 s)
Feedback survey
  └─ Star ratings + comments
Thank you screen
```

---

### Crew dashboard — screens (iPad · `/crew`)

| Screen | Key | What it does |
|--------|-----|--------------|
| Pre-Flight Setup | C1 | Flight number, route, zone assignments, crew roster, service timeline — "Activate" launches the dashboard |
| Live Request Queue | C2 | Real-time cards sorted by SOS → Priority → Pending; ACK button per card; START TRIP generates a delivery plan |
| Trip Plan | C3 | Galley pickup list, delivery stops ordered by row, delivered toggle, mid-trip new-request banner |
| SOS Alert Overlay | C4 | Full-screen red alert, pulsing seat number, original language quote, crew assignment dropdown, ACKNOWLEDGE |
| Notification Composer | C5 | 6 presets (trash / meal / drinks / turbulence / landing / custom), target (all / zone / seat), delay timer, auto-translate to 8 languages |
| Seat Map Overview | C6 | Colour-coded seat grid: grey=empty, white=occupied, amber=pending, blue=serving, green=delivered, red=SOS; side panel shows seat detail |
| Post-Flight Summary | C7 | KPI row, requests-by-category bar chart, feedback scores, crew activity, SOS incident log, response-time breakdown |

Navigation: left sidebar with badge counter on Requests tab. Crew avatars + live clock in header. SOS button appears in header when an SOS is active.

---

### Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript / React 19 |
| Styling | Tailwind CSS v4 + tw-animate-css |
| Components | shadcn/ui (Radix UI) |
| Icons | lucide-react |
| QR decode | jsQR (browser camera API) |
| Colours | `cabin-navy` #0B1F4D · `cabin-gold` #F5B731 |

---

## 2 — Backend (FastAPI)

### Prerequisites

| Tool | Version |
|------|---------|
| Python | ≥ 3.11 |
| pip | any recent |

### Setup

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Environment variables

Create `.env.local` in the project root:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
APP_NAME=CabinClick
APP_VERSION=0.1.0
API_V1_PREFIX=/api/v1
CORS_ORIGINS=http://localhost:3000

# AI — voice requests
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
DEFAULT_LANGUAGE=en
```

### Run the API

```bash
uvicorn app.main:app --reload
```

- API → **http://127.0.0.1:8000**
- Swagger docs → **http://127.0.0.1:8000/docs**

### API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/flights/register` | Register active flight |
| POST | `/api/v1/seats/{seat}/access` | Passenger QR check-in |
| GET | `/api/v1/seats/{seat}/requests` | Seat request history |
| POST | `/api/v1/seats/{seat}/requests` | Submit new request |
| POST | `/api/v1/seats/{seat}/voice-requests` | Voice request (Gemini AI extraction) |
| POST | `/api/v1/crew/access` | Crew iPad check-in |
| GET | `/api/v1/crew/members` | Crew roster |
| GET | `/api/v1/crew/instructions` | Crew instruction feed |
| GET | `/api/v1/crew/request-queue` | Pending request queue |
| GET | `/api/v1/management/requests/summary` | Management summary |

### MVP test flow (Swagger order)

1. `POST /api/v1/flights/register`
2. `POST /api/v1/seats/14C/access`
3. `POST /api/v1/seats/14C/requests`
4. `GET  /api/v1/seats/14C/requests`
5. `POST /api/v1/crew/access`
6. `GET  /api/v1/crew/members`
7. `GET  /api/v1/crew/instructions`
8. `GET  /api/v1/management/requests/summary`

### Run backend tests

```bash
pytest tests/ -v
```

### Database migration

```bash
# via Supabase CLI
supabase db push

# or run manually in Supabase SQL editor:
# supabase/migrations/20260228170000_airline_mvp_schema.sql
```

Tables: `flights`, `seat_access_sessions`, `passenger_requests`, `crew_members`, `crew_access_sessions`, `crew_instructions`, `crew_instruction_requests`
Views: `management_request_summary`, `management_request_category_summary`

---

## 3 — Running both services together

Open two terminal tabs from the project root:

**Tab 1 — Backend**
```bash
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Tab 2 — Frontend**
```bash
cd b_msn0Yl57l55-1772294636255
pnpm dev
```

| Service | URL |
|---------|-----|
| Passenger app | http://localhost:3000 |
| Crew dashboard | http://localhost:3000/crew |
| API (Swagger) | http://localhost:8000/docs |

---

## 4 — Git branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable — frontend + backend merged |
| `dev` | Active development |
| `akshit` | Backend feature work |
| `blair2` | Blair's feature branch |

---

## 5 — Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm install` fails with `ERR_INVALID_ARG_TYPE` | Use `pnpm install` instead — npm v10.2.4 + Node v20 has an arborist bug |
| `next: command not found` | Run `pnpm install` inside `b_msn0Yl57l55-1772294636255/` |
| `.git/index.lock` exists | `rm .git/index.lock` |
| Camera not working for QR scan | Allow camera permissions in browser; must be served over `localhost` or HTTPS |
| Supabase connection errors | Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local` |
| Backend 422 Unprocessable Entity | Register the flight first: `POST /api/v1/flights/register` |
| Port 3000 already in use | `lsof -i :3000` then `kill -9 <PID>`, or run `pnpm dev -- --port 3001` |
