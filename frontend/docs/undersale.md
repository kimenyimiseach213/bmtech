# BMTech Limited: Undersale delivery and operation

The enhancement is implemented in the existing Next.js frontend, NestJS API, Prisma/PostgreSQL database model, authenticated admin portal and guest cart. No second website, product database, customer account system or payment gateway was created.

## Homepage and shopping experience

The homepage keeps the hero and all existing service, business, gallery, review and FAQ sections. Its first product sections are now:

1. Explore Our Equipment Categories: Generators and Changeover Switches, with the supplied images and original category links.
2. Featured Power Equipment: the existing equipment-card actions and database-backed equipment listings.
3. Products Undersale: published products explicitly classified with `isUndersale`, with the requested subtitle and View All Undersale Products link.

The original generator and changeover galleries also need product records in the target database; deploying the frontend photo files alone does not create them. From `bmtech-backend`, run `node scripts/restore-equipment-catalog.cjs` to preview restoration and append `--apply` to restore missing entries. The script verifies all 18 original photos on the live frontend, creates the two enquiry-only equipment listings with their ordered galleries in one transaction, and leaves every existing product and category unchanged. Existing unpublished products are never republished by this command.

Undersale does not imply a discount. No crossed-out prices or fictional production inventory were added. Old source-only Inverter/demo catalog entries were removed from the public defaults; existing database records were not deleted. Undersale records remain in the existing product table and use its image relationships.

## Public routes

Routes use the existing `/en` and `/fr` locale handling:

| Route | Purpose |
|---|---|
| `/en` | Preserved business homepage plus Products Undersale |
| `/en/undersale` | Search, brand/condition/stock filters, sorting and all published sale products |
| `/en/electronics` | Compatible entry point to the same shopping component |
| `/en/products/:slug` | Existing product details route, real photo gallery and return link |
| `/en/cart` | Existing persistent guest cart and manual WhatsApp checkout |
| `/en/admin/undersale` | Authenticated Undersale management |
| `/en/admin/settings` | Company settings, including the CEO ordering recipient |

## Owner workflow

1. Sign into the existing administrator portal and open Undersale.
2. Click Add product; enter its name, short/full descriptions, fixed price in RWF, stock and condition. Brand, model and specifications are optional. French translations are optional in this view; the English name is reused if no French name is provided.
3. Select up to 12 JPEG, PNG, WebP or GIF images. Each browser upload is limited to 4 MB. Preview them, reorder with the arrows, or use the check button to select the main photo. Replace changes a photo in its current position. Photo removal is staged until Save and can be cancelled.
4. Check Published on storefront and click Publish product, or save a draft.
5. Photos are saved and ordered before publication is enabled. If an upload fails, the product stays unpublished and the editor reports the error.

The dashboard shows total, published, unpublished, available and out-of-stock counts. Availability counts products with stock above zero and the availability flag enabled, independently of publication. Out-of-stock counts zero-stock records.

Editing, stock updates, publication and deletion use the existing authenticated product API. Product deletion and audit logging remain transactional; category and order relationships retain the existing database constraints. Publication is refused if an Undersale product has no saved photo. Removing the final photo of a published Undersale product requires unpublishing first.

## Photos and the broken-image fix

Vercel Blob remains the preferred production storage service. Set `BLOB_READ_WRITE_TOKEN` on the backend. Uploads retain their genuine image URLs, MIME types, photo order and main-photo selection. New image rows and their audit entry commit together.

For durable-volume hosting instead of Blob, mount a persistent disk, set `UPLOAD_DIRECTORY`, `PUBLIC_API_ORIGIN`, and `PERSISTENT_UPLOADS=true`. Production uploads reject an unconfigured or ephemeral disk fallback. Existing files on a temporary host cannot be made persistent retrospectively.

Legacy `/uploads/...` image references, including old localhost or outdated API-host URLs, resolve through the frontend's public `GET /api/media/:file` route. It only retrieves safe raster-image filenames from the configured backend's `/uploads` path, validates the response MIME type and forwards no administrator credentials. This avoids mixed-content URLs and incorrect media hosts.

Static `/images` paths bypass locale redirects. Product cards and the main gallery use Next Image with responsive sizes, proportional fitting and optimized outputs for supported media hosts. Missing or failed photos produce an explicit unavailable message; another image is never substituted for an administrator's upload. Files already lost by a previous ephemeral deployment must be reuploaded from their originals.

