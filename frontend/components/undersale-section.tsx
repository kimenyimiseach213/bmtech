"use client";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useStore } from "@/app/providers";
import { LocaleLink as Link } from "@/components/locale-link";
import { ProductGrid } from "@/components/products";
import { isUndersale } from "@/lib/catalog";

export function UndersaleSection() {
  const { products, catalogLoading, catalogError, refreshCatalog } = useStore();
  const items = products.filter(isUndersale).slice(0, 4);
  return <section className="section undersale-section" aria-labelledby="undersale-heading"><div className="container">
    <div className="shop-section-heading"><div><span className="eyebrow"><ShoppingBag size={15}/> THE BMTECH STORE</span><h2 id="undersale-heading">Products Undersale</h2><p>Explore quality electronics and equipment available for purchase at BMTech Limited.</p></div><span className="shop-heading-note">Real products. Personal service.</span></div>
    {catalogLoading ? <div className="shop-loading" role="status">Loading products available for purchase...</div> : catalogError ? <div className="shop-empty" role="alert"><h3>Products could not be loaded</h3><p>Please try again to see the current selection.</p><button className="button button-outline" onClick={refreshCatalog}>Try again</button></div> : items.length ? <ProductGrid items={items} variant="sale"/> : <div className="shop-empty"><ShoppingBag size={28}/><h3>New products will appear here</h3><p>Check back for electronics and equipment published by BMTech.</p></div>}
    <div className="shop-view-all"><Link href="/undersale" className="button button-primary">View All Undersale Products<ArrowRight size={16}/></Link></div>
  </div></section>;
}
