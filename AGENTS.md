# AGENTS.md

This repo is a hybrid Next.js (Node.js) + Python monorepo with a secure admin dashboard. The information below prevents common automation mistakes and reduces project onboarding friction.

## Structure (Critical)
- **Main app:** Next.js in `/src/pages` with API at `/src/pages/api/health.js`. Uses React 19, Next.js 15+.
- **Crawler:** Python scripts in `/crawler`. Not integrated with Node.js app.
- **Admin Dashboard:** All admin/staff pages at `/js/auth/*`, protected by NextAuth authentication.
- **No About.md:** For crawler, see `/crawler/About.mc` for authoritative info.

## Setup & Environment (Node.js)
- **Requires Node.js >=18.**
- Install JS deps: `npm install`
- Admin setup (one-time): `npm run setup:admin` (prompts for username/password, generates bcrypt hash to .env)
- Dev: `npm run dev`
- Build: `npm run build` → standalone Next.js output
- No formal test suite or test command present.
- **Strict style/type:**
  - ESLint (see eslint.config.js): single quotes, semicolons, prefer-const, no-var, no unused vars, etc.
  - TypeScript enforced; run: `npm run typecheck`
- **Custom live linting:**
  - `scripts/watch-lint.js` auto-lints/types on any source change
  - Auto-fixes errors (`eslint --fix`)
  - **Not auto-run:** You must launch manually: `node scripts/watch-lint.js`

## Admin Dashboard (`/js/auth/*`)
- All pages require login (NextAuth credentials provider with bcrypt password)
- Login page: `/js/auth/login` (username: whitekali)
- Protected pages (server-side session check):
  - `/js/auth/dashboard` — overview stats, recent activity
  - `/js/auth/crawler` — crawler control panel, settings, status, output
  - `/js/auth/results` — results table (title, link, city, code, date, salary, meters, source)
  - `/js/auth/todo` — crawler task management (CRUD, priorities, filter)
  - `/js/auth/logs` — system/crawler diagnostic logs
  - `/js/auth/keywords` — keyword management with hit stats
  - `/js/auth/reports` — hit reports, weekly chart, source performance
- Auth uses bcrypt password hash (stored in .env), httpOnly JWT sessions, 24h expiry
- Layout: fixed sidebar with admin red/dark theme

## Setup & Environment (Python/crawler)
- **Python >=3.8 recommended.**
- Install Python deps:
  ```
  pip install requests beautifulsoup4 pandas openpyxl lxml python-dotenv
  ```
- Provide `.env` in `/crawler`, must set: `DISCORD_WEBHOOK=<your webhook url>`
- Crawler only saves new results based on `seen_links.json` (auto-created on first run)
- Outputs Excel file for new results, and posts to Discord webhook

## Pitfalls / Gotchas (for Automations/Agents)
- **Crawler must be run manually** and is fully separate from the JS ecosystem. It can't be run via npm/yarn/pnpm scripts.
- `.env` and Python packages are required for any Discord/notification features—missing either = silent/skipped notifications.
- **No test suite in Node project**—do not expect test runners or CI-ready commands by default.
- **Custom linting stricter than out-of-box Next.js:** indirect requirement, auto-fix can rewrite files/styles.
- New/changed source files not actively watched by default unless running the custom watcher.
- Key state for crawler persists in local files: `seen_links.json` (visited URLs) and Excel output.
- Crawler behavior (timeouts, API use, Discord, Excel saving) described in `/crawler/About.mc` only.
- Admin auth depends on `.env` with `ADMIN_HASH` (bcrypt) and `NEXTAUTH_SECRET` — run `npm run setup:admin` to configure.

## Common Scripts
- Dev: `npm run dev`
- Build: `npm run build`
- Admin setup: `npm run setup:admin`
- Lint: `npm run lint` (manual fix) or `scripts/watch-lint.js` (auto-fix + typecheck)
- Typecheck: `npm run typecheck`
- Python crawler: see `/crawler/About.mc`

## Agent Recommendations
- Cross-check install/env steps for both JS and Python parts before running automation.
- Always run the custom `watch-lint.js` for stricter lint/type safety during dev, if possible.
- For crawler, set up `.env` and needed Python deps before running.
- Reference `/crawler/About.mc` for latest crawler usage and caveats.
- State (like seen URLs and output Excel) is saved in repo/crawler dir and is required for expected operation.
- Admin pages use NextAuth — default user is `whitekali`. Run `npm run setup:admin` to set password hash.
