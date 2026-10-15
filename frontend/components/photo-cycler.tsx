"use client";

import { useEffect, useState } from "react";
import type { ProductImage } from "@/types";

export function PhotoCycler({
  images,
  className,
  fit = "cover",
  interval = 4000,
  onImageChange,
}: {
  images: ProductImage[];
  className?: string;
  fit?: "cover" | "contain";
  interval?: number;
  onImageChange?: (index: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (images.length < 2 || hovered || reducedMotion) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % images.length), interval);
    return () => window.clearInterval(timer);
  }, [images.length, hovered, interval, reducedMotion]);

  useEffect(() => onImageChange?.(index), [index, onImageChange]);

  const activeImage = images[index] ?? images[0];
  if (!activeImage) return null;

  return (
    <div className={`photo-cycler ${className ?? ""}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <img key={activeImage.src} src={activeImage.src} alt={activeImage.alt} style={{ objectFit: fit }} />
      {images.length > 1 && <span className="photo-cycler-count" aria-hidden="true">{index + 1} / {images.length}</span>}
    </div>
  );
}
