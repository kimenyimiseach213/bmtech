"use client";

import { usePathname } from "next/navigation";
import { Footer, Header } from "@/components/layout";

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || /^\/(en|fr)\/admin(?:\/|$)/.test(pathname)) return <>{children}</>;
  return <><Header/>{children}<Footer/></>;
}
