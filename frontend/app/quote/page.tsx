import { PageHero, Breadcrumbs } from "@/components/ui";
import { RequestForm } from "@/components/request-form";

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ item?: string }> }) {
  const query = await searchParams;
  return <main><PageHero eyebrow="LET'S TALK REQUIREMENTS" title="Request a quotation" description="Share your requirements, location and preferred contact method. BMTECH can review the details and follow up manually."/><div className="container page-content"><Breadcrumbs items={[{label:"Request a Quote"}]}/><div style={{maxWidth:780,margin:"0 auto"}}><RequestForm kind="quote" initialSelection={query.item || ""}/></div></div></main>;
}
