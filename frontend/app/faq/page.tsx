import { PageHero, Breadcrumbs } from "@/components/ui";
import { FAQ } from "@/components/faq";

export default function FAQPage() { return <main><PageHero eyebrow="HELP & INFORMATION" title="Frequently asked questions" description="Helpful answers about products, installation enquiries, delivery, quotations and bookings."/><div className="container page-content"><Breadcrumbs items={[{label:"FAQ"}]}/><div style={{paddingTop:8}}><FAQ/></div></div></main>; }