## Separate contact destinations

- Existing business phone/email/general WhatsApp settings remain business inquiry contacts.
- **Admin > Settings > Edit settings > CEO WhatsApp Number** is the preferred product and cart ordering recipient. If it is blank or invalid, ordering uses the configured BMTECH business WhatsApp contact instead. Both numbers must be valid international phone numbers; developer contact details are never used.
- The footer displays **Website Designed & Developed by Kimenyi Miseach**, `kimenyimiseach9@gmail.com` (`mailto:`), `+250792031219` (`tel:`), and an explicitly labelled Developer Contact WhatsApp link. These values never feed order generation.

## Cart and ordering

The existing browser-local guest cart is reused. Repeated additions merge; quantities are stock-capped; customers can change quantities or remove lines. Cart images, unit prices, line totals, total count and grand total use current database product data. The header shows the item count. The cart survives refreshes without customer registration.

Before preparing a product or cart WhatsApp message, `POST /api/v1/cart/validate` queries current publication status, category visibility, price, availability and stock. Changes are explained and the customer must review the selection before proceeding. Prices are compared against the cart's saved price snapshot. Calculations use cents to avoid floating-point total errors.

The encoded WhatsApp message lists products, quantities, prices, line totals, total, product URLs and a request to confirm availability/payment instructions. Opening WhatsApp does not create a paid/confirmed order, reserve stock, or clear the cart. The existing other business request flows remain available.

Public catalog data refreshes after admin mutations, on browser focus, and every 30 seconds while visible. Direct product details require a successful public product API response, so unpublished products are not resurrected from a stale catalog snapshot.

## Database changes and migration

`bmtech-backend/prisma/migrations/20261021000000_undersale/migration.sql` is additive:

- Adds `REFURBISHED` to ProductCondition.
- Adds Product `isUndersale`, `shortDescription`, `specifications` and `isAvailable`.
- Adds CompanySettings `ceoWhatsapp`, initially blank.
- Keeps ProductImage, Category, Product, existing prices, stock, publication state, business contacts and order relations.

Apply it to the intended database **before** deploying the updated backend:

```powershell
cd bmtech-backend
npm run prisma:deploy
npm run build
```

Build/deploy the frontend through its existing Vercel process:

```powershell
cd frontend
npm run build
```

Required deployment environment:

| Service | Variables |
|---|---|
| Backend | Existing `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN` |
| Backend images | `BLOB_READ_WRITE_TOKEN`; or a mounted `UPLOAD_DIRECTORY`, `PUBLIC_API_ORIGIN` and `PERSISTENT_UPLOADS=true` |
| Upload limit | `MAX_UPLOAD_BYTES=4000000` recommended for production requests |
| Frontend | `BMTECH_API_BASE_URL` set to the backend origin without `/api/v1` |

Deploy this repository's frontend changes and the separate `bmtech-backend` checkout changes. Do not deploy only one side. The production database was not migrated and production services were not redeployed during this work.

## API routes

| Route | Access / behavior |
|---|---|
| `GET /api/v1/products` and `/products/:slug` | Public; published products in active categories only, even if `status=all` is supplied |
| `GET /api/v1/settings/public` | Public company settings, CEO ordering number, and business WhatsApp fallback |
| `POST /api/v1/cart/validate` | Public; current server-side cart validation and ordering contact selection, no order/payment mutation |
| `GET/POST /api/v1/admin/products` | Existing admin session guard; list/create |
| `PATCH/DELETE /api/v1/admin/products/:id` | Existing admin session guard; edit/delete |
| `POST /api/v1/admin/products/:id/images` | Guarded multi-photo upload |
| `PATCH /api/v1/admin/products/:id/images/reorder` | Guarded order and main-photo selection |
| `DELETE /api/v1/admin/products/:id/images/:imageId` | Guarded removal |
| `GET/PATCH /api/v1/admin/settings` | Guarded company and CEO configuration |
| `GET /api/media/:file` | New frontend public media proxy; safe raster filenames only |

## Files created

Frontend:

- `app/undersale/page.tsx`, `app/electronics/page.tsx`, `app/api/media/[file]/route.ts`
- `components/undersale-section.tsx`, `components/undersale-shop.tsx`, `components/product-photo.tsx`, `components/order-now.tsx`
- `lib/catalog.ts`, `lib/whatsapp-order.ts`
- `scripts/test-undersale.cjs`, `docs/undersale.md`

