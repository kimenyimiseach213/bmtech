import { LocaleLink as Link } from "@/components/locale-link";
import { ArrowRight, ChevronRight, type LucideIcon } from "lucide-react";

export function SectionHeading({ eyebrow, title, description, link, align = "left" }: { eyebrow?: string; title: string; description?: string; link?: { label: string; href: string }; align?: "left" | "center" }) {
  return <div className={`section-heading ${align === "center" ? "centered" : ""}`}>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<div className="section-heading-row"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{link && <Link className="text-link" href={link.href}>{link.label}<ArrowRight size={16} /></Link>}</div></div>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="eyebrow">{children}</span>; }

export function PageHero({ eyebrow, title, description, image, imageAlt, children }: { eyebrow: string; title: string; description: string; image?: string; imageAlt?: string; children?: React.ReactNode }) {
  return <section className={`page-hero ${image ? "page-hero-image" : ""}`}><div className="container page-hero-content"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p>{children}</div>{image && <div className="page-hero-photo"><img src={image} alt={imageAlt ?? "Illustrative power systems photography"} /></div>}</div></section>;
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link>{items.map((item, index) => <span key={`${item.label}-${index}`} className="breadcrumb-item"><ChevronRight size={13} />{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}

export function PriceDisplay({ amount, small = false }: { amount: number | null; small?: boolean }) {
  return amount === null ? <span className={`price-quote ${small ? "small" : ""}`}>Request a quote</span> : <span className={`price-value ${small ? "small" : ""}`}>{new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 }).format(amount)} <small>RWF</small></span>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "blue" }) { return <span className={`status-badge status-${tone}`}><i />{children}</span>; }

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: { label: string; href: string } }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={23} /></span><h3>{title}</h3><p>{description}</p>{action && <Link className="button button-primary" href={action.href}>{action.label}<ArrowRight size={15} /></Link>}</div>;
}

export function FeatureItem({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text?: string }) {
  return <div className="feature-item"><span className="feature-icon"><Icon size={20} /></span><div><b>{title}</b>{text && <small>{text}</small>}</div></div>;
}
