"use client";
import { useState } from "react";
import { LocaleLink as Link } from "@/components/locale-link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/app/providers";
import { formatRwf } from "@/lib/data";
import { Breadcrumbs, PriceDisplay } from "@/components/ui";
import { ceoNumber, selectionUrl, validateSelection } from "@/lib/whatsapp-order";
export default function CartPage() {
  const { cart, setQuantity, remove, language, products, company, catalogLoading, catalogError, replaceCart } = useStore();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const lines = cart.map(line => ({ ...line, product: products.find(p => p.slug === line.slug) }));
  const total = lines.reduce((sum, line) => sum + Math.round((line.product?.price ?? 0) * 100) * line.quantity, 0) / 100;
  async function order() {
    setBusy(true); setNotice(""); setFallbackUrl("");
    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    try {
      const result = await validateSelection(cart, products);
      replaceCart(result.lines.map(line => ({ slug: line.product.slug, quantity: line.quantity, unitPrice: line.product.price! })), result.lines.map(line => line.product));
      if (result.changes.length) {
        popup?.close(); setNotice(result.changes.join(" ") + " Review your updated cart, then click Order via WhatsApp again."); return;
      }
      const url = selectionUrl(result, language, window.location.origin, company.whatsapp);
      if (!url) throw new Error(result.lines.length ? "WhatsApp ordering unavailable. BMTECH must configure a valid WhatsApp contact in Admin Settings." : "No available products remain in the cart.");
      if (popup) popup.location.href = url; else setFallbackUrl(url);
      setNotice("WhatsApp order message prepared. Your cart is saved. Availability and payment must be confirmed by BMTECH.");
    } catch (reason) { popup?.close(); setNotice(reason instanceof Error ? reason.message : "Unable to check your cart. Please try again."); }
    finally { setBusy(false); }
  }
  const whatsappConfigured = Boolean(ceoNumber(company.ceoWhatsapp) || ceoNumber(company.whatsapp));
  return <main className="container page-content"><Breadcrumbs items={[{ label: "Cart" }]}/><div className="section-heading"><h1>Your cart</h1><p>Your selection is saved in this browser. Prices and stock are checked before WhatsApp ordering.</p><Link href="/undersale" className="text-link">Continue shopping</Link></div>{notice && <div className="catalog-api-notice" role="status">{notice}</div>}{catalogLoading ? <p role="status">Loading current products...</p> : <>{catalogError && <p role="alert">Current catalog could not be loaded. Order validation will retry the server.</p>}{cart.length === 0 ? <div className="admin-empty"><h2>Your cart is empty</h2><Link href="/undersale" className="button button-primary">Explore Electronics</Link></div> : <div className="cart-layout"><section className="cart-table">{lines.map(({ slug, quantity, product }) => <div className="cart-row" key={slug}><div className="cart-product">{product?.image && <img src={product.image} alt=""/>}<div><h3>{product ? product.name[language] || product.name.en : slug}</h3><small>{!product || product.isAvailable === false || product.stock < 1 ? "Unavailable - remove this item or validate the cart" : `${product.stock} in stock`}</small></div></div><span className="cart-unit-price"><PriceDisplay amount={product?.price ?? null} small/></span><div className="quantity-control"><button disabled={busy} onClick={() => { setFallbackUrl(""); setQuantity(slug, quantity - 1); }} aria-label={`Decrease quantity for ${slug}`}><Minus size={12}/></button><span>{quantity}</span><button disabled={busy || !product || product.isAvailable === false || quantity >= product.stock} onClick={() => { setFallbackUrl(""); setQuantity(slug, quantity + 1); }} aria-label={`Increase quantity for ${slug}`}><Plus size={12}/></button></div><div className="cart-line-total">{product?.price !== null && product ? formatRwf(Math.round(product.price * 100) * quantity / 100) : "Unavailable"}<button disabled={busy} className="remove-button" onClick={() => { setFallbackUrl(""); remove(slug); }} aria-label={`Remove ${slug}`}><Trash2 size={14}/></button></div></div>)}</section><aside className="cart-summary"><h2>Order summary</h2><div className="summary-line"><span>Items ({cart.reduce((sum, line) => sum + line.quantity, 0)})</span><strong>{formatRwf(total)}</strong></div><div className="summary-line summary-total"><span>Total</span><strong>{formatRwf(total)}</strong></div><button className="button button-primary button-block" disabled={busy || !whatsappConfigured} onClick={() => void order()}>{busy ? "Checking prices and stock..." : "Order via WhatsApp"}</button>{!whatsappConfigured && <p role="status">WhatsApp ordering unavailable. Configure a BMTECH WhatsApp contact in Admin Settings.</p>}{fallbackUrl && <a className="button button-outline button-block" href={fallbackUrl} target="_blank" rel="noreferrer">Open WhatsApp</a>}<p className="field-hint">Delivery, availability and payment instructions must be confirmed by BMTECH. Opening WhatsApp does not confirm or pay for an order.</p></aside></div>}</>}</main>;
}
