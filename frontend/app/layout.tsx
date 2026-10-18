import type { Metadata } from "next";
import "./globals.css";
import "./account-security.css";
import { Providers } from "./providers";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = {
  title: { default: "BMTECH | Power Solutions in Rwanda", template: "%s | BMTECH" },
  description: "Generator, electrical installation, maintenance and backup power enquiries across Rwanda.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers><SiteFrame>{children}</SiteFrame></Providers></body></html>;
}
