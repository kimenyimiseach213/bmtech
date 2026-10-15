# BMTECH website

This folder contains the Next.js storefront, administrator dashboard, and its same-origin API proxy. The NestJS API is in the sibling `../backend` folder.

## Run locally

From this folder, install dependencies and start the website:

```powershell
npm ci
npm run dev
```

The website runs at `http://localhost:3002`. Set `BMTECH_API_BASE_URL=http://localhost:3001` in `.env.local`; copy `.env.example` to create it. Start the API separately from `../backend`, or run both apps with:

```powershell
npm run dev:all
```

The API uses `backend/.env` and listens on port 3001. Keep both terminal processes running while developing.

## Deploy

Follow [the Vercel deployment guide](docs/vercel-deployment.md) to deploy this folder and the sibling `backend` folder as separate Vercel projects.
