# BMTECH deployment: Vercel, Render, and Neon

The frontend does not connect directly to Neon. The Next.js app on Vercel sends same-origin `/api/backend/*` requests through its server-side proxy to the NestJS API on Render. The Render API connects to Neon using Prisma. Keep both Neon connection strings and all database credentials on Render only.

## Vercel frontend environment

In the Vercel project for the `frontend` root directory, set these variables for Production (and Preview if previews should use the same backend):

```dotenv
BMTECH_API_BASE_URL=https://bmtech-server-wdcm.onrender.com
NEXT_PUBLIC_BMTECH_API_ORIGIN=https://bmtech-server-wdcm.onrender.com
```

Do not add `/api/v1` to either origin. Redeploy the frontend after changing environment variables. `BMTECH_API_BASE_URL` is server-side and keeps administrator bearer tokens behind the same-origin proxy. `NEXT_PUBLIC_BMTECH_API_ORIGIN` is only used to resolve legacy `/uploads/...` image URLs; it is not a database credential.

## Render API environment

In the Render service for `bmtech-backend`, set:

```dotenv
DATABASE_URL=<Neon pooled connection string>
DIRECT_URL=<Neon direct connection string for the same database and branch>
PUBLIC_API_ORIGIN=https://bmtech-server-wdcm.onrender.com
FRONTEND_ORIGIN=https://<your-vercel-frontend-domain>
JWT_SECRET=<unique random secret of at least 32 characters>
BLOB_READ_WRITE_TOKEN=<persistent public blob storage token>
MAX_UPLOAD_BYTES=4000000
```

Copy both connection strings from Neon. Use the pooled endpoint for `DATABASE_URL`, and the direct endpoint for `DIRECT_URL`; retain Neon’s `sslmode=require` parameter. Never put either value in Vercel frontend variables or commit them to source control.

## Apply the Neon schema

From `bmtech-backend`, with the production Neon URLs available in the environment, run once:

```powershell
npm ci
npm run prisma:deploy
```

The checked-in migration creates the BMTECH tables. Run migrations before using the storefront or administrator dashboard against a new Neon database. Do not run migrations on every deployment.

## Verify the connection

After setting the Render variables and deploying the API, check:

- `https://bmtech-server-wdcm.onrender.com/docs` loads the Nest API docs.
- `https://bmtech-server-wdcm.onrender.com/api/v1/products?status=published` returns JSON (an empty array is valid for a new database).
- The Vercel storefront loads, and `/en/admin/login` can authenticate an already-created admin.

Render’s `PUBLIC_API_ORIGIN` must be the public service origin, never localhost. A production Render filesystem may be ephemeral, so configure persistent image storage; otherwise uploaded photos can disappear after restarts.

## Local development

- `frontend/.env.local`: set `BMTECH_API_BASE_URL=http://localhost:3001` and `NEXT_PUBLIC_BMTECH_API_ORIGIN=http://localhost:3001`.
- `bmtech-backend/.env`: set Neon pooled/direct URLs or local PostgreSQL values, plus API secrets.
- Keep all `.env` files private and out of Git.
