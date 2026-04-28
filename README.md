# Self Desk

`Self Desk` is a Next.js app with server-side API routes and Supabase integration.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy env template:

```bash
# bash
cp .env.example .env.local

# PowerShell
Copy-Item .env.example .env.local
```

3. Fill `.env.local` values:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_PASSWORD`
- `SESSION_SECRET`

4. Start dev server:

```bash
npm run dev
```

## Deploy to Vercel

This project is compatible with Vercel as a Node.js Next.js deployment (not static export).

### One-time setup

1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. In Vercel Project Settings -> Environment Variables, add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_PASSWORD`
   - `SESSION_SECRET`
4. Trigger a deployment.

### Build/runtime details

- Framework preset: `Next.js` (auto-detected by Vercel)
- Build command: `npm run build`
- Install command: `npm install`
- Output: managed automatically by Vercel
- Node version: from `package.json` engines (`>=20.9.0 <25`)

## Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it in client code.
- Use different secrets for Preview and Production environments.
