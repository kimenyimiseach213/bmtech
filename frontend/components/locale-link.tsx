"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/app/providers";

type LocaleLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps;

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const pathname = usePathname();
  const { language } = useStore();
  const activeLocale = pathname.match(/^\/(en|fr)(?:\/|$)/)?.[1] ?? language;
  let localizedHref = href;
  if (typeof href === "string" && href.startsWith("/") && !href.startsWith("//") && !/^\/(en|fr)(?:\/|$)/.test(href)) {
    localizedHref = href === "/" ? `/${activeLocale}` : `/${activeLocale}${href}`;
  }
  return <Link href={localizedHref} {...props} />;
}
