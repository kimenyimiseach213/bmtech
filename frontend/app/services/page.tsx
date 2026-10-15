"use client";

import { LocaleLink as Link } from "@/components/locale-link";
import { ArrowRight, ArrowUpRight, BatteryCharging, Cable, SearchCheck, Settings2, Wrench, Zap, type LucideIcon } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui";
import { PhotoCycler } from "@/components/photo-cycler";
import { services, whatsappLink as buildWhatsappLink } from "@/lib/data";
import { useStore } from "@/app/providers";

const icons: LucideIcon[] = [Zap,Wrench,BatteryCharging,Cable,SearchCheck,Settings2];
const includes = ["Generator sizing and placement discussions", "Inspection, routine service and repair enquiries", "Switching arrangements and compatibility checks", "Wiring, distribution and electrical installation support", "Fault description and site information review", "Planned maintenance needs and equipment condition"];
const needs = ["New standby supply for a home or business", "Equipment not starting or operating as expected", "A safer way to switch between utility and backup power", "A new installation or electrical upgrade", "Power interruptions or troubleshooting questions", "A regular check of installed power equipment"];

export default function ServicesPage() {
  const { company } = useStore();
  const whatsappLink = (message: string) => buildWhatsappLink(message, company.whatsapp);
  return <main><PageHero eyebrow="BMTECH SERVICES" title="Power services, shaped around your needs" description="Explore installation, repair and maintenance enquiries for generators and electrical systems. Scope and pricing depend on the equipment and site requirements."/><section className="section-sm"><div className="container"><div className="demo-banner" style={{marginBottom:24}}>Service descriptions are general examples. Availability, scope and any site visit require confirmation by BMTECH.</div><div style={{display:"grid",gap:22}}>{services.map((service,index)=>{const Icon=icons[index];return <article className="form-card service-feature-card" key={service.title}><div className="service-photo-frame"><PhotoCycler className="service-photo-cycler" images={service.images} fit="cover" interval={4500}/></div><div><span className="service-icon"><Icon size={19}/></span><h2 style={{fontSize:21,color:"var(--navy)",margin:"12px 0 5px"}}>{service.title}</h2><p className="detail-copy" style={{marginTop:0}}>{service.description}</p><div className="form-grid" style={{marginTop:15}}><div><b style={{fontSize:10,color:"var(--navy)"}}>Common needs</b><p className="field-hint">{needs[index]}</p></div><div><b style={{fontSize:10,color:"var(--navy)"}}>May include</b><p className="field-hint">{includes[index]}</p></div></div><div className="form-actions"><Link href="/quote" className="button button-primary">Request a Quote<ArrowRight size={14}/></Link><Link href="/booking" className="button button-outline">Book a Technician<ArrowUpRight size={14}/></Link><a className="text-link" href={whatsappLink(`Hello BMTECH, I would like to ask about ${service.title}.`)} target="_blank" rel="noreferrer">WhatsApp</a></div></div></article>})}</div></div></section><section className="section section-mist"><div className="container"><SectionHeading eyebrow="NEXT STEP" title="Tell us what you need" description="A few details about the equipment, site and location can help BMTECH review your enquiry."/><div className="cta-actions"><Link href="/quote" className="button button-primary">Request a Quote<ArrowRight size={14}/></Link><Link href="/booking" className="button button-outline">Book a Technician</Link></div></div></section></main>;
}
