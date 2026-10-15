"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { faqItems } from "@/lib/data";
import { useStore } from "@/app/providers";

export function FAQ({ limit }: { limit?: number }) {
  const [active, setActive] = useState<number | null>(0);
  const { language } = useStore();
  const items = limit ? faqItems.slice(0, limit) : faqItems;
  const frQuestions = ["Comment choisir un groupe électrogène adapté ?", "BMTECH peut-il installer un groupe ou un inverseur ?", "La livraison des produits est-elle gratuite ?", "Puis-je retirer ma commande ?", "Comment effectuer le paiement ?", "La demande de rendez-vous confirme-t-elle la réservation ?"];
  const frAnswers = ["Indiquez les appareils à alimenter, leur puissance de démarrage et l'usage prévu. BMTECH pourra étudier vos besoins et vous orienter.", "Les demandes d'installation sont les bienvenues. Une évaluation peut être nécessaire selon le site et l'équipement.", "Le catalogue de démonstration affiche la livraison comme gratuite. Veuillez confirmer les modalités directement auprès de BMTECH.", "Le retrait peut être sélectionné dans le formulaire de démonstration. Confirmez les modalités auprès de BMTECH.", "Ce site de démonstration ne traite aucun paiement. BMTECH communique les instructions manuellement par WhatsApp après étude.", "Non. Le formulaire illustre une demande. Le rendez-vous n'est confirmé qu'après confirmation par BMTECH."];
  return <div className="faq-list">{items.map((item, i) => <div key={item.q} className="faq-item"><button className="faq-question" aria-expanded={active === i} aria-controls={`faq-panel-${i}`} onClick={() => setActive(active === i ? null : i)}><span>{language === "fr" ? frQuestions[i] ?? item.q : item.q}</span><Plus size={16} /></button>{active === i && <div id={`faq-panel-${i}`} className="faq-answer">{language === "fr" ? frAnswers[i] ?? item.a : item.a}</div>}</div>)}</div>;
}
