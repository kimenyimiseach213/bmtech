"use client";

import { LocaleLink as Link } from "@/components/locale-link";
import { useStore } from "@/app/providers";
import { ProductDetail } from "@/components/product-detail";
import { ArrowRight, LoaderCircle, PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { apiPaths, apiRequest, normalizeProduct } from "@/lib/api";

export function LiveProductDetail({ slug }: { slug: string }) {
  const { products, catalogLoading, catalogError } = useStore();
  const [remoteLoading, setRemoteLoading] = useState(true);
  const [remoteProduct, setRemoteProduct] = useState<Product | null>(null);
  useEffect(() => {
    let active = true;
    setRemoteProduct(null); setRemoteLoading(true);
    apiRequest<unknown>(apiPaths.product(slug)).then((response) => {
      const root = response && typeof response === "object" ? response as Record<string, unknown> : {};
      const payload = root.data && typeof root.data === "object" ? root.data : response;
      if (active) setRemoteProduct(normalizeProduct(payload));
    }).catch(() => undefined).finally(() => { if (active) setRemoteLoading(false); });
    return () => { active = false; };
  }, [slug]);
  const product = remoteProduct;
  if (product) return <ProductDetail product={product} related={products.filter((item) => item.slug !== slug && item.isUndersale === product.isUndersale).slice(0, 3)} />;
  if (catalogLoading || remoteLoading) return <main className="container page-content"><div className="admin-loading"><LoaderCircle className="admin-spin" size={20} />Loading product details…</div></main>;
  return <main className="container page-content"><div className="catalog-product-missing"><PackageSearch size={28} /><h1>Product not found</h1><p>{catalogError ? "The live product API is unavailable. Try again when the BMTECH catalogue service is online." : "This product is not currently published in the BMTECH catalogue."}</p><Link className="button button-primary" href="/products">Browse products<ArrowRight size={15} /></Link></div></main>;
}
