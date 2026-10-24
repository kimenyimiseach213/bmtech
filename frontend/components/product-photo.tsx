"use client";
import Image from "next/image";
import { useState } from "react";

/** Report missing media without substituting another product's image. */
export function ProductPhoto({ src, alt, sizes = "(max-width: 600px) 90vw, (max-width: 980px) 45vw, 280px", priority = false }: { src: string; alt: string; sizes?: string; priority?: boolean }) {
  const [failedSource, setFailedSource] = useState("");
  if (!src || failedSource === src) return <span className="photo-unavailable" role="img" aria-label={`${alt}: photo unavailable`}><span>Photo unavailable</span><small>Please contact BMTech for this photo.</small></span>;
  const optimized = src.startsWith("/api/media/") || src.startsWith("/images/") || /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(src) || src.startsWith("https://images.unsplash.com/");
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={!optimized} onError={() => setFailedSource(src)} style={{ objectFit: "contain" }} />;
}
