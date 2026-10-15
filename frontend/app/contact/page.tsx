"use client";

import { MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero, Breadcrumbs } from "@/components/ui";
import { RequestForm } from "@/components/request-form";
import { whatsappLink as buildWhatsappLink } from "@/lib/data";
import { useStore } from "@/app/providers";

export default function ContactPage() {
  const { company } = useStore();
  const phoneDisplay = company.phone;
  const whatsappLink = (message?: string) => buildWhatsappLink(message, company.whatsapp);
  return <main><PageHero eyebrow="CONTACT BMTECH" title="Tell us how we can help" description="Contact the BMTECH team about products, power installation, maintenance or a project enquiry."/><div className="container page-content"><Breadcrumbs items={[{label:"Contact"}]}/><div className="checkout-layout" style={{maxWidth:1000,margin:"0 auto"}}><div><div className="section-heading"><span className="eyebrow">CONTACT DETAILS</span><div className="benefit-list" style={{marginTop:19}}><div className="benefit"><span className="benefit-check"><Phone size={14}/></span><div><h3>Call BMTECH</h3><p><a href={`tel:${phoneDisplay}`} style={{color:"var(--blue)",fontWeight:700}}>{phoneDisplay}</a></p></div></div><div className="benefit"><span className="benefit-check"><MessageCircle size={14}/></span><div><h3>WhatsApp</h3><p>Open a chat with BMTECH and prepare your question.</p></div></div><div className="benefit"><span className="benefit-check"><MapPin size={14}/></span><div><h3>Kigali, Rwanda</h3><p>Service enquiries are welcomed from across Rwanda.</p></div></div></div></div><a href={whatsappLink()} target="_blank" rel="noreferrer" className="button button-outline"><MessageCircle size={15}/>Chat on WhatsApp</a><p className="field-hint" style={{marginTop:12}}>Opening WhatsApp does not mean a message has been sent.</p></div><RequestForm kind="contact"/></div></div></main>;
}
