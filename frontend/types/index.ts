export type Language = "en" | "fr";
export type Condition = "New" | "Used" | "Refurbished";
export type ProductImage = { src: string; alt: string };
export type ProductCategory = { name: string; nameFr: string; image: string; images: ProductImage[]; summary: string; active?: boolean; sortOrder?: number };
export type Product = {
  slug: string;
  name: Record<Language, string>;
  category: string;
  categoryFr: string;
  categorySlug?: string;
  isUndersale?: boolean;
  shortDescription?: string;
  isAvailable?: boolean;
  brand?: string;
  sku?: string;
  model?: string;
  condition?: Condition;
  price: number | null;
  stock: number;
  availability: string;
  image: string;
  images?: ProductImage[];
  description: Record<Language, string>;
  specs: Array<{ label: string; value: string }>;
  installation: boolean;
  demo: boolean;
};

export type CartLine = { slug: string; quantity: number; unitPrice?: number };

export type DemoRequest = {
  kind: "quote" | "booking" | "contact" | "review";
  ref: string;
  createdAt: string;
  fields: Record<string, string>;
  status: string;
};