Backend:

- `prisma/migrations/20261021000000_undersale/migration.sql`
- `scripts/test-undersale.cjs`, `scripts/test-undersale-migration.cjs`
- `scripts/undersale-preview.cjs`, `scripts/verify-storefront.cjs` (isolated QA only)

## Files modified

Frontend:

- `app/page.tsx`, `app/globals.css`, `app/providers.tsx`, `app/products/page.tsx`, `app/cart/page.tsx`, `app/[locale]/admin/[section]/page.tsx`
- `components/admin-resource.tsx`, `components/admin-shell.tsx`, `components/layout.tsx`, `components/products.tsx`, `components/product-detail.tsx`, `components/live-product-detail.tsx`, `components/ui.tsx`
- `lib/api.ts`, `lib/data.ts`, `types/index.ts`, `middleware.ts`, `next.config.ts`, `package.json`
- `.gitignore` ignores the isolated preview build directory. Next regenerates `next-env.d.ts` and the preview include in `tsconfig.json`.

Backend:

- `prisma/schema.prisma`, `.env.example`, `package.json`
- `src/admin/admin.controller.ts`, `src/admin/admin.service.ts`
- `src/catalog/catalog.controller.ts`, `src/catalog/catalog.service.ts`
- `src/common/dto.ts`, `src/orders/orders.service.ts`

## Verification performed

- Backend `npm run build`: passed.
- Backend `node --test scripts/test-undersale.cjs scripts/test-admin-delete.cjs scripts/test-account-security.cjs`: 37 passed, 0 failed.
- Backend `node --test scripts/test-undersale-migration.cjs`: 1 passed. It creates historical records before the new migration and verifies their names, prices, stock, publication, photos and contacts afterward.
- Frontend `npm run typecheck`: passed.
- Frontend `npm run test:undersale`: 9 passed, 0 failed. Covers contacts, encoded messages, totals, price/stock changes, search/filters, category separation, legacy media references and the public image proxy.
- Frontend `npm run build`: passed; final verification results are also reported in the delivery message.
- `scripts/verify-storefront.cjs` against the isolated preview: passed authentication, product creation, multiple real JPEG uploads, selected main image, publication, homepage section order, contact links, public pages, exact image bytes through the frontend proxy, Next image optimization, price edits, stock limits, unpublishing and republishing.
- Chrome: verified 4 desktop card columns with matching card heights, 2 tablet columns, 1 narrow-mobile column, no horizontal overflow, real uploaded images in cards/admin/gallery, gallery selection, search and condition filter, owner draft creation, admin sign-in, inventory totals, main-photo change, stock update, cart merging/limits/removal/totals/refresh persistence, and correct developer `mailto:`/`tel:` links.
- Lint was attempted. The existing `next lint` script cannot complete: the direct command hits this workstation's native SWC binary issue, and the project's WASM wrapper reaches ESLint setup because no ESLint configuration/dependency is installed. No lint pass is claimed.

## Remaining verification limits

The browser automation extension blocks selecting local files until its Allow access to file URLs setting is enabled. Multiple real uploads, persisted bytes and rendering were tested through HTTP, and existing saved photos were managed in the browser; a file-picker-driven upload was not completed.

The deployed Render/Vercel environment, cloud Blob credentials, survival of files across an actual cloud redeployment and an actual CEO WhatsApp conversation were not exercised. The CEO number remains blank in production defaults; the synthetic QA recipient was cleared from the local preview after message tests. No message was sent and no payment was processed.

## Local review

The isolated preview uses no production records. With the preview services running, open `http://localhost:3022/en` or `/en/undersale`, and `/en/admin/undersale` for owner tools. It uses in-memory test records; restarting the fixture resets them.

Start it with a synthetic password:

```powershell
cd bmtech-backend
$env:BMTECH_ACCOUNT_PREVIEW_PASSWORD='Synthetic-preview!234'
node scripts/undersale-preview.cjs
```

In a second terminal:

```powershell
cd frontend
$env:BMTECH_API_BASE_URL='http://127.0.0.1:3013'
$env:BMTECH_NEXT_DIST_DIR='.next-undersale-preview'
node scripts/next-cli.cjs dev --port 3022
```

The fixture login is `preview@example.invalid` with the synthetic password above. Production uses the existing administrator account, not these test credentials.
