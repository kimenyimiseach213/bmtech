"use client";

import { LocaleLink as Link } from "@/components/locale-link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, MessageCircle, Minus, Pause, Play, Plus, ShoppingCart, ZoomIn, ZoomOut } from "lucide-react";
import type { Product } from "@/types";
import { Breadcrumbs, PriceDisplay, SectionHeading, StatusBadge } from "@/components/ui";
import { ProductGrid } from "@/components/products";
import { useStore } from "@/app/providers";
import { whatsappLink } from "@/lib/data";

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const { language, add, notify, company } = useStore();
  const name = product.name[language] || product.name.en;
  const description = product.description[language] || product.description.en;
  const images = product.images?.length ? product.images : [{ src: product.image, alt: `${name}, illustrative product image` }];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoom, setZoom] = useState(1.12);
  const activeImage = images[selectedIndex] ?? images[0];
  const [quantity, setQuantity] = useState(1);
  const canBuy = product.price !== null && product.stock > 0;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setIsPlaying(false);
  }, []);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("photo");
    const requestedIndex = requested === null ? -1 : Number(requested);
    if (Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < images.length) {
      setSelectedIndex(requestedIndex);
      setIsPlaying(false);
    }
  }, [images.length]);

  useEffect(() => {
    if (!isPlaying || images.length < 2) return;
    const timer = window.setInterval(() => setSelectedIndex((index) => (index + 1) % images.length), 4000);
    return () => window.clearInterval(timer);
  }, [images.length, isPlaying]);

  const selectImage = (index: number) => {
    setSelectedIndex((index + images.length) % images.length);
    setIsPlaying(false);
  };

  return (
    <main className="container page-content">
      <Breadcrumbs items={[{ label: "Products", href: "/products" }, { label: name }]} />
      <div className="product-detail-grid">
        <section>
          <div className="product-gallery-main">
            <img key={activeImage.src} className="product-gallery-photo" src={activeImage.src} alt={activeImage.alt} style={{ transform: `scale(${zoom})` }} />
            {images.length > 1 && <>
              <button className="gallery-arrow gallery-arrow-prev" type="button" onClick={() => selectImage(selectedIndex - 1)} aria-label="Show previous product photo"><ChevronLeft size={20} /></button>
              <button className="gallery-arrow gallery-arrow-next" type="button" onClick={() => selectImage(selectedIndex + 1)} aria-label="Show next product photo"><ChevronRight size={20} /></button>
            </>}
            <div className="gallery-zoom-controls" aria-label="Photo zoom controls">
              <button type="button" onClick={() => { setIsPlaying(false); setZoom((value) => Math.max(1, Math.round((value - 0.12) * 100) / 100)); }} disabled={zoom <= 1} aria-label="Zoom out"><ZoomOut size={16} /></button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => { setIsPlaying(false); setZoom((value) => Math.min(1.72, Math.round((value + 0.12) * 100) / 100)); }} disabled={zoom >= 1.72} aria-label="Zoom in"><ZoomIn size={16} /></button>
            </div>
            {images.length > 1 && <button className="gallery-play-control" type="button" onClick={() => setIsPlaying((playing) => !playing)} aria-label={isPlaying ? "Pause photo rotation" : "Play photo rotation"}>
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? "Pause" : "Auto rotate"}</span>
            </button>}
            <span className="product-labels">
              {product.condition && <StatusBadge tone="blue">{product.condition}</StatusBadge>}
              {product.demo && <StatusBadge>{language === "fr" ? "Démo" : "Demo"}</StatusBadge>}
            </span>
          </div>
          <div className="product-gallery-thumbs">
            {images.map((item, index) => (
              <button key={item.src} onClick={() => selectImage(index)} className={selectedIndex === index ? "active" : ""} aria-current={selectedIndex === index ? "true" : undefined} aria-label={`Show product photo ${index + 1}: ${item.alt}`}>
                <img src={item.src} alt="" />
              </button>
            ))}
          </div>
          {images.length > 1 && <div className="gallery-photo-count" aria-live="polite">Photo {selectedIndex + 1} of {images.length}{isPlaying ? " · changing automatically" : " · rotation paused"}</div>}
        </section>

        <section className="product-detail-info">
          <span className="eyebrow">{language === "fr" ? product.categoryFr : product.category}</span>
          <h1>{name}</h1>
          <div className="product-detail-meta">
            {product.sku && <span>SKU: {product.sku}</span>}
            {product.model && <span>{product.model}</span>}
            {product.condition && <span>{product.condition}</span>}
          </div>
          <p>{description}</p>
          <div className="detail-price-box">
            <PriceDisplay amount={product.price} />
            <div className="demo-price-note">{product.demo ? "Preview price only · confirm with BMTECH" : product.price ? "Confirm the current price with BMTECH" : "Price depends on the selected model; confirm with BMTECH"}</div>
          </div>
          <div className="detail-availability">
            <Check size={14} />
            {product.stock > 0 ? product.availability : "Availability to be confirmed"} · {product.demo ? "stock shown is demo data" : "confirm current stock with BMTECH"}
          </div>
          <div className="detail-actions" style={{ marginTop: 17 }}>
            {canBuy && <div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={13} /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div>}
            {canBuy && <button className="button button-primary" onClick={() => { add(product.slug, quantity); notify("Added to cart"); }}><ShoppingCart size={15} />Add to Cart</button>}
            <Link href={`/quote?item=${encodeURIComponent(name)}`} className={`button ${canBuy ? "button-outline" : "button-primary"}`}>Request a Quote<ArrowRight size={14} /></Link>
          </div>
          <a className="whatsapp-inline" href={whatsappLink(`Hello BMTECH, I would like to ask about ${name}${product.sku ? ` (${product.sku})` : ""}.`, company.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle size={15} />Ask on WhatsApp</a>
        </section>
      </div>

      <section className="details-tabs">
        {product.demo
          ? <div className="demo-banner"><Check size={14} />Sample product information is illustrative, not verified manufacturer data.</div>
          : <div className="demo-banner"><Check size={14} />Photos supplied by BMTECH. Confirm the selected model, rating, availability and price before purchase.</div>}
        <h2 className="detail-section-title">Technical specifications</h2>
        <table className="spec-table"><tbody>{product.specs.map((spec) => <tr key={spec.label}><th>{spec.label}</th><td>{spec.value}</td></tr>)}</tbody></table>
        <h2 className="detail-section-title">Installation information</h2>
        <p className="detail-copy">{product.installation ? "Installation can be discussed as part of a separate enquiry. Final suitability depends on the site, electrical requirements and equipment configuration." : "Ask BMTECH whether installation support is available for this product."}</p>
        <div style={{ marginTop: 18 }}><Link href="/booking" className="text-link">Book a technician enquiry<ArrowRight size={14} /></Link></div>
      </section>

      <section className="section-sm"><SectionHeading eyebrow="YOU MAY ALSO LIKE" title="Related equipment" /><ProductGrid items={related} /></section>
    </main>
  );
}
