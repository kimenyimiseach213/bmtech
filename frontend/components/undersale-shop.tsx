"use client";
import { useMemo, useState } from "react";
import { Search, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useStore } from "@/app/providers";
import { Breadcrumbs, PageHero } from "@/components/ui";
import { ProductGrid } from "@/components/products";
import { isUndersale, shopProducts } from "@/lib/catalog";

export function UndersaleShop() {
  const { products, catalogLoading, catalogError, refreshCatalog } = useStore();
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("all");
  const [brand, setBrand] = useState("all");
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("latest");
  const [limit, setLimit] = useState(12);
  const brands = [...new Set(products.filter(isUndersale).map(product => product.brand).filter((value): value is string => Boolean(value)))].sort();
  const items = useMemo(() => shopProducts(products, { search, condition, brand, available, sort }), [products, search, condition, brand, available, sort]);
  function clear() { setSearch(""); setCondition("all"); setBrand("all"); setAvailable(false); setSort("latest"); setLimit(12); }
  return <main className="shop-page"><PageHero eyebrow="BMTECH LIMITED / THE STORE" title="Products Undersale" description="Explore quality electronics and equipment available for purchase at BMTech Limited."/><div className="container page-content"><Breadcrumbs items={[{ label: "Undersale products" }]}/>
    <div className="shop-toolbar"><label className="search-field"><Search size={18}/><input aria-label="Search Undersale products" placeholder="Search products, brands or models" value={search} onChange={event => { setSearch(event.target.value); setLimit(12); }}/></label><label className="shop-sort">Sort by<select className="select-control" value={sort} onChange={event => setSort(event.target.value)}><option value="latest">Latest products</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option></select></label></div>
    <div className="shop-filters"><span><SlidersHorizontal size={15}/> Refine your selection</span><label>Condition<select value={condition} onChange={event => setCondition(event.target.value)}><option value="all">Any condition</option>{["New", "Used", "Refurbished"].map(value => <option key={value}>{value}</option>)}</select></label><label>Brand<select value={brand} onChange={event => setBrand(event.target.value)}><option value="all">All brands</option>{brands.map(value => <option key={value}>{value}</option>)}</select></label><label className="shop-available"><input type="checkbox" checked={available} onChange={event => setAvailable(event.target.checked)}/> In stock only</label><button type="button" onClick={clear}>Clear filters</button></div>
    <div className="shop-result-count" role="status">{catalogLoading ? "Loading products..." : `${items.length} ${items.length === 1 ? "product" : "products"}`}<span>Manual ordering through the CEO on WhatsApp</span></div>
    {catalogLoading ? <div className="shop-loading" role="status">Loading the latest BMTech products...</div> : catalogError ? <div className="shop-empty" role="alert"><h2>Unable to load products</h2><p>Please retry the catalog connection.</p><button onClick={refreshCatalog} className="button button-primary">Try again</button></div> : items.length ? <><ProductGrid items={items.slice(0, limit)} variant="sale"/>{items.length > limit && <div className="shop-view-all"><button className="button button-outline" onClick={() => setLimit(value => value + 12)}>Show more products</button></div>}</> : <div className="shop-empty"><ShoppingBag size={30}/><h2>No products to show</h2><p>{products.some(isUndersale) ? "Try another search or clear your filters." : "Published products will appear here as BMTech adds them."}</p><button className="button button-outline" onClick={clear}>Clear filters</button></div>}
  </div></main>;
}
