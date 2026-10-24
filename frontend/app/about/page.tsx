"use client";

import { LocaleLink as Link } from "@/components/locale-link";
import { ArrowRight, Compass, HeartHandshake, Lightbulb, MapPin, ShieldCheck, Target, Wrench } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui";
import { imageUrls } from "@/lib/data";
import { useStore } from "@/app/providers";

const values = [
  { icon: ShieldCheck, title: "Safety minded", body: "Electrical and power requirements deserve careful consideration." },
  { icon: HeartHandshake, title: "Customer focused", body: "Understand the need and site before discussing an appropriate solution." },
  { icon: Lightbulb, title: "Practical guidance", body: "Explain equipment and service options clearly, without overpromising." },
  { icon: Wrench, title: "Ongoing support", body: "Product enquiries can include installation, maintenance and repair needs." },
];

export default function AboutPage() {
  const { company, language } = useStore();
  const companyAbout = language === "fr" ? company.aboutFr : company.aboutEn;
  return <main>
    <PageHero eyebrow={`ABOUT ${company.companyName.toUpperCase()}`} title="Power solutions for homes and businesses" description={`${company.companyName} is an electrical and power solutions company based in Kigali, Rwanda, serving customers across Rwanda.`} image={imageUrls.engineer} imageAlt="Illustrative electrical engineering image" />
    <section className="section"><div className="container split-section"><div><span className="eyebrow">WHO WE ARE</span><h2 style={{ fontSize: 36, lineHeight: 1.15, letterSpacing: "-.045em", color: "var(--navy)", margin: "12px 0" }}>A partner for dependable power needs.</h2><p className="detail-copy">{companyAbout || `${company.companyName} supports customers exploring generators, electrical installation, maintenance and power-backup equipment. The team welcomes enquiries from residential and business customers in Kigali and across Rwanda. Equipment choices and installation requirements vary by site and intended use.`}</p><Link href="/contact" className="button button-primary" style={{ marginTop: 15 }}>Contact BMTECH<ArrowRight size={14} /></Link></div><div className="split-photo"><img src={imageUrls.industrial} alt="Illustrative power systems scene" /><span className="photo-note">Kigali, Rwanda<small>Serving customers across Rwanda</small></span></div></div></section>
    <section className="section section-mist"><div className="container"><SectionHeading eyebrow="OUR PURPOSE" title="Mission & vision" /><div className="category-grid"><article className="form-card"><span className="service-icon"><Target size={20} /></span><h2 className="detail-section-title" style={{ marginTop: 13 }}>Mission</h2><p className="detail-copy">To help homes and businesses explore suitable electrical and power solutions through product guidance and service enquiries.</p></article><article className="form-card"><span className="service-icon"><Compass size={20} /></span><h2 className="detail-section-title" style={{ marginTop: 13 }}>Vision</h2><p className="detail-copy">To be a trusted source for practical power equipment and electrical support across Rwanda.</p></article><article className="form-card"><span className="service-icon"><MapPin size={20} /></span><h2 className="detail-section-title" style={{ marginTop: 13 }}>Our coverage</h2><p className="detail-copy">Based in Kigali and welcoming service enquiries from customers across Rwanda. Availability is confirmed case by case.</p></article></div></div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow="OUR VALUES" title="How we approach the work" description="A clear, safety-conscious approach helps customers understand their options." /><div className="service-grid">{values.map(({ icon: Icon, title, body }) => <article className="service-card" key={title}><span className="service-icon"><Icon size={19} /></span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
  </main>;
}
