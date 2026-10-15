"use client";

import { CalendarDays, MessageCircle } from "lucide-react";
import { PageHero, Breadcrumbs } from "@/components/ui";
import { RequestForm } from "@/components/request-form";
import { whatsappLink as buildWhatsappLink } from "@/lib/data";
import { useStore } from "@/app/providers";

export default function BookingPage() {
  const { company } = useStore();
  const whatsappLink = buildWhatsappLink("Hello BMTECH, I would like to ask about a technician booking.", company.whatsapp);
  return <main><PageHero eyebrow="TECHNICIAN ENQUIRY" title="Request a technician" description="Tell us what service you need, where the work is located and a preferred time. BMTECH will need to confirm any appointment."/><div className="container page-content"><Breadcrumbs items={[{label:"Book a Technician"}]}/><div className="checkout-layout" style={{maxWidth:1000,margin:"0 auto"}}><RequestForm kind="booking"/><aside className="cart-summary"><h2>Before you submit</h2><div className="benefit-list" style={{margin:"12px 0"}}><div className="benefit"><span className="benefit-check"><CalendarDays size={13}/></span><div><h3>Share a preferred date</h3><p>Past dates are not accepted. The requested time is a preference only.</p></div></div><div className="benefit"><span className="benefit-check"><MessageCircle size={13}/></span><div><h3>Wait for confirmation</h3><p>A booking is not confirmed until BMTECH confirms the appointment.</p></div></div></div><a href={whatsappLink} target="_blank" rel="noreferrer" className="button button-outline button-block">Contact BMTECH on WhatsApp</a></aside></div></div></main>;
}
