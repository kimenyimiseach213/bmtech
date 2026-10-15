import type { Metadata } from "next";
import { products } from "@/lib/data";
import { LiveProductDetail } from "@/components/live-product-detail";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  return product ? { title: product.name.en } : { title: "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LiveProductDetail slug={slug} />;
}
