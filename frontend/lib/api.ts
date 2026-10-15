import type { Product, ProductCategory, ProductImage } from "@/types";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cleanPath = path.replace(/^\/+/, "");
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  let response: Response;
  try {
    response = await fetch(`/api/backend/${cleanPath}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiError("The BMTECH API could not be reached. Check the API URL and network connection.", 0);
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try { data = JSON.parse(text) as unknown; }
    catch { data = text; }
  }
  if (!response.ok) {
    const body = data && typeof data === "object" ? data as Record<string, unknown> : null;
    const message = typeof body?.message === "string"
      ? body.message
      : typeof body?.error === "string"
        ? body.error
        : `Request failed (${response.status}).`;
    throw new ApiError(message, response.status, data);
  }
  return data as T;
}

export const apiPaths = {
  publicProducts: "api/v1/products?status=published",
  publicCategories: "api/v1/categories?status=active",
  product: (slug: string) => `api/v1/products/${encodeURIComponent(slug)}`,
  login: "api/v1/admin/auth/login",
  logout: "api/v1/admin/auth/logout",
  admin: (resource: string) => `api/v1/admin/${resource}`,
  dashboard: "api/v1/admin/dashboard/summary",
  publicSettings: "api/v1/settings/public",
  orderCreate: "api/v1/orders",
  quoteCreate: "api/v1/quotation-requests",
  bookingCreate: "api/v1/technician-bookings",
  contactCreate: "api/v1/contact-messages",
  reviewCreate: "api/v1/reviews",
} as const;

type UnknownRecord = Record<string, unknown>;
const asRecord = (value: unknown): UnknownRecord => value && typeof value === "object" ? value as UnknownRecord : {};
const textValue = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const numberValue = (value: unknown, fallback = 0) => typeof value === "number" ? value : Number.isFinite(Number(value)) ? Number(value) : fallback;
const localImages = (value: unknown): ProductImage[] => Array.isArray(value) ? value.map((entry, index) => {
  const image = asRecord(entry);
  const src = textValue(image.url, textValue(image.src, textValue(image.path)));
  return src ? { src, alt: textValue(image.alt, `Product photo ${index + 1}`) } : null;
}).filter((image): image is ProductImage => image !== null) : [];

/** Accepts the common Nest response envelopes while keeping UI fields normalized. */
export function unwrapList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  for (const key of ["data", "items", "results", "products", "categories"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
    const nested = asRecord(record[key]);
    if (Array.isArray(nested.items)) return nested.items as unknown[];
  }
  return [];
}

export function normalizeProduct(payload: unknown): Product {
  const item = asRecord(payload);
  const nameRecord = asRecord(item.name);
  const names = asRecord(item.names);
  const descRecord = asRecord(item.description);
  const descriptions = asRecord(item.descriptions);
  const categoryRecord = asRecord(item.category);
  const imageRows = localImages(item.images);
  const primaryImage = textValue(item.coverImageUrl, textValue(item.imageUrl, textValue(item.image, imageRows[0]?.src ?? "")));
  const slug = textValue(item.slug, textValue(item.id, "product"));
  const fallbackName = textValue(item.name, slug);
  const nameEn = textValue(nameRecord.en, textValue(names.en, textValue(item.nameEn, fallbackName)));
  const nameFr = textValue(nameRecord.fr, textValue(names.fr, textValue(item.nameFr, textValue(item.nameEn, fallbackName))));
  const priceMode = textValue(item.priceMode, textValue(item.priceType, ""));
  const price = item.price === null || item.price === undefined || priceMode.toLowerCase().includes("quote") || item.requiresQuote === true
    ? null
    : numberValue(item.price, 0);
  const specsRaw = Array.isArray(item.specifications) ? item.specifications : Array.isArray(item.specs) ? item.specs : [];
  return {
    slug,
    name: {
      en: nameEn,
      fr: nameFr,
    },
    category: textValue(categoryRecord.name, textValue(item.categoryName, textValue(item.category, "Products"))),
    categoryFr: textValue(categoryRecord.nameFr, textValue(item.categoryNameFr, textValue(item.categoryName, "Produits"))),
    sku: textValue(item.sku) || undefined,
    model: textValue(item.model) || undefined,
    condition: ["new", "used"].includes(textValue(item.condition).toLowerCase()) ? (textValue(item.condition).toLowerCase() === "new" ? "New" : "Used") : undefined,
    price,
    stock: numberValue(item.stockQuantity, numberValue(item.stock, 0)),
    availability: textValue(item.availability, numberValue(item.stockQuantity, numberValue(item.stock)) > 0 ? "Available" : "Ask BMTECH to confirm availability"),
    image: primaryImage,
    images: imageRows,
    description: {
      en: textValue(descRecord.en, textValue(descriptions.en, textValue(item.descriptionEn, textValue(item.description, "")))),
      fr: textValue(descRecord.fr, textValue(descriptions.fr, textValue(item.descriptionFr, textValue(item.description, "")))),
    },
    specs: specsRaw.map((entry) => {
      const spec = asRecord(entry);
      return { label: textValue(spec.label, textValue(spec.name, "Details")), value: textValue(spec.value, "") };
    }),
    installation: item.installationAvailable === true || item.installation === true,
    demo: false,
  };
}

export function normalizeCategory(payload: unknown): ProductCategory {
  const item = asRecord(payload);
  const names = asRecord(item.name);
  const images = localImages(item.images);
  const image = textValue(item.imageUrl, textValue(item.image, images[0]?.src ?? ""));
  return {
    name: textValue(names.en, textValue(item.nameEn, textValue(item.name, "Category"))),
    nameFr: textValue(names.fr, textValue(item.nameFr, textValue(item.nameEn, textValue(item.name, "Catégorie")))),
    image,
    images: images.length ? images : image ? [{ src: image, alt: textValue(item.nameEn, "Product category") }] : [],
    summary: textValue(item.summary, textValue(item.descriptionEn, "Explore products in this category.")),
    active: item.isActive === true || item.active === true,
    sortOrder: numberValue(item.sortOrder, 0),
  };
}
