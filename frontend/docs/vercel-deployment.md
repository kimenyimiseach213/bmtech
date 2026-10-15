# Deploy BMTECH as two Vercel projects

The repository contains two apps. Create two Vercel projects from the same Git repository and set each project's **Root Directory** separately:

| Vercel project | Root Directory | Framework |
| --- | --- | --- |
| BMTECH website | `frontend` | Next.js |
| BMTECH API | `backend` | NestJS |

Set both projects to use Node.js 22.x in Vercel's project settings.

Vercel detects the Next.js and NestJS apps from their package files and source entrypoints. Deploy the API first so you can use its deployment domain in the website settings. Use the backend domain without `/api/v1` for `BMTECH_API_BASE_URL` and `PUBLIC_API_ORIGIN`.

## Website environment

Set this server-only environment variable on the website project for Production, Preview, and Development as needed:

```dotenv
BMTECH_API_BASE_URL=https://your-api-project.vercel.app
```

Do not include `/api/v1` in this value. The website's same-origin proxy adds the API paths and keeps administrator session tokens in secure, HTTP-only cookies.

## API environment

Set these variables on the API project:

```dotenv
DATABASE_URL=<pooled PostgreSQL connection string>
DIRECT_URL=<direct PostgreSQL connection string for the same database>
JWT_SECRET=<unique random secret of at least 32 characters>
PUBLIC_API_ORIGIN=https://your-api-project.vercel.app
FRONTEND_ORIGIN=https://your-website-project.vercel.app
BLOB_READ_WRITE_TOKEN=<Vercel Blob read/write token>
MAX_UPLOAD_BYTES=4000000
```

Create a Vercel Blob store and assign its read/write token to `BLOB_READ_WRITE_TOKEN`. Product photos are stored as public blobs so they persist across function invocations. The admin uploader sends one photo per request; keep `MAX_UPLOAD_BYTES` at or below 4,000,000 bytes to stay under Vercel's 4.5 MB function request limit.

Optional API variables:

- `JWT_EXPIRES_IN` (defaults to `12h`)
- `ADMIN_BOOTSTRAP_TOKEN` (use a strong one-time token only while creating the first admin; remove it afterward)
- `BMTECH_NOTIFICATION_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` (configure these to email enquiries)

Vercel sets `PORT`, `NODE_ENV`, and `VERCEL`. `UPLOAD_DIRECTORY` is for local development; product uploads use Blob on Vercel. Never add secrets to the website project or commit `.env` files.

## Database setup

Before first production use, apply the checked-in Prisma migrations to the production database once. From `backend`, use an environment that has the production `DATABASE_URL` and `DIRECT_URL` configured:

```powershell
npm ci
npm run prisma:deploy
```

Do not run migrations as part of every Vercel build. The backend build compiles NestJS; `npm run prisma:generate` generates its Prisma client.

After deploying both projects, visit `https://your-api-project.vercel.app/docs` to confirm the API docs load, then use `/en/admin/login` on the website. Create the first administrator with the configured one-time bootstrap token, remove `ADMIN_BOOTSTRAP_TOKEN` from the API project's environment, and redeploy.

## Local environment files

- Copy `frontend/.env.example` to `frontend/.env.local`; set `BMTECH_API_BASE_URL=http://localhost:3001`.
- Copy `backend/.env.example` to `backend/.env`; fill in your database and private secrets.
- Keep both private files out of Git. The example files are intentionally allowed by `.gitignore`.
