"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, ShieldCheck } from "lucide-react";

export function AdminSettingsNav() {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const base = `/${locale === "fr" ? "fr" : "en"}/admin/settings`;
  return <nav className="admin-settings-tabs" aria-label="Settings sections">
    <Link href={base} aria-current={pathname === base ? "page" : undefined}><Building2 size={16} />Company settings</Link>
    <Link href={`${base}/account-security`} aria-current={pathname.endsWith("/account-security") ? "page" : undefined}><ShieldCheck size={16} />Account &amp; Security</Link>
  </nav>;
}
