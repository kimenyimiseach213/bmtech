import type { Product, ProductImage } from "@/types";

export const phoneDisplay = "0788494513";
export const whatsappNumber = "250788494513";

export const imageUrls = {
  logo: "/images/branding/bmtech-logo.png",
  generator: "/images/branding/bmtech-hero.png",
  engineer: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=85",
  technician: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=85",
  panel: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1000&q=85",
  inverter: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=85",
  solar: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1000&q=85",
  industrial: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1200&q=85",
};

export const changeoverImages: ProductImage[] = [
  { src: "/images/products/changeover-switches/changeover-01-control-panel.jpeg", alt: "Enclosed changeover control panel with indicator lights" },
  { src: "/images/products/changeover-switches/changeover-02-open-automatic-cabinet.jpeg", alt: "Open changeover cabinet showing internal components" },
  { src: "/images/products/changeover-switches/changeover-03-transfer-switch-cabinet.jpeg", alt: "Transfer switch mounted inside an electrical cabinet" },
  { src: "/images/products/changeover-switches/changeover-04-open-switch-enclosure.jpeg", alt: "Open electrical enclosure with a changeover switch" },
  { src: "/images/products/changeover-switches/changeover-05-four-pole-switch.jpeg", alt: "Four-pole changeover switch assembly" },
  { src: "/images/products/changeover-switches/changeover-06-control-panel.jpeg", alt: "Changeover control panel with status indicators and selector" },
  { src: "/images/products/changeover-switches/changeover-07-rotary-selector.jpeg", alt: "Rotary selector switch for switching between positions" },
  { src: "/images/products/changeover-switches/changeover-08-manual-switch-assembly.jpeg", alt: "Manual changeover switch assembly" },
  { src: "/images/products/changeover-switches/changeover-09-open-manual-switch.jpeg", alt: "Open enclosure showing a manual changeover mechanism" },
  { src: "/images/products/changeover-switches/changeover-10-modular-switch.jpeg", alt: "Modular multi-pole changeover switch" },
];

export const generatorImages: ProductImage[] = [
  { src: "/images/products/generators/generator-01-enclosed-turquoise.jpeg", alt: "Enclosed turquoise generator" },
  { src: "/images/products/generators/generator-02-portable-yellow.jpeg", alt: "Portable yellow generator" },
  { src: "/images/products/generators/generator-03-open-frame-black.jpeg", alt: "Open-frame black generator" },
  { src: "/images/products/generators/generator-04-open-frame-yellow.jpeg", alt: "Open-frame yellow generator" },
  { src: "/images/products/generators/generator-05-open-frame-red.jpeg", alt: "Open-frame red generator" },
  { src: "/images/products/generators/generator-06-enclosed-white.jpeg", alt: "Enclosed white generator" },
  { src: "/images/products/generators/generator-07-enclosed-yellow.jpeg", alt: "Enclosed yellow generator" },
  { src: "/images/products/generators/generator-08-enclosed-white-large.jpeg", alt: "Large enclosed white generator" },
];

export const serviceImages: ProductImage[] = [
  { src: "/images/services/changeover-installation/service-01-industrial-repair.png", alt: "Technician repairing industrial equipment" },
  { src: "/images/services/changeover-installation/service-02-switch-installation.jpeg", alt: "Technician working on an electrical installation" },
  { src: "/images/services/changeover-installation/service-03-generator-service.jpeg", alt: "Technician servicing a generator" },
  { src: "/images/services/changeover-installation/service-04-electrical-panel.jpeg", alt: "Technician working inside an electrical panel" },
  { src: "/images/services/changeover-installation/service-05-generator-repair.jpeg", alt: "Technicians working on a generator" },
  { src: "/images/services/changeover-installation/service-06-workshop-repair.jpeg", alt: "Technician repairing machinery in a workshop" },
  { src: "/images/services/changeover-installation/service-07-generator-maintenance.jpeg", alt: "Technicians carrying out generator maintenance" },
];

