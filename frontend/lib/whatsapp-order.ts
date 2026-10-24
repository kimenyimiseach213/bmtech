import type { CartLine, Product } from "@/types";
import { apiRequest, normalizeProduct } from "@/lib/api";
import { formatRwf } from "@/lib/data";

export function ceoNumber(value: string) {
  if (!/^\+?[1-9][\d ()-]{6,24}$/.test(value.trim())) return "";
  const digits = value.replace(/\D/g, "");
  return /^[1-9]\d{6,14}$/.test(digits) ? digits : "";
}
export type ValidatedCart = { lines: Array<{ product: Product; quantity: number }>; changes: string[]; ceoWhatsapp: string };
export async function validateSelection(cart: CartLine[], products: Product[]): Promise<ValidatedCart> {
  const result = await apiRequest<{ lines: Array<{ product: unknown; quantity: number }>; changes: string[]; ceoWhatsapp: string }>("api/v1/cart/validate", { method: "POST", body: JSON.stringify({ items: cart.map(line => ({ productSlug: line.slug, quantity: line.quantity })) }) });
  const lines = result.lines.map(line => ({ ...line, product: normalizeProduct(line.product) }));
  const changes = [...result.changes];
  for (const line of lines) {
    const previous = cart.find(item => item.slug === line.product.slug)?.unitPrice ?? products.find(p => p.slug === line.product.slug)?.price;
    if (previous !== undefined && previous !== null && previous !== line.product.price) changes.push(`${line.product.name.en}: price changed from ${formatRwf(previous)} to ${formatRwf(line.product.price!)}.`);
  }
  return { lines, changes, ceoWhatsapp: result.ceoWhatsapp };
}
export function selectionMessage(lines: ValidatedCart["lines"], language: "en" | "fr", origin: string) {
  const totalCents = lines.reduce((sum, line) => sum + Math.round(line.product.price! * 100) * line.quantity, 0);
  return ["Hello BMTech Limited,\n\nI would like to order the following products:", ...lines.map(({ product, quantity }) => [
    `Product: ${product.name[language] || product.name.en}`,
    `Quantity: ${quantity}`,
    `Unit price: ${formatRwf(product.price!)}`,
    `Line total: ${formatRwf(Math.round(product.price! * 100) * quantity / 100)}`,
    `Product link: ${origin}/${language}/products/${encodeURIComponent(product.slug)}`,
  ].join("\n")), `Total: ${formatRwf(totalCents / 100)}`, "Please confirm availability and payment instructions. Thank you."].join("\n\n");
}
export function selectionUrl(selection: ValidatedCart, language: "en" | "fr", origin: string) {
  const phone = ceoNumber(selection.ceoWhatsapp);
  if (!phone || !selection.lines.length) return "";
  return `https://wa.me/${phone}?text=${encodeURIComponent(selectionMessage(selection.lines, language, origin))}`;
}
