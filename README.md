<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node.js 20+" />
  <img src="https://img.shields.io/badge/react-19.2-blue" alt="React 19" />
  <img src="https://img.shields.io/badge/express-4.x-lightgrey" alt="Express 4" />
  <img src="https://img.shields.io/badge/database-Neon%20Postgres-00E5CC" alt="Neon Postgres" />
  <img src="https://img.shields.io/badge/AI-Groq%20SDK-orange" alt="Groq AI" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
</p>

# MedPath — AI-Powered Medical Diagnosis Platform

**MedPath** is a full-stack medical diagnosis and telemedicine platform that combines AI-driven symptom analysis with real-time doctor-patient communication. Patients interact with an AI triage nurse, receive Bayesian-inference-based diagnoses, find nearby hospitals, book appointments with specialists, and consult doctors via in-app chat and video calls.

> **Live Demo**
> - 🌐 Frontend: [medpath-gamma.vercel.app](https://medpath-gamma.vercel.app)
> - 🔌 API: [medpath-wbxy.onrender.com](https://medpath-wbxy.onrender.com/api/health)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Admin Setup](#admin-setup)
- [Security Notes](#security-notes)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Features

### For Patients
- **AI Triage Nurse** — Conversational chat that gathers symptoms, demographics, and history before diagnosis
- **AI Diagnosis Engine** — Bayesian-network-based differential diagnosis with risk scoring, urgency levels, red flags, and reasoning traces
- **Nearby Hospital Finder** — Geocoded hospital/clinic search via OpenStreetMap + Overpass API
- **Appointment Booking** — Browse doctors by specialty, view available time slots, and book appointments
- **Real-time Chat** — In-app messaging with assigned doctors per appointment
- **Video Consultation** — WebRTC-based video calls with signaling through the API
- **Diagnosis History** — Full history of past assessments with detailed results

### For Doctors
- **Dashboard** — Overview of upcoming appointments, patient stats, and recent activity
- **Onboarding** — Specialty, city, hospital, and availability configuration
- **Appointment Management** — Confirm, complete, or cancel appointments with notes
- **Patient Chat & Video** — Respond to patients via chat and initiate video calls

### For Admins
- **Full CRUD Panel** — Manage users, doctors, appointments, and diagnoses with dynamic SQL filters
- **Doctor Verification** — Approve or block doctor profiles
- **Diagnosis Flagging** — Flag AI predictions for manual review
- **Audit Logging** — Every admin action is logged with metadata, IP, and timestamps
- **Analytics Dashboard** — Platform-wide metrics and charts

---

## Architecture

```
┌─────────────────────┐         HTTPS          ┌─────────────────────┐
│                     │ ◄────────────────────── │                     │
│   React SPA (Vite)  │                         │      Browser        │
│   Vercel Edge CDN   │ ──────────────────────► │                     │
│                     │                         └─────────────────────┘
└────────┬────────────┘
         │  fetch() with Bearer token
         ▼
┌─────────────────────┐                         ┌─────────────────────┐
│                     │ ──── neon() HTTP ──────► │                     │
│   Express API       │                         │  Neon Postgres      │
│   Render.com        │ ◄───────────────────── │  (Serverless)       │
│                     │                         └─────────────────────┘
│                     │
│                     │ ──── groq SDK ────────► Groq Cloud (LLM)
│                     │
│                     │ ──── Nominatim ───────► OpenStreetMap
│                     │ ──── Overpass API ────► Hospital/Clinic Data
└─────────────────────┘
```

The application is a **monorepo** with two independent packages:

| Package | Role | Runtime |
|---------|------|---------|
| `client/` | React 19 SPA — UI, routing, auth state | Vite dev server / static CDN |
| `server/` | Express 4 REST API — business logic, AI, database | Node.js 20+ |

Authentication uses **dual-mode JWT**: HttpOnly cookies for same-origin setups, plus `Authorization: Bearer` tokens stored in `localStorage` for cross-origin deployments (Vercel → Render).

---

## Tech Stack

### Server
| Concern | Technology |
|---------|-----------|
| Runtime | Node.js 20+ (ESM) |
| Framework | Express 4 |
| Database Driver | `@neondatabase/serverless` (Neon HTTP) |
| Authentication | `jose` (JWT sign/verify, HS256) |
| AI/LLM | `groq-sdk` → `openai/gpt-oss-120b` with automatic fallback to `openai/gpt-oss-20b` |
| Validation | `zod` |
| File Uploads | `multer` |
| Logging | `morgan` |

### Client
| Concern | Technology |
|---------|-----------|
| Framework | React 19.2 |
| Build Tool | Vite 6 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (58 primitives via Radix UI) |
| Charts | Recharts |
| Animations | Framer Motion 12 |
| Forms | React Hook Form + Zod |
| Theming | `next-themes` |

---

## Project Structure

```
MedPath/
├── client/                          # React SPA
│   ├── src/
│   │   ├── api/                     # API action functions (mirrors old Next.js actions)
│   │   ├── components/
│   │   │   ├── admin/               # Admin panel components (8)
│   │   │   ├── auth/                # Login & register forms (2)
│   │   │   ├── chat/                # Chat panel, video call overlay (5)
│   │   │   ├── doctor/              # Doctor dashboard, appointments (6)
│   │   │   ├── patient/             # Assessment, triage, booking, history (10)
│   │   │   └── ui/                  # shadcn/ui primitives (58)
│   │   ├── context/                 # AuthContext with event-driven state
│   │   ├── hooks/                   # useAsync, custom hooks
│   │   ├── layouts/                 # PatientLayout, DoctorLayout, AdminLayout, RequireRole
│   │   ├── lib/                     # api-client, navigation, next-compat, utils
│   │   ├── pages/                   # 22 route-level page components
│   │   ├── App.jsx                  # Route table
│   │   └── main.jsx                 # Entry point
│   ├── vercel.json                  # SPA rewrites
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Express API
│   ├── src/
│   │   ├── lib/
│   │   │   ├── auth.js              # JWT, password hashing, session management
│   │   │   ├── ai-diagnosis.js      # Groq-powered Bayesian diagnosis engine
│   │   │   └── location-service.js  # Geocoding + hospital search (OSM/Overpass)
│   │   ├── middleware/
│   │   │   └── auth.js              # attachUser, requireAuth, requireRole
│   │   ├── routes/
│   │   │   ├── admin.js             # Full admin CRUD (576 lines)
│   │   │   ├── appointments.js      # Booking, slots, status management
│   │   │   ├── auth.js              # Login, register, logout, /me
│   │   │   ├── chat.js              # Appointment-scoped messaging
│   │   │   ├── diagnosis.js         # AI assessment + history
│   │   │   ├── doctor.js            # Doctor profiles + public listing
│   │   │   ├── location.js          # Nearby hospitals endpoint
│   │   │   ├── setup.js             # Guarded admin bootstrap
│   │   │   ├── triage.js            # AI triage nurse conversation
│   │   │   ├── upload.js            # File uploads via multer
│   │   │   └── video.js             # WebRTC signaling (offer/answer/ICE)
│   │   ├── scripts/
│   │   │   ├── migrate.js           # Run SQL migrations
│   │   │   └── setup-admin.js       # Interactive admin creation
│   │   ├── db.js                    # Neon connection with safe fallback
│   │   └── index.js                 # App entry — CORS, middleware, routes
│   ├── sql/
│   │   ├── 001-create-schema.sql    # Users, doctor_profiles, predictions, appointments
│   │   ├── 002-add-admin-schema.sql # Admin role, audit_logs, default admin user
│   │   ├── 003-add-chat-schema.sql  # chat_messages table
│   │   └── 004-add-video-call-schema.sql  # video_call_signals table
│   ├── .env.example
│   └── package.json
│
├── .vercelignore                    # Excludes server/ from Vercel builds
├── vercel.json                      # Root Vercel config (build + SPA rewrites)
└── package.json                     # Root scripts (build, start)
```

---

## Prerequisites

- **Node.js** ≥ 20 — [Download](https://nodejs.org/)
- **Neon Postgres** database — [neon.tech](https://neon.tech/) (free tier works)
- **Groq API key** — [console.groq.com](https://console.groq.com/) (free tier works)

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/avinashyadav5/MedPath.git
cd MedPath
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and fill in your credentials (see [Environment Variables](#environment-variables)).

### 3. Run database migrations

```bash
npm run migrate
```

This executes all SQL files in `server/sql/` in order, creating the full schema.

### 4. Start the API server

```bash
npm run dev          # http://localhost:4000 (with --watch for auto-reload)
```

### 5. Set up the client (in a new terminal)

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:4000
```

### 6. Start the client dev server

```bash
npm run dev          # http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Single-process production mode

```bash
cd client && npm run build
cd ../server && SERVE_CLIENT=true npm start
```

With `SERVE_CLIENT=true`, the Express server also serves `client/dist/` and falls back to `index.html` for client-side routes. This eliminates CORS entirely and runs everything on a single origin.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | Neon Postgres connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `GROQ_API_KEY` | ✅ | Groq API key (also accepts `GROQ_API`) | `gsk_xxxxxxxxxxxx` |
| `JWT_SECRET` | ✅ | Secret for signing JWTs — use a long random string | `your-random-secret-here` |
| `CLIENT_ORIGIN` | ❌ | Comma-separated allowed origins for CORS | `https://medpath-gamma.vercel.app` |
| `PORT` | ❌ | Server port (default: `4000`) | `4000` |
| `NODE_ENV` | ❌ | Environment (`development` / `production`) | `production` |
| `GROQ_MODEL` | ❌ | Override default LLM model | `openai/gpt-oss-120b` |
| `SERVE_CLIENT` | ❌ | Serve built client from Express (default: `false`) | `true` |
| `SETUP_SECRET` | ❌ | Required header value to use `/api/setup` endpoint | `my-setup-secret` |

### Client (`client/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ | Full URL of the Express API server | `https://medpath-wbxy.onrender.com` |

---

## Database

### Provider

[Neon](https://neon.tech/) — serverless Postgres accessed over HTTP via `@neondatabase/serverless`. No connection pooling or persistent TCP connections required.

### Schema

The database is initialized via 4 sequential migration files:

| Migration | Tables Created / Modified |
|-----------|--------------------------|
| `001-create-schema.sql` | `users`, `doctor_profiles`, `predictions`, `appointments` + indexes |
| `002-add-admin-schema.sql` | Adds `admin` role, `audit_logs` table, `is_active`/`is_verified` columns, diagnosis flagging, default admin user |
| `003-add-chat-schema.sql` | `chat_messages` table, `last_message_at` on appointments |
| `004-add-video-call-schema.sql` | `video_call_signals` table for WebRTC signaling |

### ER Diagram

```
users (id PK, name, email, password, role, is_active, is_verified, deleted_at)
  │
  ├──< doctor_profiles (user_id FK → users, specialty, city, availability, hospital_name, is_verified, is_blocked)
  │
  ├──< predictions (user_id FK → users, patient_name, age, gender, city, symptoms, diagnosis, risk_percent, urgency, ...)
  │
  ├──< appointments (patient_id FK → users, doctor_id FK → users, prediction_id FK → predictions, date, time_slot, status, notes)
  │     │
  │     ├──< chat_messages (appointment_id FK → appointments, sender_id FK → users, message)
  │     │
  │     └──< video_call_signals (appointment_id FK → appointments, sender_id FK → users, signal_type, signal_data)
  │
  └──< audit_logs (admin_id FK → users, action_type, target_type, target_id, description, metadata, ip_address)
```

### User Roles

| Role | Access |
|------|--------|
| `patient` | Triage, diagnosis, appointments, chat, video, history, nearby hospitals |
| `doctor` | Dashboard, appointments, patient chat, video, settings, onboarding |
| `admin` | Full CRUD on all entities, audit logs, analytics, doctor verification |

---

## API Reference

All endpoints are prefixed with `/api`. Authentication is via JWT (cookie or `Authorization: Bearer <token>` header).

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | ❌ | Returns `{ "ok": true, "service": "medpath-api" }` |

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | ❌ | Login with email/password → returns user + JWT token |
| `POST` | `/auth/register` | ❌ | Register new patient or doctor → returns user + JWT token |
| `POST` | `/auth/logout` | ✅ | Clears session cookie |
| `GET` | `/auth/me` | ✅ | Returns current authenticated user |
| `GET` | `/auth/doctor-profile` | ✅ Doctor | Returns the doctor's profile |

### AI Diagnosis (`/api/diagnosis`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/diagnosis/assessment` | ✅ Patient | Submit symptoms → AI-generated diagnosis with risk scoring |
| `POST` | `/diagnosis/triage-assessment` | ✅ Patient | Submit triage-collected data for diagnosis |
| `GET` | `/diagnosis/prediction/:id` | ✅ | Get a specific prediction result |
| `GET` | `/diagnosis/history` | ✅ Patient | Get patient's diagnosis history |

### AI Triage (`/api/triage`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/triage/` | ✅ Patient | Conversational triage nurse — send message array, receive text response |

### Doctor (`/api/doctor`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/doctor/profile` | ✅ Doctor | Get own profile |
| `PUT` | `/doctor/profile` | ✅ Doctor | Update/create profile (onboarding) |
| `GET` | `/doctor/appointments` | ✅ Doctor | List doctor's appointments |
| `GET` | `/doctor/stats` | ✅ Doctor | Dashboard statistics |
| `GET` | `/doctor/:doctorId/public` | ✅ | Public doctor profile for booking |

### Appointments (`/api/appointments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/appointments/` | ✅ Patient | Book an appointment |
| `GET` | `/appointments/` | ✅ | List user's appointments |
| `GET` | `/appointments/:id` | ✅ | Get appointment details |
| `GET` | `/appointments/:id/chat-details` | ✅ | Get chat metadata for appointment |
| `GET` | `/appointments/slots/:doctorId` | ✅ | Get available time slots |
| `PATCH` | `/appointments/:id/cancel` | ✅ | Cancel an appointment |
| `PATCH` | `/appointments/:id/status` | ✅ Doctor | Update appointment status |

### Chat (`/api/chat`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/chat/:appointmentId/messages` | ✅ | Get messages (participation verified) |
| `POST` | `/chat/:appointmentId/messages` | ✅ | Send a message |

### Video Calls (`/api/video`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/video/:appointmentId/signal` | ✅ | Send WebRTC signal (offer/answer/ice/end) |
| `GET` | `/video/:appointmentId/signals` | ✅ | Poll for incoming signals (participation verified) |

### Location (`/api/location`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/location/nearby-hospitals` | ✅ | Find hospitals near a city, optionally filtered by specialty tags |

### Admin (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/stats` | ✅ Admin | Platform-wide statistics |
| `GET` | `/admin/users` | ✅ Admin | List/filter users (dynamic SQL) |
| `PATCH` | `/admin/users/:id` | ✅ Admin | Update user (activate/deactivate/role) |
| `DELETE` | `/admin/users/:id` | ✅ Admin | Soft-delete user |
| `GET` | `/admin/doctors` | ✅ Admin | List/filter doctors |
| `PATCH` | `/admin/doctors/:id/verify` | ✅ Admin | Verify/unverify a doctor |
| `PATCH` | `/admin/doctors/:id/block` | ✅ Admin | Block/unblock a doctor |
| `GET` | `/admin/diagnoses` | ✅ Admin | List/filter diagnoses |
| `PATCH` | `/admin/diagnoses/:id/flag` | ✅ Admin | Flag/unflag a diagnosis |
| `GET` | `/admin/appointments` | ✅ Admin | List/filter appointments |
| `PATCH` | `/admin/appointments/:id` | ✅ Admin | Update appointment status |
| `GET` | `/admin/audit-logs` | ✅ Admin | View audit trail |
| `GET` | `/admin/analytics` | ✅ Admin | Analytics data for charts |

### File Upload (`/api/upload`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/upload/` | ✅ | Upload a file (multipart form-data via multer) |

### Setup (`/api/setup`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/setup/admin` | `SETUP_SECRET` header | Bootstrap an admin user (disabled unless `SETUP_SECRET` env var is set) |

---

## Deployment

### Frontend → Vercel

1. Import the GitHub repository on [vercel.com](https://vercel.com)
2. Configure build settings:

   | Setting | Value |
   |---------|-------|
   | Framework | Vite |
   | Build Command | `cd client && npm install && npm run build` |
   | Output Directory | `client/dist` |
   | Install Command | `echo skip` |
   | Root Directory | *(leave empty)* |
   | Node.js Version | 22.x |

3. Add environment variable:
   - `VITE_API_URL` = your Render API URL (e.g., `https://medpath-wbxy.onrender.com`)

4. Deploy. The root `vercel.json` handles SPA rewrites automatically.

> **Note:** The `.vercelignore` file excludes `server/` from Vercel builds to reduce upload size.

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect the GitHub repository
3. Configure:

   | Setting | Value |
   |---------|-------|
   | Root Directory | `server` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Node Version | 20+ |

4. Add environment variables:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `GROQ_API` | Your Groq API key |
   | `JWT_SECRET` | A long random string |
   | `NODE_ENV` | `production` |
   | `CLIENT_ORIGIN` | Your Vercel frontend URL |

5. Deploy. Verify with `GET /api/health`.

> **⚠️ Free tier note:** Render free instances spin down after inactivity. The first request after idle can take 50+ seconds. Consider upgrading for production use.

---

## Admin Setup

### Default admin account

Migration `002` creates a default admin:
- **Email:** `admin@medpath.ai`
- **Password:** `admin123`

> **⚠️ Change this immediately in production.** The password hash is committed in the migration file.

### Creating a custom admin

```bash
cd server
npm run setup-admin
```

This runs an interactive script that prompts for name, email, and password, then inserts a new admin user with a hashed password.

Alternatively, the `/api/setup/admin` endpoint can create an admin when `SETUP_SECRET` is set as an environment variable and passed as a request header.

---

## Security Notes

> [!CAUTION]
> This project was built as a **demonstration/portfolio application**. Review these items before any production deployment with real patient data.

1. **Password hashing uses SHA-256 with a hardcoded salt** (`"medpath-salt"`). This was inherited from the original Next.js edge runtime constraints. On a long-lived Node server, migrate to `bcrypt` or `argon2`. Changing the algorithm invalidates existing hashes — implement a re-hash-on-login migration.

2. **Rotate all secrets** if they were ever committed to version control. This includes `DATABASE_URL`, `GROQ_API_KEY`, `JWT_SECRET`, and the default admin password.

3. **Rate limiting** is not implemented on `/api/auth/login` (brute-force risk) or `/api/diagnosis/*` (each call costs Groq API credits). Consider `express-rate-limit`.

4. **HIPAA/medical compliance** — This is a demonstration app. Real medical data handling requires encryption at rest, audit trails (partially implemented), consent management, and regulatory compliance review.

---

## Known Limitations

- **Video and chat use polling**, not WebSockets. The API is hit every few seconds via `setInterval`. A WebSocket or SSE upgrade would reduce latency and server load.
- **Client bundle is ~1.2 MB** (340 KB gzipped). All routes are in a single chunk. Route-level code splitting with `React.lazy()` would significantly reduce initial load time.
- **Framer Motion version pinning** — `framer-motion@12.25.0` has a dependency resolution issue with `motion-dom`. `client/package.json` uses `overrides` to pin compatible versions. Remove once upstream fixes land.
- **Free-tier cold starts** — Render's free tier spins down after inactivity. First requests after idle may take 50+ seconds.

---

## Scripts Reference

### Root

```bash
npm run build          # Builds the client (cd client && npm run build)
npm start              # Starts the server (node server/src/index.js)
```

### Server (`cd server`)

```bash
npm run dev            # Start with --watch (auto-reload)
npm start              # Production start
npm run migrate        # Run all SQL migrations
npm run setup-admin    # Create admin user interactively
```

### Client (`cd client`)

```bash
npm run dev            # Vite dev server on :5173
npm run build          # Production build → dist/
npm run preview        # Preview production build locally
```

---

## License

MIT

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/avinashyadav5">Avinash Yadav</a>
</p>