export const categories = [
  { name: "Generators", nameFr: "Groupes électrogènes", image: generatorImages[0].src, images: generatorImages, summary: "Browse generator photos and ask BMTECH to confirm models, ratings, availability and prices." },
  { name: "Changeover Switches", nameFr: "Inverseurs de source", image: changeoverImages[0].src, images: changeoverImages, summary: "Browse switch photos and ask BMTECH to confirm models, ratings, availability and prices." },
  { name: "Inverters & Backup", nameFr: "Onduleurs et secours", image: imageUrls.inverter, images: [{src: imageUrls.inverter, alt: "Inverter and backup power equipment"}], summary: "Battery and inverter systems for essential loads." },
];

export const products: Product[] = [
  {
    slug: "generators-for-sale", name: { en: "Generators for Sale", fr: "Groupes électrogènes à vendre" }, category: "Generators", categoryFr: "Groupes électrogènes", price: null, stock: 0, availability: "Ask BMTECH to confirm models and availability", image: generatorImages[0].src, images: generatorImages,
    description: { en: "Browse the generator photos supplied for this catalogue. Contact BMTECH to confirm the exact model, rating, availability and price before purchase.", fr: "Parcourez les photos de groupes électrogènes fournies pour ce catalogue. Contactez BMTECH pour confirmer le modèle, le calibre, la disponibilité et le prix avant achat." },
    specs: [{ label: "Models", value: "Several generator styles shown; confirm the exact model" }, { label: "Electrical rating", value: "Confirm the rating for the selected generator" }, { label: "Availability and price", value: "Contact BMTECH for current details" }], installation: true, demo: false,
  },
  {
    slug: "changeover-switches", name: { en: "Changeover Switches", fr: "Inverseurs de source" }, category: "Changeover Switches", categoryFr: "Inverseurs de source", price: null, stock: 0, availability: "Ask BMTECH to confirm models and availability", image: changeoverImages[0].src, images: changeoverImages,
    description: { en: "Browse the changeover switch photos supplied for this catalogue. Contact BMTECH to confirm the exact model, electrical rating, availability and price before purchase.", fr: "Parcourez les photos d'inverseurs de source fournies pour ce catalogue. Contactez BMTECH pour confirmer le modèle exact, le calibre, la disponibilité et le prix avant tout achat." },
    specs: [{ label: "Models", value: "Several switch styles shown; confirm the exact model" }, { label: "Electrical rating", value: "Confirm the rating for the selected model" }, { label: "Availability and price", value: "Contact BMTECH for current details" }], installation: true, demo: false,
  },
  {
    slug: "pure-sine-inverter-5kva", name: { en: "Pure Sine Inverter · 5 kVA", fr: "Onduleur sinusoïdal · 5 kVA" }, category: "Inverters & Backup", categoryFr: "Onduleurs et secours", sku: "DEMO-INV-005", model: "BM demo range", condition: "New", price: 1250000, stock: 5, availability: "Available to enquire", image: imageUrls.inverter,
    description: { en: "A sample inverter category product for essential backup loads. Battery requirements depend on the intended runtime and load profile.", fr: "Un produit indicatif pour l'alimentation de secours des charges essentielles. Les batteries nécessaires dépendent de l'autonomie et des charges." },
    specs: [{ label: "Output", value: "5 kVA (demo specification)" }, { label: "Waveform", value: "Pure sine (illustrative)" }, { label: "Battery", value: "Configuration to assess" }], installation: true, demo: true,
  },
  {
    slug: "backup-battery-system", name: { en: "Backup Battery System", fr: "Système de batteries de secours" }, category: "Inverters & Backup", categoryFr: "Onduleurs et secours", sku: "DEMO-BAT-001", model: "Configuration dependent", condition: "New", price: null, stock: 0, availability: "Request availability", image: imageUrls.solar,
    description: { en: "Battery capacity, chemistry and inverter matching should be selected around your expected loads and backup duration.", fr: "La capacité, la technologie et la compatibilité des batteries doivent être définies selon vos charges et l'autonomie souhaitée." },
    specs: [{ label: "Capacity", value: "To be specified" }, { label: "Chemistry", value: "To be specified" }, { label: "Compatibility", value: "Assessment required" }], installation: true, demo: true,
  },
  {
    slug: "distribution-panel", name: { en: "Distribution Panel Assembly", fr: "Tableau de distribution" }, category: "Electrical Equipment", categoryFr: "Équipement électrique", sku: "DEMO-PNL-001", model: "Configuration dependent", condition: "Used", price: 680000, stock: 2, availability: "Condition to confirm", image: imageUrls.technician,
    description: { en: "Illustrative listing for electrical distribution equipment. Used condition and suitability must be inspected and confirmed before supply.", fr: "Exemple de matériel de distribution électrique. L'état et l'adéquation doivent être inspectés et confirmés avant fourniture." },
    specs: [{ label: "Type", value: "Distribution panel" }, { label: "Condition", value: "Used (demo listing)" }, { label: "Suitability", value: "Inspection required" }], installation: true, demo: true,
  },
];

