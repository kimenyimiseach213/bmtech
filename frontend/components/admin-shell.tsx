"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Boxes, CalendarDays, ChevronDown, ClipboardList, FileText, FolderTree, LayoutDashboard, LogOut, Mail, MessageSquareText, Package, Settings, ShieldCheck, Star, Wallet, Zap } from "lucide-react";
import { LocaleLink as Link } from "@/components/locale-link";
import { useStore } from "@/app/providers";
import { apiPaths, apiRequest } from "@/lib/api";

const navigation = [
  { key: "dashboard", label: "Overview", icon: LayoutDashboard },
  { key: "products", label: "Products & inventory", icon: Boxes },
  { key: "categories", label: "Categories", icon: FolderTree },
  { key: "orders", label: "Orders", icon: Package },
  { key: "payments", label: "Payments", icon: Wallet },
  { key: "quotations", label: "Quotations", icon: FileText },
  { key: "bookings", label: "Technician bookings", icon: CalendarDays },
  { key: "messages", label: "Messages", icon: Mail },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "settings", label: "Company settings", icon: Settings },
];

const frenchLabels: Record<string, string> = {
  "Overview": "Vue d’ensemble", "Products & inventory": "Produits et stock", Categories: "Catégories", Orders: "Commandes", Payments: "Paiements", Quotations: "Devis", "Technician bookings": "Rendez-vous techniciens", Messages: "Messages", Reviews: "Avis", "Company settings": "Paramètres de l’entreprise",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, notify } = useStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const locale = pathname.match(/^\/(en|fr)(?:\/|$)/)?.[1] ?? language;
  const french = locale === "fr";

  if (pathname.endsWith("/admin/login")) return <>{children}</>;

  async function logout() {
    setLoggingOut(true);
    try { await apiRequest(apiPaths.logout, { method: "POST", body: JSON.stringify({}) }); }
    catch { /* Clear the local session cookie even if the API is already unavailable. */ }
    finally {
      await fetch("/api/admin/session", { method: "DELETE", credentials: "include" }).catch(() => undefined);
      setLoggingOut(false);
      router.replace(`/${locale}/admin/login`);
      router.refresh();
    }
  }

  const activeSection = pathname.split("/").filter(Boolean)[2] ?? "dashboard";
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link href={`/${locale}/admin/dashboard`} className="brand" aria-label="BMTECH admin dashboard"><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><span className="brand-word">BM<span>TECH</span><small>ADMIN CONSOLE</small></span></Link>
      <div className="admin-nav-label">{french ? "GESTION" : "WORKSPACE"}</div>
      <nav aria-label="Admin navigation">{navigation.map(({ key, label, icon: Icon }) => <Link key={key} href={`/${locale}/admin/${key}`} className={activeSection === key ? "admin-active" : ""}><Icon size={16} /><span>{french ? frenchLabels[label] : label}</span></Link>)}</nav>
      <div className="admin-sidebar-bottom"><span className="admin-secure-badge"><ShieldCheck size={14} />{french ? "Espace sécurisé" : "Secure workspace"}</span><Link href={`/${locale}`} className="admin-store-link"><Activity size={14} />{french ? "Voir le site public" : "View public storefront"}</Link></div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar"><div><span className="admin-topbar-path">BMTECH / <b>{navigation.find((item) => item.key === activeSection)?.label ?? "Admin"}</b></span></div><div className="admin-topbar-actions"><label className="admin-locale-select"><span className="sr-only">Language</span><select value={locale} onChange={(event) => { const next = event.target.value as "en" | "fr"; setLanguage(next); router.push(pathname.replace(/^\/(en|fr)(?=\/|$)/, `/${next}`)); }}><option value="en">EN</option><option value="fr">FR</option></select><ChevronDown size={13} /></label><span className="admin-user-chip"><span className="admin-user-avatar">A</span><b>{french ? "Administrateur" : "Administrator"}</b></span><button type="button" className="admin-logout" onClick={logout} disabled={loggingOut}><LogOut size={15} />{loggingOut ? (french ? "Déconnexion…" : "Signing out…") : (french ? "Quitter" : "Sign out")}</button></div></header>
      {children}
    </div>
  </div>;
}
