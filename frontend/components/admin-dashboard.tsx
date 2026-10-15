"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, ArrowRight, CalendarDays, ClipboardList, FileText, Mail, RefreshCw, Wallet } from "lucide-react";
import { LocaleLink as Link } from "@/components/locale-link";
import { useStore } from "@/app/providers";
import { apiPaths, apiRequest } from "@/lib/api";

type Summary = { pendingOrders: number; unverifiedPayments: number; openQuotations: number; pendingBookings: number; unreadMessages: number };
const metricKeys: Record<keyof Summary, string[]> = {
  pendingOrders: ["pendingOrders", "ordersPending", "pending_orders"],
  unverifiedPayments: ["unverifiedPayments", "paymentsUnverified", "pendingPayments", "unverified_payments"],
  openQuotations: ["openQuotations", "openQuotes", "quotationsOpen", "open_quotations"],
  pendingBookings: ["pendingBookings", "bookingsPending", "pending_bookings"],
  unreadMessages: ["unreadMessages", "messagesUnread", "unread_messages"],
};

function readSummary(payload: unknown): Summary {
  let row = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  if (row.data && typeof row.data === "object") row = row.data as Record<string, unknown>;
  if (row.counts && typeof row.counts === "object") row = row.counts as Record<string, unknown>;
  const read = (keys: string[]) => {
    for (const key of keys) if (row[key] !== undefined) return Number(row[key]) || 0;
    return 0;
  };
  return {
    pendingOrders: read(metricKeys.pendingOrders),
    unverifiedPayments: read(metricKeys.unverifiedPayments),
    openQuotations: read(metricKeys.openQuotations),
    pendingBookings: read(metricKeys.pendingBookings),
    unreadMessages: read(metricKeys.unreadMessages),
  };
}

export function AdminDashboard() {
  const { language } = useStore();
  const french = language === "fr";
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<unknown>(apiPaths.dashboard);
      setSummary(readSummary(response));
      setLastUpdated(new Date().toLocaleString(french ? "fr-RW" : "en-RW", { dateStyle: "medium", timeStyle: "short" }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Dashboard data could not be loaded.");
      setSummary(null);
    } finally { setLoading(false); }
  }, [french]);

  useEffect(() => { void refresh(); }, [refresh]);

  const metrics = [
    { key: "pendingOrders", title: french ? "Commandes en attente" : "Pending orders", icon: ClipboardList, href: "orders" },
    { key: "unverifiedPayments", title: french ? "Paiements à vérifier" : "Unverified payments", icon: Wallet, href: "payments" },
    { key: "openQuotations", title: french ? "Demandes de devis ouvertes" : "Open quotation requests", icon: FileText, href: "quotations" },
    { key: "pendingBookings", title: french ? "Rendez-vous en attente" : "Pending technician bookings", icon: CalendarDays, href: "bookings" },
    { key: "unreadMessages", title: french ? "Messages non lus" : "Unread messages", icon: Mail, href: "messages" },
  ] as const;

  return <main className="admin-content">
    <div className="admin-title-row"><div><span className="admin-eyebrow">{french ? "CENTRE DE CONTRÔLE" : "CONTROL CENTER"}</span><h1>{french ? "Vue d’ensemble" : "Dashboard overview"}</h1><p>{french ? "Suivez les demandes et les opérations BMTECH." : "Track BMTECH requests and day-to-day operations."}</p></div><button type="button" className="button button-outline admin-refresh" onClick={() => void refresh()} disabled={loading}><RefreshCw size={14} className={loading ? "admin-spin" : ""} />{french ? "Actualiser" : "Refresh"}</button></div>
    {error && <div className="admin-alert admin-alert-error" role="alert"><b>{french ? "Données indisponibles" : "Dashboard unavailable"}</b><span>{error}</span><small>{french ? "Vérifiez que le backend est démarré et que ses routes de tableau de bord correspondent." : "Check that the backend is running and its dashboard endpoint is configured."}</small></div>}
    <section className="admin-kpi-grid" aria-label={french ? "Indicateurs" : "Overview metrics"}>{metrics.map(({ key, title, icon: Icon, href }) => <Link key={key} href={`/${french ? "fr" : "en"}/admin/${href}`} className="admin-kpi admin-kpi-link"><div className="admin-kpi-top"><span>{title}</span><i className="admin-kpi-icon"><Icon size={15} /></i></div><strong>{loading && !summary ? "—" : summary?.[key] ?? "—"}</strong><small>{french ? "D’après les données du serveur" : "From current server data"}</small></Link>)}</section>
    <div className="admin-grid-two admin-dashboard-panels"><section className="admin-panel"><div className="admin-panel-heading"><div><h2>{french ? "Actions rapides" : "Quick actions"}</h2><p>{french ? "Accédez aux tâches courantes." : "Jump into common admin tasks."}</p></div><Activity size={17} /></div><div className="admin-quick-links"><Link href={`/${french ? "fr" : "en"}/admin/products`}><span><ClipboardList size={16} /></span><b>{french ? "Mettre à jour le catalogue" : "Update product catalogue"}<small>{french ? "Stock, prix et photos" : "Inventory, pricing and photos"}</small></b><ArrowRight size={15} /></Link><Link href={`/${french ? "fr" : "en"}/admin/quotations`}><span><FileText size={16} /></span><b>{french ? "Examiner les demandes de devis" : "Review quotation requests"}<small>{french ? "Répondre aux demandes clients" : "Respond to customer requests"}</small></b><ArrowRight size={15} /></Link><Link href={`/${french ? "fr" : "en"}/admin/bookings`}><span><CalendarDays size={16} /></span><b>{french ? "Planifier un technicien" : "Schedule a technician"}<small>{french ? "Confirmer ou reprogrammer" : "Confirm or reschedule a booking"}</small></b><ArrowRight size={15} /></Link></div></section><section className="admin-panel admin-system-panel"><h2>{french ? "État de connexion" : "Connection status"}</h2><div className={`admin-system-status ${error ? "is-offline" : summary ? "is-online" : "is-loading"}`}><span /><b>{error ? (french ? "API indisponible" : "API unavailable") : summary ? (french ? "Connecté au serveur" : "Connected to server") : (french ? "Connexion…" : "Connecting…")}</b></div><p>{error || (lastUpdated ? `${french ? "Dernière actualisation" : "Last updated"}: ${lastUpdated}` : (french ? "Chargement des données de gestion…" : "Loading management data…"))}</p><Link className="text-link" href={`/${french ? "fr" : "en"}/admin/settings`}>{french ? "Ouvrir les paramètres" : "Open company settings"}<ArrowRight size={14} /></Link></section></div>
  </main>;
}