export const services = [
  { title: "Generator installation", titleFr: "Installation de groupes", icon: "Zap", image: serviceImages[1].src, images: [serviceImages[1], serviceImages[6]], description: "Planning, placement and connection for generator installations, subject to a site assessment." },
  { title: "Generator service & repair", titleFr: "Entretien et réparation", icon: "Wrench", image: serviceImages[2].src, images: [serviceImages[0], serviceImages[2], serviceImages[4], serviceImages[5]], description: "Troubleshooting, servicing and repair enquiries for generator equipment." },
  { title: "Changeover installation", titleFr: "Installation d'inverseur", icon: "ArrowLeftRight", image: serviceImages[1].src, images: [serviceImages[1], serviceImages[3]], description: "Switching solutions considered against the supply, generator and connected loads." },
  { title: "Electrical installation", titleFr: "Installation électrique", icon: "Cable", image: serviceImages[3].src, images: [serviceImages[3], serviceImages[1]], description: "Electrical installation support for homes, businesses and selected project needs." },
  { title: "Troubleshooting", titleFr: "Diagnostic", icon: "SearchCheck", image: serviceImages[0].src, images: [serviceImages[0], serviceImages[3]], description: "Share the symptoms and location so the team can review the next practical step." },
  { title: "Preventive maintenance", titleFr: "Maintenance préventive", icon: "Settings2", image: serviceImages[2].src, images: [serviceImages[2], serviceImages[4], serviceImages[6]], description: "Maintenance enquiries to help keep power equipment in working condition." },
];

export const faqItems = [
  { q: "How do I choose the right generator?", a: "Share the appliances or equipment you need to run, their starting loads, and whether the system is for standby or regular use. BMTECH can review the requirements and advise on a suitable option." },
  { q: "Can BMTECH install a generator or changeover switch?", a: "Installation enquiries are welcome. Requirements vary by site, equipment and electrical setup, so a quote or assessment may be needed." },
  { q: "Is product delivery free?", a: "The current demo catalogue shows product delivery as free. Please confirm delivery arrangements and coverage with BMTECH before placing an order." },
  { q: "Can I collect my order?", a: "Collection can be selected in the demo checkout. Please confirm availability and collection arrangements directly with BMTECH." },
  { q: "How are payments made?", a: "This demo does not process payments. Payment instructions are provided manually by BMTECH through WhatsApp after the details are reviewed." },
  { q: "Is a technician booking confirmed when I submit the form?", a: "No. The form demonstrates a request only. A booking is not confirmed until BMTECH confirms the appointment." },
];

export const formatRwf = (amount: number) => new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 }).format(amount) + " RWF";

export const whatsappLink = (message = "Hello BMTECH, I would like to ask about your power solutions.", phone = whatsappNumber) => {
  let normalizedPhone = phone.replace(/\D/g, "");
  if (normalizedPhone.startsWith("0")) normalizedPhone = `250${normalizedPhone.slice(1)}`;
  else if (normalizedPhone.length === 9) normalizedPhone = `250${normalizedPhone}`;
  return `https://wa.me/${normalizedPhone || whatsappNumber}?text=${encodeURIComponent(message)}`;
};
