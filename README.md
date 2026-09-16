# MedPath — Node + Express + React (Vite)

A port of the original Next.js MedPath app to a conventional two-tier setup:
an Express REST API and a React single-page client. Same database, same
features, same UI.

```
medpath-express/
├── server/          Express API (Node 20+, ESM)
└── client/          React 19 SPA (Vite, React Router 7, Tailwind v4)
```

---

## Running it

You need Node 20 or newer and the Neon/Postgres connection string.

### 1. Server

```bash
cd server
npm install
cp .env.example .env      # fill in DATABASE_URL, GROQ_API_KEY, JWT_SECRET
npm run migrate           # creates tables from server/sql/*.sql
npm run dev               # http://localhost:4000
```

### 2. Client

In a second terminal:

```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:4000
npm run dev               # http://localhost:5173
```

Open http://localhost:5173.

### Creating the first admin

The old app shipped a default admin row in `002-add-admin-schema.sql`
(`admin@medpath.ai` / `admin123`). That is fine locally and a liability
anywhere else. To set your own:

```bash
cd server
npm run setup-admin
```

### Production

```bash
cd client && npm run build          # emits client/dist
cd ../server && SERVE_CLIENT=true npm start
```

With `SERVE_CLIENT=true` the API also serves `client/dist` and falls back to
`index.html` for client-side routes, so a single process serves everything on
one origin and you can drop `CLIENT_ORIGIN`/CORS.

---

## How the Next.js concepts were translated

| Next.js | Here |
| --- | --- |
| Server Actions (`app/actions/*.js`) | Express routers (`server/src/routes/*.js`) |
| Route Handlers (`app/api/*/route.js`) | `routes/triage.js`, `routes/upload.js`, `routes/setup.js` |
| `getSession()` from `next/headers` | `attachUser` middleware → `req.user` |
| Per-action `requireAdmin()` | `requireAuth` / `requireRole()` middleware |
| `redirect()` inside an action | API module calls `navigateTo()` (`client/src/lib/navigation.js`) |
| `revalidatePath()` | `revalidate()` fires `medpath:refresh`; `useAsync` reloads |
| `router.refresh()` | same event |
| `async` server component `await`ing data | `useAsync()` hook in the route component |
| App Router file routing | `client/src/App.jsx` route table |
| `layout.jsx` + session redirect | `RequireRole` guard + `layouts/*.jsx` |
| `next/link` | `react-router-dom` `Link` (`href` → `to`) |
| `next/navigation` | `client/src/lib/next-compat.jsx` |
| `next/image` | `<img>` (Next config already had optimisation off) |
| `next/font/google` | `<link>` to Google Fonts in `index.html` |
| FormData parsing in `/api/upload` | `multer`, files served from `/uploads` |

### The trick that kept the UI untouched

`client/src/api/*.js` exports **the same function names and signatures** as the
old `app/actions/*.js` — `login(formData)`, `getAllUsers(filters)`,
`submitTriageAssessment(data)`, and so on. The codemod only had to rewrite the
import path (`@/app/actions/...` → `@/api/...`). The ~9,000 lines of component
code inside `client/src/components` are otherwise unchanged, including all 58
shadcn/ui primitives.

React 19 supports `<form action={fn}>` outside Next, so the components that
pass a handler to `action=` and receive `FormData` still work as written.

---

## Things that changed on purpose

**Dynamic admin queries.** The originals built WHERE clauses by nesting Neon
`sql` fragments (``sql`${query} AND u.role = ${role}` ``). That is brittle and
version-dependent. Filtered admin queries now use `sql.query(text, params)`
with explicit `$n` placeholders — still fully parameterised, no interpolation
of values into SQL.

**The triage chat was broken and now works.** `PatientTriageChat` used
`useChat` from `@ai-sdk/react` and waited for a `finishAssessment` tool call,
but `/api/triage` returned plain text and never emitted tool calls, so that
branch could never fire. It now posts to the API directly and watches for the
`assessmentComplete` JSON the system prompt actually asks the model to produce.

**Chat and video signalling are access-checked.** `getMessages()` and
`getSignals()` previously took an `appointmentId` and returned rows without
checking the caller was on that appointment. The routes verify participation
first.

**`/api/setup-admin` is guarded.** It was an open endpoint that could mint an
admin. It now requires a `SETUP_SECRET` header, and is disabled unless that env
var is set. Prefer `npm run setup-admin`.

**`GROQ_API_KEY` name mismatch fixed.** `lib/ai-diagnosis.js` read
`GROQ_API_KEY` while the committed `.env` defined `GROQ_API`. The server accepts
either.

---

## Security notes

Two things carried over unchanged that you should fix before this goes near
real users:

1. **Password hashing is SHA-256 with a hardcoded salt** (`"medpath-salt"`).
   This was a workaround for the edge runtime, which no longer applies on a
   long-lived Node server. `bcrypt` or `argon2` is the right call. Changing it
   invalidates existing hashes, so you'd need a migration that re-hashes on next
   successful login.

2. **The original repo committed a live `.env`** with `DATABASE_URL`,
   `GROQ_API`, and `NEXTAUTH_SECRET`. Rotate all three. `.gitignore` in both
   packages excludes `.env` here.

Also worth doing: rate-limit `/api/auth/login` and `/api/diagnosis/*` (the
latter costs money per call), and set `JWT_SECRET` to something long and random
rather than falling back to the built-in default.

---

## Known rough edges

- Video calling polls `/api/video/:id/signals` on an interval, same as before.
  A WebSocket or SSE channel would be a real improvement now that there's a
  long-lived server to host one.
- Chat polls for new messages for the same reason.
- The client bundle is ~1.2 MB (340 kB gzipped) because everything is in one
  chunk. Route-level `React.lazy` would cut the initial load substantially.
- `framer-motion@12.25.0` resolves a newer `motion-dom` that breaks the Rollup
  build, so `client/package.json` pins `motion-dom` and `motion-utils` through
  `overrides`. Remove the pins once framer-motion widens its range.
