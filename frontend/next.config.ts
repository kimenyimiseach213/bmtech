import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.BMTECH_NEXT_DIST_DIR ?? ".next",
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }, { protocol: "https", hostname: "*.public.blob.vercel-storage.com" }] },
};

export default nextConfig;
