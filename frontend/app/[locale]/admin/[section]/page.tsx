import { notFound } from "next/navigation";
import { AdminResourcePage } from "@/components/admin-resource";

const sections = ["products", "categories", "orders", "payments", "quotations", "bookings", "messages", "reviews", "settings"] as const;

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section as (typeof sections)[number])) notFound();
  return <AdminResourcePage resource={section as (typeof sections)[number]} />;
}
