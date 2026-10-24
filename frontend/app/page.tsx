"use client";

import { LocaleLink as Link } from "@/components/locale-link";
import { ArrowRight, ArrowUpRight, BatteryCharging, Check, ClipboardCheck, Cog, Headphones, ShieldCheck, Truck, Wrench, Zap } from "lucide-react";
import { useStore } from "@/app/providers";
import { imageUrls, services, whatsappLink } from "@/lib/data";
import { FeatureItem, SectionHeading } from "@/components/ui";
import { ProductGrid } from "@/components/products";
import { PhotoCycler } from "@/components/photo-cycler";
import { UndersaleSection } from "@/components/undersale-section";
import { equipmentCategories, isPowerEquipment } from "@/lib/catalog";
import { FAQ } from "@/components/faq";

export default function HomePage() {
  const { language, products, categories, catalogError, catalogLoading, company } = useStore();
  const fr = language === "fr";
  const featuredProducts = products.filter(isPowerEquipment).slice(0, 4);
  const powerCategories = equipmentCategories(categories);
  return <main className="home-page">
    <section className="hero hero-showcase">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="brand-hero">
            <div className="brand-hero-mark"><Cog size={74} /></div>
            <div className="brand-hero-copy">
              <span className="brand-hero-title">BM <span>TECH</span></span>
              <span className="brand-hero-sub">LIMITED</span>
              <span className="brand-hero-tag">FAST AND FINE</span>
            </div>
          </div>

          <h1>POWER SOLUTIONS</h1>
          <p className="hero-kicker">FOR A BETTER TOMORROW</p>
          <p className="hero-description">Sales, Installation, Repair and Maintenance of Generators, Changeover Switches and Electrical Equipment.</p>

          <div className="hero-feature-chips">
            <span><BatteryCharging size={17} />Generators</span>
            <span><Wrench size={17} />Electrical services</span>
            <span><Zap size={17} />Changeover Switches</span>
          </div>

          <div className="hero-actions">
            <Link href="/products" className="button button-primary hero-button-primary">Explore Our Products<ArrowRight size={15} /></Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-wrap">
            <img className="hero-image" src={imageUrls.generator} alt="Industrial power equipment and generators" />
          </div>
          <div className="hero-floating-card hero-floating-card-top">
            <span className="hero-card-icon"><BatteryCharging size={18} /></span>
            <div><strong>Power backup ready</strong><small>Commercial & residential</small></div>
          </div>
          <div className="hero-floating-card hero-floating-card-bottom">
            <span className="hero-card-icon"><Zap size={18} /></span>
            <div><strong>Switch & backup</strong><small>Installation support</small></div>
          </div>
        </div>
      </div>
    </section>

    <section className="trust-strip"><div className="container trust-grid"><FeatureItem icon={ShieldCheck} title={fr ? "Équipement de qualité" : "Quality Power Equipment"} text={fr ? "Des options pour chaque besoin" : "Options for different needs"}/><FeatureItem icon={Wrench} title={fr ? "Installation professionnelle" : "Professional Installation"} text={fr ? "Évaluation selon le site" : "Site requirements considered"}/><FeatureItem icon={Cog} title={fr ? "Maintenance fiable" : "Reliable Maintenance"} text={fr ? "Support technique" : "Technical support enquiries"}/><FeatureItem icon={Truck} title={fr ? "Livraison gratuite*" : "Free Product Delivery*"} text={fr ? "À confirmer auprès de BMTECH" : "Confirm arrangements with BMTECH"}/></div></section>

    <section className="section"><div className="container"><SectionHeading eyebrow={fr ? "NOS CATÉGORIES" : "POWER EQUIPMENT"} title={fr ? "Trouvez la bonne solution" : "Explore Our Equipment Categories"} description={fr ? "Parcourez les équipements de production, de commutation et d'alimentation de secours." : "Browse generation, switching and backup power equipment for residential and commercial needs."} link={{ label: fr ? "Tous les produits" : "View all products", href: "/products" }}/><div className="category-grid">{powerCategories.map((category, i) => <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="category-card" key={category.name}><PhotoCycler className="category-photo-cycler" images={category.images} fit="cover" interval={4200}/><div className="category-card-content"><span>0{i+1} · EQUIPMENT</span><h3>{fr ? category.nameFr : category.name}</h3><p>{category.summary}</p><span className="text-link">{fr ? "Explorer la catégorie" : "Explore category"}<ArrowRight size={14}/></span></div></Link>)}</div></div></section>

    <section className="section section-mist"><div className="container"><SectionHeading eyebrow={fr ? "SÉLECTION" : "SELECTED PRODUCTS"} title={fr ? "Équipements présentés" : "Featured Power Equipment"} description={fr ? "Parcourez les équipements BMTECH publiés. Confirmez le prix, les caractéristiques et la disponibilité avant commande." : "Browse BMTECH’s published equipment. Confirm pricing, specifications, and availability before placing an order."} link={{ label: fr ? "Parcourir le catalogue" : "Browse catalogue", href: "/products" }}/><ProductGrid items={featuredProducts} variant="equipment"/>{catalogLoading && <p className="catalog-live-note">{fr ? "Chargement du catalogue publié…" : "Loading the published catalogue…"}</p>}{catalogError && <p className="catalog-live-note">{fr ? "Le catalogue de prévisualisation est affiché car l’API du catalogue n’est pas disponible." : "The live equipment catalog could not be loaded. Please try again."}</p>}{(catalogError || catalogLoading) && <p className="catalog-disclaimer">{fr ? "Les prix et les détails de ces exemples ne constituent pas un devis BMTECH." : "Contact BMTech to confirm equipment requirements and availability."}</p>}</div></section>

    <UndersaleSection/>

    <section className="section"><div className="container"><SectionHeading eyebrow={fr ? "SERVICES" : "HOW WE CAN HELP"} title={fr ? "Un soutien au-delà des produits" : "Support beyond the equipment"} description={fr ? "Des demandes d'installation et de maintenance peuvent être soumises pour étude." : "Send an enquiry about installation, servicing and electrical work for review."} link={{ label: fr ? "Voir les services" : "Explore services", href: "/services" }}/><div className="service-grid">{services.slice(0, 6).map((service, i) => {const icons=[Zap,Wrench,BatteryCharging,ClipboardCheck,Headphones,Cog];const Icon=icons[i];return <article className="service-card" key={service.title}><span className="service-icon"><Icon size={19}/></span><h3>{fr ? service.titleFr : service.title}</h3><p>{service.description}</p><Link className="text-link" href="/services">{fr ? "En savoir plus" : "Learn more"}<ArrowRight size={13}/></Link></article>;})}</div></div></section>

    <section className="section section-mist"><div className="container split-section"><div className="split-photo"><img src={imageUrls.engineer} alt="Illustrative photo of an electrical engineer at work"/><span className="photo-note">Power needs are different.<small>Let's discuss your application.</small></span></div><div><span className="eyebrow">{fr ? "POURQUOI BMTECH" : "WHY BMTECH"}</span><h2 style={{fontSize:"clamp(29px,3vw,39px)",lineHeight:1.15,letterSpacing:"-.045em",color:"var(--navy)",margin:"12px 0"}}>{fr ? "Des solutions pensées pour votre environnement." : "Power support built around your environment."}</h2><p style={{color:"var(--slate)",fontSize:12,lineHeight:1.8,margin:0}}>BMTECH helps customers explore equipment and service options for their power requirements across Rwanda. Every installation and product selection depends on the site and intended use.</p><div className="benefit-list"><div className="benefit"><span className="benefit-check"><Check size={14}/></span><div><h3>Options for homes and businesses</h3><p>Explore equipment suited to the loads and usage you have in mind.</p></div></div><div className="benefit"><span className="benefit-check"><Check size={14}/></span><div><h3>Installation and maintenance enquiries</h3><p>Share a few details so the requirements can be reviewed.</p></div></div><div className="benefit"><span className="benefit-check"><Check size={14}/></span><div><h3>Service coverage across Rwanda</h3><p>Location details help BMTECH assess the right next step.</p></div></div></div><Link className="button button-primary" href="/about">{fr ? "En savoir plus" : "Learn more about BMTECH"}<ArrowRight size={15}/></Link></div></div></section>

    <section className="section"><div className="container"><SectionHeading eyebrow={fr ? "PROJETS" : "PROJECT GALLERY"} title={fr ? "Aperçu d'installations" : "Explore power in practice"} description={fr ? "Images illustratives pour la présentation. Aucun projet réel BMTECH n'est revendiqué." : "Illustrative imagery for the demo. These are not represented as verified BMTECH projects."} link={{ label: fr ? "Voir la galerie" : "View the gallery", href: "/projects" }}/><div className="project-grid">{[
      { image: imageUrls.industrial, alt: "Illustrative industrial electrical installation", category: "Illustrative example · Commercial power", title: "Standby power planning" },
      { image: imageUrls.panel, alt: "Illustrative electrical panel", category: "Illustrative example · Switching", title: "Power changeover" },
      { image: imageUrls.solar, alt: "Illustrative backup system", category: "Illustrative example · Backup", title: "Backup system options" },
      { image: imageUrls.technician, alt: "Illustrative electrical service", category: "Illustrative example · Maintenance", title: "Service and maintenance" },
      { image: imageUrls.inverter, alt: "Illustrative electrical equipment", category: "Illustrative example · Power", title: "Equipment selection" },
    ].map((project) => <article className="project-tile" key={project.title}><img src={project.image} alt={project.alt} loading="lazy"/><div className="project-tile-copy"><small>{project.category}</small><h3>{project.title}</h3></div></article>)}</div></div></section>

    <section className="cta-band"><div className="container cta-content"><div><h2>Need a reliable power solution?</h2><p>Tell BMTECH about your requirements and location across Rwanda.</p></div><div className="cta-actions"><Link href="/contact" className="button button-white">Contact BMTECH<ArrowRight size={14}/></Link><Link href="/quote" className="button button-outline" style={{borderColor:"rgba(255,255,255,.35)",background:"transparent",color:"white"}}>Request a Quote</Link><a href={whatsappLink(undefined, company.whatsapp)} target="_blank" rel="noreferrer" className="button button-outline" style={{borderColor:"rgba(255,255,255,.35)",background:"transparent",color:"white"}}>WhatsApp</a></div></div></section>

    <section className="section"><div className="container"><SectionHeading eyebrow="FAQ" title="A few helpful answers" description="Explore common questions about products, installation and demo requests." align="center"/><FAQ limit={4}/><div style={{textAlign:"center",marginTop:23}}><Link href="/faq" className="text-link">View all questions<ArrowRight size={14}/></Link></div></div></section>
  </main>;
}
