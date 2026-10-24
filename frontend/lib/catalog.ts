import type { Product, ProductCategory } from "@/types";
import { categories } from "@/lib/data";

export const isUndersale = (product: Product) => product.isUndersale === true;
export const isPowerEquipment = (product: Product) => !isUndersale(product)
  && ["generators", "changeover-switches"].includes(product.categorySlug || product.category.toLowerCase().replace(/\s+/g, "-"));

/** Retain BMTech's supplied photography if category records have no images. */
export function equipmentCategories(live: ProductCategory[]): ProductCategory[] {
  return categories.map(original => {
    const current = live.find(category => category.name.toLowerCase() === original.name.toLowerCase());
    return { ...original, ...(current || {}), images: current?.images.length ? current.images : original.images, image: current?.image || original.image, summary: original.summary };
  });
}

export type ShopFilters = { search: string; condition: string; brand: string; available: boolean; sort: string };
export function shopProducts(products: Product[], filters: ShopFilters): Product[] {
  const query = filters.search.trim().toLowerCase();
  return products.filter(isUndersale).filter(product =>
    (!query || [product.name.en, product.name.fr, product.shortDescription, product.brand, product.model, product.sku].some(value => value?.toLowerCase().includes(query)))
    && (filters.condition === "all" || product.condition === filters.condition)
    && (filters.brand === "all" || product.brand === filters.brand)
    && (!filters.available || (product.isAvailable !== false && product.stock > 0))
  ).sort((a, b) => filters.sort === "price-low" ? (a.price ?? Infinity) - (b.price ?? Infinity)
    : filters.sort === "price-high" ? (b.price ?? -1) - (a.price ?? -1)
    : filters.sort === "name" ? a.name.en.localeCompare(b.name.en) : 0);
}
