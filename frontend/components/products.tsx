"use client";
import { LocaleLink as Link } from "@/components/locale-link";
import { useState } from "react";
import { ArrowRight, Eye, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { useStore } from "@/app/providers";
import { PriceDisplay } from "@/components/ui";
import { PhotoCycler } from "@/components/photo-cycler";
import { ProductPhoto } from "@/components/product-photo";
import { OrderNow } from "@/components/order-now";
export function ProductCard({ product }: { product: Product }) {
  const { language, add, notify } = useStore();
  const name = product.name[language] || product.name.en;
  const canBuy = product.price !== null && product.stock > 0 && product.isAvailable !== false;
  const images = product.images?.length ? product.images : [{ src: product.image, alt: name }];
  const href = `/products/${product.slug}`;
  return <article className="product-card shop-product-card"><Link href={href} className="product-card-image" aria-label={`View ${name}`}><ProductPhoto src={product.image || images[0]?.src || ""} alt={name}/><span className="product-labels">{product.condition && <span className="pill pill-blue">{product.condition}</span>}</span></Link><div className="product-card-body"><span className="product-category">{language === "fr" ? product.categoryFr : product.category}</span><Link href={href}><h3>{name}</h3></Link>{(product.brand || product.model) && <span className="product-sku">{[product.brand, product.model].filter(Boolean).join(" / ")}</span>}<p className="product-short-description">{product.shortDescription || product.description[language] || product.description.en}</p><div className="product-price-row"><PriceDisplay amount={product.price} small/></div><div className={`product-availability ${product.stock < 1 ? "out" : ""}`}><i/>{product.stock < 1 ? "Out of Stock" : product.isAvailable === false ? "Unavailable" : product.availability || "In stock"}</div><div className="product-card-actions sale-actions">{product.price === null ? <Link href={`/quote?item=${encodeURIComponent(name)}`} className="button button-primary">Request a quote</Link> : <OrderNow product={product}/>}<button className="button button-outline" disabled={!canBuy} onClick={() => { add(product.slug); notify("Added to cart (up to available stock)"); }}><ShoppingCart size={15}/>Add to Cart</button></div></div></article>;
}
export function EquipmentCard({ product }: { product: Product }) {
  const { language, add, notify } = useStore();
  const name = product.name[language] || product.name.en;
  const category = language === "fr" ? product.categoryFr : product.category;
  const canBuy = product.price !== null && product.stock > 0 && product.isAvailable !== false;
  const images = product.images?.length ? product.images : [{ src: product.image, alt: `${name} product example` }];
  const [photoIndex, setPhotoIndex] = useState(0);
  const productHref = `/products/${product.slug}${images.length > 1 ? `?photo=${photoIndex}` : ""}`;
  return <article className="product-card">
    <Link href={productHref} className="product-card-image" aria-label={`View ${name}`}>
      <PhotoCycler className="product-photo-cycler" images={images} fit="contain" onImageChange={setPhotoIndex} />
      <span className="product-labels">{product.condition && <span className={`pill ${product.condition === "New" ? "pill-blue" : "pill-amber"}`}>{product.condition === "New" ? (language === "fr" ? "Neuf" : "New") : (language === "fr" ? "Occasion" : "Used")}</span>}{product.demo && <span className="pill">Demo</span>}</span>
    </Link>
    <div className="product-card-body">
      <span className="product-category">{category}</span>
      <Link href={productHref}><h3>{name}</h3></Link>
      {(product.model || product.sku) && <span className="product-sku">{[product.model, product.sku].filter(Boolean).join(" · ")}</span>}
      <div className="product-price-row"><PriceDisplay amount={product.price} small /></div>
      <div className={`product-availability ${product.stock < 1 ? "out" : ""}`}><i />{product.stock > 0 ? (language === "fr" ? "Disponibilité à confirmer" : "Availability to confirm") : (language === "fr" ? "Disponibilité sur demande" : "Request availability")}</div>
      <div className="product-card-actions"><Link href={productHref} className="button button-outline">{language === "fr" ? "Voir le produit" : "View details"}<ArrowRight size={13} /></Link>{canBuy ? <button className="icon-button" title="Add to cart" aria-label={`Add ${name} to cart`} onClick={() => { add(product.slug); notify(language === "fr" ? "Ajouté au panier de démonstration" : "Added to cart"); }}><ShoppingCart size={15} /></button> : <Link className="icon-button" title="Request a quote" aria-label={`Request a quote for ${name}`} href={`/quote?item=${encodeURIComponent(name)}`}><Eye size={15} /></Link>}</div>
    </div>
  </article>;
}


export function ProductGrid({ items, variant }: { items: Product[]; variant?: "equipment" | "sale" }) { return <div className={`product-grid ${variant === "sale" ? "shop-product-grid" : ""}`}>{items.map(product => variant === "equipment" || (!variant && !product.isUndersale) ? <EquipmentCard key={product.slug} product={product}/> : <ProductCard key={product.slug} product={product}/>)}</div>; }
