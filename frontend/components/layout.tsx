"use client";

import { LocaleLink as Link } from "@/components/locale-link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, BatteryCharging, ChevronDown, Menu, MessageCircle, Phone, Search, ShoppingBag, X, Zap } from "lucide-react";
import { whatsappLink } from "@/lib/data";
import { useStore } from "@/app/providers";

const nav = [
  ["Home", "/"], ["Products", "/products"], ["Services", "/services"], ["Projects", "/projects"], ["About", "/about"], ["Contact", "/contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const { language, setLanguage, count, company } = useStore();
  const french = language === "fr";
  const switchLanguage = (next: "en" | "fr") => {
    setLanguage(next);
    const currentPath = path || "/";
    const nextPath = /^\/(en|fr)(?:\/|$)/.test(currentPath)
      ? currentPath.replace(/^\/(en|fr)(?=\/|$)/, `/${next}`)
      : currentPath === "/" ? `/${next}` : `/${next}${currentPath}`;
    router.push(`${nextPath}${typeof window === "undefined" ? "" : window.location.search}${typeof window === "undefined" ? "" : window.location.hash}`);
  };
  return (
    <>
      <div className="topbar"><div className="container topbar-inner"><span>Kigali, Rwanda <i /> Service coverage across Rwanda</span><div className="topbar-right"><a href={`tel:${company.phone}`}><Phone size={13} />{company.phone}</a><label className="language-control"><span className="sr-only">Language</span><select aria-label="Language" value={language} onChange={(e) => switchLanguage(e.target.value as "en" | "fr")}><option value="en">EN</option><option value="fr">FR</option></select><ChevronDown size={12} /></label></div></div></div>
      <header className="site-header"><div className="container header-inner">
        <Link href="/" className="brand" aria-label="BMTECH home"><span className="brand-mark"><Zap size={21} fill="currentColor" /></span><span className="brand-word">BM<span>TECH</span><small>POWER SOLUTIONS</small></span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{nav.map(([label, href]) => <Link key={href} href={href} className={path === href || (href !== "/" && path.startsWith(href)) ? "active" : ""}>{french ? ({ Home: "Accueil", Products: "Produits", Services: "Services", Projects: "Projets", About: "À propos", Contact: "Contact" } as Record<string, string>)[label] : label}</Link>)}</nav>
        <div className="header-actions"><Link aria-label="Search products" href="/products" className="icon-button search-link"><Search size={19} /></Link><Link href="/cart" className="cart-link" aria-label={`Cart, ${count} items`}><ShoppingBag size={19} /><span>Cart</span><b>{count}</b></Link><Link href="/quote" className="button button-primary header-quote">{french ? "Demander un devis" : "Request a Quote"}<ArrowRight size={15} /></Link><button className="icon-button mobile-menu-button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>
      </div>
      {open && <div className="mobile-nav"><div className="mobile-nav-links">{nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowRight size={16} /></Link>)}</div><Link className="button button-primary mobile-quote" href="/quote" onClick={() => setOpen(false)}>Request a Quote <ArrowRight size={16} /></Link><a className="mobile-contact" href={whatsappLink(undefined, company.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Chat on WhatsApp</a><div className="mobile-language"><span>Language</span><button onClick={() => switchLanguage("en")} className={language === "en" ? "selected" : ""}>English</button><button onClick={() => switchLanguage("fr")} className={language === "fr" ? "selected" : ""}>Français</button></div></div>}
      </header>
    </>
  );
}

export function Footer() {
  const { company } = useStore();
  return <footer className="site-footer"><div className="container footer-main"><div className="footer-brand"><Link href="/" className="brand brand-light"><span className="brand-mark"><Zap size={21} fill="currentColor" /></span><span className="brand-word">BM<span>TECH</span><small>POWER SOLUTIONS</small></span></Link><p>Power equipment, electrical installation and maintenance enquiries for homes and businesses across Rwanda.</p><a className="footer-whatsapp" href={whatsappLink(undefined, company.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Chat with BMTECH <ArrowRight size={15} /></a></div><div className="footer-column"><h3>Explore</h3><Link href="/products">Products</Link><Link href="/services">Services</Link><Link href="/projects">Projects <small>Illustrative gallery</small></Link><Link href="/about">About BMTECH</Link></div><div className="footer-column"><h3>Help & support</h3><Link href="/quote">Request a quote</Link><Link href="/booking">Book a technician</Link><Link href="/faq">Frequently asked questions</Link><Link href="/reviews">Reviews <small>Moderated submissions</small></Link></div><div className="footer-column footer-contact"><h3>Contact</h3><span><Phone size={15} /><a href={`tel:${company.phone}`}>{company.phone}</a></span>{company.email && <span><a href={`mailto:${company.email}`}>{company.email}</a></span>}{company.businessHours && <span><BatteryCharging size={15} />{company.businessHours}</span>}<span><BatteryCharging size={15} />Kigali, Rwanda</span><span>Serving customers across Rwanda</span><Link href="/contact" className="footer-contact-link">Contact page <ArrowRight size={14} /></Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} BMTECH. All rights reserved.</span><span className="footer-disclaimer">Prices and availability must be confirmed with BMTECH.</span><Link href="/faq">Privacy & terms</Link></div></footer>;
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return <><Header />{children}<Footer /></>;
}
