# Atlas — BD Command Center
## Project Handoff Document for Claude

---

## What Atlas Is
A full-stack AI-powered Business Development command center for Annie Bing, targeting Florida multifamily real estate. Think Salesforce + ChatGPT built specifically for her workflow.

**Live URL:** https://atlas-one-omega.vercel.app
**GitHub:** https://github.com/Anniebing1/Atlas
**Local path:** /Users/anniebing/atlas

---

## Tech Stack
- **Framework:** Next.js 16 (App Router) — `/Users/anniebing/atlas`
- **Database:** Supabase (Postgres) — project ID: `snxjziwnzyhkpsdmmmjq`
- **Auth:** Supabase magic-link email login
- **AI:** Anthropic Claude API (`claude-opus-4-5`)
- **Email:** Resend (not yet connected — API key needed)
- **Deployment:** Vercel — project: `annie-b-projects17/atlas`
- **Styling:** Tailwind CSS

---

## Credentials & Keys (stored in /Users/anniebing/atlas/.env.local)
- `NEXT_PUBLIC_SUPABASE_URL` = https://snxjziwnzyhkpsdmmmjq.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = legacy JWT key (eyJ...)
- `ANTHROPIC_API_KEY` = set in Vercel + .env.local
- `RESEND_API_KEY` = NOT YET SET — needed for morning briefing emails
- `RESEND_FROM_EMAIL` = NOT YET SET

**Supabase access token:** generate at https://supabase.com/dashboard/account/tokens
**Vercel access token:** generate at https://vercel.com/account/tokens
**GitHub repo:** https://github.com/Anniebing1/Atlas (user: Anniebing1)

---

## Database Schema (Supabase)
RLS is **disabled** on all tables (single-user app).

### `companies` table
Properties from CoStar — 1,123 records imported.
Columns: `id, name, website, industry, notes, address, city, state, market, units, building_class, year_built, owner_name, manager_name, for_sale, sale_price, created_at`

### `contacts` table
ZoomInfo-enriched contacts — 32 records imported.
Columns: `id, company_id, first_name, last_name, email, title, notes, created_at`

### `deals` table
Pipeline deals.
Columns: `id, company_id, contact_id, title, value, stage, notes, created_at, updated_at`
Stages: Qualified → Discovery → Proposal → Negotiation → Closed Won / Closed Lost

### `activities` table
Activity log (not yet wired to UI).
Columns: `id, deal_id, type, description, created_at`

---

## Data Imported
- **CoStar FL 1:** `/Users/anniebing/Desktop/CoStar/FL CoStar 1.numbers` — 1,149 multifamily properties
- **CoStar FL 2:** `/Users/anniebing/Desktop/CoStar/CoStar FL 2.numbers` — 973 multifamily properties
- **Total:** 1,123 unique properties imported as companies
- **ZoomInfo contacts:** 32 contacts (C-Suite, Operations, Facilities, Construction titles at FL real estate firms)
- **Import script:** `/Users/anniebing/atlas/scripts/import-costar-zoominfo.py`
- **Backfill script:** `/Users/anniebing/atlas/scripts/migrate-and-backfill.py`

---

## Pages Built
| Page | URL | Status |
|------|-----|--------|
| Login | / | ✅ Magic link auth working |
| Dashboard | /dashboard | ✅ Live stats from DB |
| Properties | /dashboard/companies | ✅ Smart search + filters |
| Property Detail | /dashboard/companies/[id] | ✅ Full detail + draft email + add deal |
| Contacts | /dashboard/contacts | ✅ Add/delete contacts |
| Pipeline | /dashboard/deals | ✅ Add/delete deals |
| AI Chat (Atlas) | /dashboard/insights | ✅ Claude-powered, reads DB |

---

## API Routes
| Route | Purpose |
|-------|---------|
| POST /api/chat | AI chat — streams Claude response with DB context |
| GET /api/companies | Filtered property search (search, market, class, year, units, for_sale) |
| GET /api/agents/briefing | Morning briefing agent — needs RESEND_API_KEY to send email |
| GET /api/test | Tests Anthropic API key connectivity |

---

## AI Features
- **Atlas AI Chat** (`/dashboard/insights`) — Ask anything about your pipeline, properties, contacts. Powered by `claude-opus-4-5`. Reads up to 500 properties + all contacts + deals.
- **Draft Email button** — On every property detail page. One click → Claude writes a personalized cold email for that property.
- **Morning Briefing Agent** — `/api/agents/briefing` — Pipeline digest + multifamily news + AI recommendation. Set up as Vercel cron (7am ET daily). **Needs RESEND_API_KEY to activate.**

---

## News Sources (Morning Briefing)
National multifamily RSS feeds in `/Users/anniebing/atlas/lib/news.ts`:
- Multi-Housing News, Multifamily Executive, GlobeSt, NMHC, NAA, Apartment Finance Today, Bisnow, Connect CRE, CoStar News, The Real Deal

---

## Annie's BD Target Personas
- **Operations:** VP Operations, Director Operations, COO
- **Construction:** VP Construction, Director Construction, Construction Manager
- **Facilities:** Facilities Manager, VP Facilities, Director Facilities
- **C-Suite:** CEO, CFO, President

---

## What's NOT Built Yet (Roadmap)
1. **Morning briefing emails** — code is done, just needs `RESEND_API_KEY` added to Vercel
2. **Activity logging** — log calls/emails/meetings against contacts (schema exists, no UI yet)
3. **Contact detail pages** — similar to property detail pages
4. **ZoomInfo auto-enrichment agent** — when company added, auto-find contacts
5. **Email sending from Atlas** — connect Gmail/Resend to send outreach directly
6. **More CoStar data** — Annie has more files to import (same script works)
7. **Deal scoring** — AI ranks best opportunities
8. **Outreach sequencing agent** — multi-touch follow-up automation

---

## How to Push Code to GitHub
```bash
cd /Users/anniebing/atlas
git add -A
git commit -m "your message"
git push https://Anniebing1:GITHUB_TOKEN@github.com/Anniebing1/Atlas.git main
```
Note: GitHub token (`ghp_...`) expires — create a new one at https://github.com/settings/tokens if needed.

## How to Run Locally
```bash
cd /Users/anniebing/atlas
npm run dev
# Opens at http://localhost:3000
```

## How to Import More CoStar Data
```bash
cd /Users/anniebing/atlas
# Add new .numbers files to /Users/anniebing/Desktop/CoStar/
# Edit scripts/import-costar-zoominfo.py to include new file paths
python3 scripts/import-costar-zoominfo.py
```

## How to Update Vercel Env Vars via API
```bash
# Get env var IDs
curl -s "https://api.vercel.com/v9/projects/atlas/env" \
  -H "Authorization: Bearer VERCEL_TOKEN"

# Update a var
curl -s -X PATCH "https://api.vercel.com/v9/projects/atlas/env/VAR_ID" \
  -H "Authorization: Bearer VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"new-value"}'
```

## How to Run SQL on Supabase via API
```bash
curl -s -X POST "https://api.supabase.com/v1/projects/snxjziwnzyhkpsdmmmjq/database/query" \
  -H "Authorization: Bearer SUPABASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) FROM companies;"}'
```

---

## Notes for Next Claude Session
- The GitHub token in this doc may be expired — generate a new one at https://github.com/settings/tokens if push fails
- Annie's email: annie.bing@fmmla.com
- Annie is switching her Anthropic account email — may be in a new Claude session
- The morning briefing preview (no email needed) works at: https://atlas-one-omega.vercel.app/api/agents/briefing?preview=true
- Next immediate task: get Resend API key and add to Vercel to activate morning briefing emails
