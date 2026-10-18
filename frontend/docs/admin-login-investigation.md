# Admin login investigation — 17 October 2026

## Production update after approval

The user approved correcting the Vercel API setting and deploying the frontend
fixes. `BMTECH_API_BASE_URL` was saved as
`https://bmtech-server-wdcm.onrender.com`, preserving its existing Production and
Preview scope. Only the login page, API helper, proxy handler, and regression
checks were published from an isolated `.login-deploy` checkout; unrelated
workspace changes were excluded.

- Published commit: `09bbb8443a01b4d346749b1d5c3c88cd9967ee6f`.
- Vercel deployment: `dpl_CCfGJaPtMGv3hLqJoLHh5ufxhpos`, Ready, Production.
- Production domain: `https://bmtech-iota.vercel.app`.
- Deployment URL: `https://bmtech-h9p0tpvft-kimenyi.vercel.app`.
- Fresh checks: production products proxy **200**, production invalid login
  **401**, unauthenticated dashboard **307** to login.
- The isolated frontend production build and all 10 regression checks passed
  before publication.

The production upstream connection failure is resolved. The previous saved
origin was write-only, so its exact incorrect value or stale deployment value
cannot be recovered. No existing account/password was changed, no production
records were modified, and Render was not redeployed. Successful sign-in with the
owner's existing credentials still requires the owner to enter them; an invalid
login check is not proof of successful authentication.

The remaining sections preserve the original, pre-deployment investigation.

## Confirmed failure and evidence

Production is not fixed or redeployed. No credentials, accounts, database records,
images, hosting settings, or deployment settings were changed. Existing workspace
edits were retained. Public requests and deliberately invalid logins were used;
no successful login against production was attempted because it creates a session.

| Check | Observed result |
| --- | --- |
| Vercel `/en/admin/login` | 200; existing page available |
| Render `/docs` | 200 |
| Render `/api/v1/products?status=published` | 200, JSON array |
| Render `POST /api/v1/admin/auth/login`, nonexistent test email | 401, `Email or password is incorrect.` |
| Vercel `/api/backend/api/v1/products?status=published` | 502, `The BMTECH API is unavailable.` |
| Vercel `POST /api/backend/api/v1/admin/auth/login`, same invalid request | Same 502 |
| Vercel `/en/admin/dashboard`, no cookies | 307 to login |
| Local production build proxy → actual Render, products | 200 |
| Local production build proxy → actual Render, invalid login | 401, no active session cookie |
| Local admin API without session | 401 |
| Local dashboard without session | 307 to login |
| Local backend Prisma → configured Neon database | Read-only `SELECT 1` passed |

The confirmed failure is the **deployed Vercel proxy's upstream connection**,
affecting public and admin requests. Render and its authentication endpoint work
when called directly. This is not a reproduced 404/405, database error, or failed
password check. Backend/database outages are not supported by the current tests.

The source returns the observed 502 specifically when its upstream `fetch` throws.
Vercel request logs confirm the login invocation returned 502, ran for 65 ms, and
showed no outgoing requests. This is consistent with a wrong/unreachable upstream
origin, but does not disclose which origin or transport error caused the failure.
The deployed catch block discarded that information.

Vercel's production domain points to deployment
`dpl_6fLY77J5vBjCKSgqZuUwz5mN9gsw`
(`bmtech-4zpsdcmcx-kimenyi.vercel.app`), built on 15 October 2026 at
10:33 GMT+2 from `1fa81a5`. The variable history shows a later edit to
`BMTECH_API_BASE_URL` in Production and Preview. Promoting an existing deployment
does not rebuild its configuration. Stale deployment configuration is therefore a
strong candidate. **The exact saved origin cannot be confirmed:** Vercel stores
this variable as a write-only Secret. No environment values were replaced.

The reported browser message `The BMTECH API could not be reached...` is only
thrown by the old client when browser `fetch` rejects. The reproduced HTTP 502 is
a separate failure mode; it should not be described as invalid credentials or a
confirmed browser CORS error.

## Request path and authentication

- Page: `app/[locale]/admin/login/page.tsx`.
- Request helper: `lib/api.ts`, `apiRequest(apiPaths.login, ...)`.
- Browser request: `POST /api/backend/api/v1/admin/auth/login`.
- Proxy: `app/api/backend/[...path]/route.ts`.
- Actual Render service, identified in local configuration and confirmed in its
  dashboard: `https://bmtech-server-wdcm.onrender.com`.
- Upstream request: `POST https://bmtech-server-wdcm.onrender.com/api/v1/admin/auth/login`.
- Nest global prefix: `api/v1`; `AuthController` prefix: `admin/auth`;
  `@Post('login')`; AuthModule is imported by AppModule.

`next.config.ts` has no API rewrites. The dynamic Node route handler is the proxy;
adding another rewrite is unnecessary. Middleware excludes `/api/` paths.
`NEXT_PUBLIC_BMTECH_API_ORIGIN` resolves legacy image URLs only, not login calls.

The browser calls its own origin, and Vercel calls Render server to server.
Browser CORS therefore does not apply to this upstream hop. Nest allows only
the comma-separated `FRONTEND_ORIGIN` origins with credentials enabled; this
restriction was preserved. Production Render origin values were not revealed.

