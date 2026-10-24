"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { useStore } from "@/app/providers";
import { ceoNumber, selectionUrl, validateSelection } from "@/lib/whatsapp-order";

export function OrderNow({ product, quantity = 1 }: { product: Product; quantity?: number }) {
  const { company, language } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState<{ url: string; text: string } | null>(null);
  const available = product.price !== null && product.stock > 0 && product.isAvailable !== false;
  useEffect(() => { setPrepared(null); setError(""); }, [product.slug, product.price, product.stock, quantity]);
  const configured = Boolean(ceoNumber(company.ceoWhatsapp));
  async function order() {
    setBusy(true); setError(""); setPrepared(null);
    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    try {
      const result = await validateSelection([{ slug: product.slug, quantity, unitPrice: product.price ?? undefined }], [product]);
      const url = selectionUrl(result, language, window.location.origin);
      if (!url) throw new Error(result.lines.length ? "WhatsApp ordering unavailable. BMTECH must configure the CEO WhatsApp Number in Admin Settings." : result.changes.join(" ") || "This product is unavailable.");
      if (result.changes.length) {
        popup?.close();
        setPrepared({ url: "", text: result.changes.join(" ") + " Refresh the product and review the changes before ordering." });
      } else if (popup) { popup.location.href = url; }
      else setPrepared({ url, text: "Availability and price checked. Open WhatsApp to continue." });
    } catch (reason) { popup?.close(); setError(reason instanceof Error ? reason.message : "Unable to validate this product."); }
    finally { setBusy(false); }
  }
  return <div className="order-now"><button className="button button-primary" disabled={!available || !configured || busy} onClick={() => void order()}>{busy ? "Checking..." : "Order Now"}</button>{!configured && <small>WhatsApp ordering unavailable. CEO contact is not configured.</small>}{error && <small role="alert">{error}</small>}{prepared && <small role="status">{prepared.text} {prepared.url && <a href={prepared.url} target="_blank" rel="noreferrer">Open WhatsApp</a>}</small>}</div>;
}
