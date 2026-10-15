"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine, Language, Product, ProductCategory } from "@/types";
import { categories as previewCategories, phoneDisplay, products as previewProducts, whatsappNumber } from "@/lib/data";
import { apiPaths, apiRequest, normalizeCategory, normalizeProduct, unwrapList } from "@/lib/api";

type StoreContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  cart: CartLine[];
  count: number;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  notify: (message: string) => void;
  products: Product[];
  categories: ProductCategory[];
  catalogLoading: boolean;
  catalogError: string;
  company: CompanySettings;
};

export type CompanySettings = { companyName: string; phone: string; whatsapp: string; email: string; businessHours: string; aboutEn: string; aboutFr: string };
const defaultCompany: CompanySettings = { companyName: "BMTECH", phone: phoneDisplay, whatsapp: whatsappNumber, email: "", businessHours: "", aboutEn: "", aboutFr: "" };
const objectRecord = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
function normalizeCompany(payload: unknown): CompanySettings {
  const root = objectRecord(payload);
  const data = objectRecord(root.data);
  const row = objectRecord(data.settings ?? data.company ?? root.settings ?? (Object.keys(data).length ? data : root));
  const contact = objectRecord(row.contact);
  const read = (key: keyof CompanySettings, ...fallbacks: unknown[]) => {
    const value = [row[key], ...fallbacks].find((candidate) => typeof candidate === "string" && candidate.trim());
    return typeof value === "string" ? value.trim() : defaultCompany[key];
  };
  return {
    companyName: read("companyName", row.name),
    phone: read("phone", contact.phone),
    whatsapp: read("whatsapp", row.whatsappNumber, contact.whatsapp, contact.whatsappNumber),
    email: read("email", contact.email),
    businessHours: read("businessHours", row.hours, contact.businessHours),
    aboutEn: read("aboutEn", objectRecord(row.about).en),
    aboutFr: read("aboutFr", objectRecord(row.about).fr),
  };
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(previewProducts);
  const [catalogCategories, setCatalogCategories] = useState<ProductCategory[]>(previewCategories);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [company, setCompany] = useState<CompanySettings>(defaultCompany);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("bmtech-demo-cart");
      const savedLanguage = localStorage.getItem("bmtech-language");
      const pathLocale = window.location.pathname.match(/^\/(en|fr)(?:\/|$)/)?.[1];
      const cookieLocale = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("bmtech_locale="))?.split("=")[1];
      if (savedCart) setCart(JSON.parse(savedCart) as CartLine[]);
      const initialLanguage = pathLocale ?? cookieLocale ?? savedLanguage;
      if (initialLanguage === "en" || initialLanguage === "fr") setLanguageState(initialLanguage);
    } catch {
      setCart([]);
    }
    setReady(true);
  }, []);

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  useEffect(() => {
    let active = true;
    apiRequest<unknown>(apiPaths.publicSettings).then((response) => {
      if (active) setCompany(normalizeCompany(response));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      apiRequest<unknown>(apiPaths.publicProducts),
      apiRequest<unknown>(apiPaths.publicCategories),
    ]).then(([productsResult, categoriesResult]) => {
      if (!active) return;
      const errors: string[] = [];
      if (productsResult.status === "fulfilled") setCatalogProducts(unwrapList(productsResult.value).map(normalizeProduct));
      else errors.push(productsResult.reason instanceof Error ? productsResult.reason.message : "Products could not be loaded.");
      if (categoriesResult.status === "fulfilled") setCatalogCategories(unwrapList(categoriesResult.value).map(normalizeCategory));
      else errors.push(categoriesResult.reason instanceof Error ? categoriesResult.reason.message : "Categories could not be loaded.");
      setCatalogError(errors.join(" "));
      setCatalogLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("bmtech-demo-cart", JSON.stringify(cart));
  }, [cart, ready]);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    localStorage.setItem("bmtech-language", next);
    document.cookie = `bmtech_locale=${next}; Path=/; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  };
  const add = useCallback((slug: string, quantity = 1) => {
    setCart((previous) => {
      const current = previous.find((line) => line.slug === slug);
      return current
        ? previous.map((line) => line.slug === slug ? { ...line, quantity: line.quantity + quantity } : line)
        : [...previous, { slug, quantity }];
    });
  }, []);
  const setQuantity = useCallback((slug: string, quantity: number) => {
    setCart((previous) => quantity < 1 ? previous.filter((line) => line.slug !== slug) : previous.map((line) => line.slug === slug ? { ...line, quantity } : line));
  }, []);
  const remove = useCallback((slug: string) => setCart((previous) => previous.filter((line) => line.slug !== slug)), []);
  const clear = useCallback(() => setCart([]), []);
  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }, []);
  const value = useMemo(() => ({ language, setLanguage, cart, count: cart.reduce((sum, line) => sum + line.quantity, 0), add, setQuantity, remove, clear, notify, products: catalogProducts, categories: catalogCategories, catalogLoading, catalogError, company }), [language, cart, add, setQuantity, remove, clear, notify, catalogProducts, catalogCategories, catalogLoading, catalogError, company]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      {toast && <div role="status" className="toast"><span className="toast-dot" />{toast}</div>}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside Providers");
  return context;
}
