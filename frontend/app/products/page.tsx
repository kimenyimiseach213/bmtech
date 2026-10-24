"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal, X, Zap } from "lucide-react";
import { PageHero, Breadcrumbs, EmptyState } from "@/components/ui";
import { ProductGrid } from "@/components/products";
import { useStore } from "@/app/providers";

export default function ProductsPage() {
  const { categories, products, catalogLoading, catalogError } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("All");
  const [availability, setAvailability] = useState(false);
  const [install, setInstall] = useState(false);
  const [price, setPrice] = useState("All");
  const [sort, setSort] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [visible, setVisible] = useState(4);

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get("category");
    if (requestedCategory && (categories.some((item) => item.name === requestedCategory) || requestedCategory === "Electrical Equipment")) {
      setCategory(requestedCategory);
    }
  }, [categories]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = products.filter((product) => {
      const matchesSearch = !query || [product.name.en, product.name.fr, product.category, product.sku ?? "", product.model ?? ""].some((value) => value.toLowerCase().includes(query));
      const matchesCategory = category === "All" || product.category === category;
      const matchesCondition = condition === "All" || product.condition === condition;
      const matchesAvailability = !availability || product.stock > 0;
      const matchesInstall = !install || product.installation;
      const matchesPrice = price === "All" || (price === "under-1m" && product.price !== null && product.price < 1000000) || (price === "1m-3m" && product.price !== null && product.price >= 1000000 && product.price <= 3000000) || (price === "quote" && product.price === null);
      return matchesSearch && matchesCategory && matchesCondition && matchesAvailability && matchesInstall && matchesPrice;
    });
    return rows.sort((a, b) => sort === "price-low" ? (a.price ?? Infinity) - (b.price ?? Infinity) : sort === "price-high" ? (b.price ?? -1) - (a.price ?? -1) : a.name.en.localeCompare(b.name.en));
  }, [products, search, category, condition, availability, install, price, sort]);

  const clearFilters = () => { setSearch(""); setCategory("All"); setCondition("All"); setAvailability(false); setInstall(false); setPrice("All"); setVisible(4); };
  const filterPanel = <>
    <div className="filter-title-row"><b>Filters</b><button onClick={clearFilters}>Clear all</button></div>
    <div className="filter-group"><h3>Category</h3><label className="filter-option"><input type="radio" name="category" checked={category === "All"} onChange={() => setCategory("All")}/>All categories</label>{categories.map((item) => <label className="filter-option" key={item.name}><input type="radio" name="category" checked={category === item.name} onChange={() => {setCategory(item.name);setVisible(4);}}/>{item.name}</label>)}<label className="filter-option"><input type="radio" name="category" checked={category === "Electrical Equipment"} onChange={() => setCategory("Electrical Equipment")}/>Electrical Equipment</label></div>
    <div className="filter-group"><h3>Condition</h3><div className="filter-chips">{["All", "New", "Used", "Refurbished"].map((value) => <button key={value} className={`filter-chip ${condition === value ? "selected" : ""}`} onClick={() => setCondition(value)}>{value === "All" ? "Any" : value}</button>)}</div></div>
    <div className="filter-group"><h3>Price range (RWF)</h3><select className="select-control" style={{width:"100%"}} value={price} onChange={(e) => setPrice(e.target.value)}><option value="All">Any price</option><option value="under-1m">Under 1,000,000 RWF</option><option value="1m-3m">1,000,000–3,000,000 RWF</option><option value="quote">Request a quote</option></select></div>
    <div className="filter-group"><h3>Availability & installation</h3><label className="filter-option"><input type="checkbox" checked={availability} onChange={(e) => setAvailability(e.target.checked)}/>Available to enquire</label><label className="filter-option"><input type="checkbox" checked={install} onChange={(e) => setInstall(e.target.checked)}/>Installation enquiry available</label></div>
  </>;

  return <main><PageHero eyebrow="POWER EQUIPMENT" title="Explore the catalogue" description="Browse published BMTECH products, including generators, changeover switches and backup power equipment."/><div className="container page-content"><Breadcrumbs items={[{label:"Products"}]}/><div className="catalog-toolbar"><div className="search-field" style={{maxWidth:350,width:"100%"}}><Search size={16}/><input value={search} onChange={(e) => {setSearch(e.target.value);setVisible(4);}} placeholder="Search equipment, model or SKU" aria-label="Search products"/><button className="icon-button" aria-label="Clear search" onClick={() => setSearch("")} style={{padding:3}}><X size={14}/></button></div><div className="catalog-controls"><button className="catalog-mobile-filter" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={14}/>{showFilters ? "Close filters" : "Filters"}</button><span className="catalog-count">{filtered.length} products</span><select className="select-control" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products"><option value="featured">Sort: Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option></select></div></div>
      <div className="catalog-layout">{showFilters && <div className="mobile-filter-panel">{filterPanel}</div>}<aside className="filter-sidebar">{filterPanel}</aside><div className="catalog-results">{catalogError && <div className="catalog-api-notice">The catalogue could not be loaded. Please refresh to try again.</div>}{catalogLoading && <div className="catalog-api-notice">Checking for published BMTECH products…</div>}<div className="product-count-line"><span className="catalog-count">Showing {Math.min(visible,filtered.length)} of {filtered.length}</span><span className="catalog-count">{"BMTECH catalogue"} · RWF</span></div>{filtered.length ? <><ProductGrid items={filtered.slice(0,visible)}/>{filtered.length > visible && <div className="product-section-footer"><button className="button button-outline" onClick={() => setVisible(visible + 4)}>Load more products</button></div>}</> : <EmptyState icon={Zap} title="No matching equipment" description="Try a different search or clear your filters to see the sample catalogue." action={{label:"Clear filters",href:"/products"}}/>}{catalogError && <p className="catalog-disclaimer">Current prices and availability could not be loaded.</p>}</div></div></div></main>;
}
