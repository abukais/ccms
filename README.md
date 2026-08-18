# CSC Complain & Suggest Portal

Anonymous complaint and suggestion portal for Chandrabhan Sharma College.
Built with TanStack Start (React 19), Tailwind CSS v4, and Supabase.

---

## Setup (3 steps)

### 1 — Run the SQL in Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase_setup.sql`
   - Creates `submissions` + `contact_messages` tables
   - Creates `submission-images` storage bucket (public)
   - Adds RLS policies, indexes, and 5 sample rows

### 2 — Create `.env`
```bash
cp .env.example .env
```
Fill in your values from **Supabase → Project Settings → API**:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=changeme123
```

### 3 — Install & run
```bash
bun install
bun run dev
```
Open http://localhost:3000

---

## Pages

| URL | Description |
|---|---|
| `/` | Home — live stats, recent suggestions |
| `/submit` | Submit complaint or suggestion + up to 5 images |
| `/track` | Track ticket by ID — live timeline, images, admin notes |
| `/suggestions` | Community board — filter, search, upvote |
| `/contact` | Contact form |
| `/faqs` | FAQ accordion |
| `/about` | About page |
| `/admin` | 🔒 Hidden admin panel (not linked anywhere) |

---

## Admin Panel (`/admin`)

Protected by `VITE_ADMIN_USERNAME` / `VITE_ADMIN_PASSWORD` from `.env`.
Session clears when the browser tab closes.

**Admin can:**
- View all submissions with search + filters
- Change status: Submitted → Under Review → Forwarded → Resolved
- Add a note per status change (visible to student on `/track`)
- Write free-form admin notes (visible to student on `/track`)
- View all student-uploaded images in a lightbox

---

## Deployment

```bash
bun run build   # outputs to dist/
```

Deploy `dist/` to Netlify / Vercel / GitHub Pages.
Set the 4 env vars in your hosting dashboard.