Nest checks the existing administrator with Prisma and bcrypt, signs a JWT, and
stores its session in `AdminSession`. The Next proxy stores the token in an
HttpOnly, SameSite=Lax cookie (Secure in production), removes bearer tokens from
the browser response, and forwards Authorization server-side. The marker cookie
controls dashboard navigation; backend AuthGuard independently verifies the JWT
and its unexpired, unrevoked database session. JWT_SECRET requires at least 32
characters. No authentication, password hashing, or session checks were weakened.

Nest listens on `0.0.0.0` using `process.env.PORT || 3001`. Render's dashboard
shows service `bmtech-server` live on its Free instance, commit `667fcdf` in the
separate `bmtech-server` repository. Recent runtime logs show successful Nest
startup and route registration, without a database failure in the inspected
startup entries. The localhost text in the startup log is a display string;
the listener actually binds all interfaces. Render warns that sleeping instances
may take 50 seconds or more to wake. A warm backend was used to confirm the
persistent Vercel failure. No dedicated health route exists in the local source;
`/docs` checks routing and `/api/v1/products` also exercises database reads.

Prisma uses PostgreSQL, DATABASE_URL for runtime, and DIRECT_URL for migrations.
Local configured URLs use Neon pooled/direct endpoints for the same endpoint
family with `sslmode=require`. Neon uses the PrismaNeon WebSocket adapter. Only
`SELECT 1` was executed directly; no migrations, seeding, bootstrap, reset,
password updates, or data changes were run. Render's successful products query
and invalid-user lookup also demonstrate that its deployed database reads work.

## Local fixes

- Login now maps 401/403 to `Incorrect email or password.`, transport failures to
  `Unable to connect to the server.`, 502/503/504 to
  `The server is temporarily unavailable. Please try again.`, and other failures
  to `An unexpected server error occurred.` Raw server errors are not displayed
  on the login page.
- Client handles interrupted response bodies as connection failures.
- Proxy trims and validates an origin-only API base, rejecting credentials,
  paths such as `/api/v1`, query strings, and fragments instead of constructing
  duplicated or unintended routes.
- Proxy logs only the upstream hostname and a restricted transport error code;
  no raw errors, credentials, request bodies, cookies, tokens, or full URLs.
- Successful login must include the JWT expected by this Nest backend. An empty
  or HTML 2xx response cannot establish an administrator session.

No backend code change is justified by the observed results. Product/category
data and image normalization were not changed by this fix. Offline checks verify
that existing product/image payloads pass through unchanged. Vercel logs also
show successful static product-image responses. Every stored image URL and
every admin operation has not been exhaustively tested.

## Dashboard correction, pending approval

1. Open Vercel project **bmtech → Environment Variables**:
   <https://vercel.com/kimenyi/bmtech/settings/environment-variables>.
2. Re-enter `BMTECH_API_BASE_URL` for **Production** as exactly
   `https://bmtech-server-wdcm.onrender.com`, without `/api/v1`, quotes, or
   whitespace. Because the saved value is write-only, this ensures the value
   rather than assuming it is correct. Do not copy Neon or JWT credentials here.
3. The project currently lists only that API variable. For legacy `/uploads/`
   image URLs, configure `NEXT_PUBLIC_BMTECH_API_ORIGIN` to the same origin when
   needed; it does not repair the login connection itself.
4. After approval, create a **new production deployment** using the updated
   settings and reviewed frontend changes. Promoting the old build alone is
   insufficient. Confirm Root Directory is `frontend`; do not deploy or alter
   the separate Render backend as part of this frontend correction.
5. Verify public products through Vercel return 200 and invalid login returns
   401. If 502 remains, inspect the new proxy diagnostic in Vercel runtime logs
   to distinguish DNS (`ENOTFOUND`), refused connection (`ECONNREFUSED`), timeout,
   or another transport failure. Do not reset a password to fix these errors.
6. The owner should then sign in with the existing account and verify dashboard
   access and logout. Successful production login remains unverified.

If Render later fails: check service **bmtech-server → Logs**, successful Nest
startup/route mapping, assigned PORT, and Environment presence of DATABASE_URL,
DIRECT_URL, JWT_SECRET, PUBLIC_API_ORIGIN, and FRONTEND_ORIGIN. Preserve all
existing secrets. Inspect Prisma errors and Neon branch/compute status privately;
do not migrate or replace databases as a connection troubleshooting step.

## Validation

- Frontend `npm run typecheck`: passed.
- Frontend `npm run build`: passed, including login and proxy route generation.
- `node --test scripts/test-api.cjs`: 10 checks passed, including mocked successful
  login, token secrecy, secure cookies, invalid credentials, upstream failures,
  invalid configuration, unchanged product/image payloads, and dashboard guards.
- Backend `npm run build`: passed, including Prisma client generation.
- Local built Next server on port 3010 → real Render: products 200, invalid login
  401, protected API 401, protected page 307.
- Browser check of the existing login page against that local production build:
  submitting invalid credentials displayed `Incorrect email or password.` and
  remained on the login page.
- Existing local backend → Neon read-only `SELECT 1`: passed.
- No push or deployment was performed. A mocked successful login is not proof
  that the existing production account can log in.
