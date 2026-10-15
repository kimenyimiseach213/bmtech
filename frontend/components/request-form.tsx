"use client";

import { useState } from "react";
import { LocaleLink as Link } from "@/components/locale-link";
import { ArrowRight, CalendarDays, Check, MessageCircle, Paperclip, Send } from "lucide-react";
import type { DemoRequest } from "@/types";
import { useStore } from "@/app/providers";
import { whatsappLink } from "@/lib/data";
import { apiPaths, apiRequest } from "@/lib/api";

type Kind = DemoRequest["kind"];
type Values = Record<string, string>;

const fieldsByKind: Record<Kind, Array<{ name: string; label: string; placeholder?: string; required?: boolean; type?: string; options?: string[]; multiline?: boolean }>> = {
  quote: [
    { name: "name", label: "Full name", placeholder: "Your name", required: true },
    { name: "phone", label: "Phone number", placeholder: "+250 ...", required: true, type: "tel" },
    { name: "email", label: "Email address (optional)", placeholder: "name@example.com", type: "email" },
    { name: "selection", label: "Product or service", placeholder: "What do you need a quote for?", required: true },
    { name: "location", label: "Location in Rwanda", placeholder: "District or town", required: true },
    { name: "contact", label: "Preferred contact method", required: true, options: ["Phone call", "WhatsApp"] },
    { name: "details", label: "Tell us about your requirements", placeholder: "Equipment, capacity, installation needs or other details", required: true, multiline: true },
  ],
  booking: [
    { name: "name", label: "Full name", placeholder: "Your name", required: true },
    { name: "phone", label: "Phone number", placeholder: "+250 ...", required: true, type: "tel" },
    { name: "email", label: "Email address (optional)", placeholder: "name@example.com", type: "email" },
    { name: "service", label: "Service required", required: true, options: ["Generator installation", "Generator servicing or repair", "Changeover switch installation", "Electrical installation", "Troubleshooting", "Preventive maintenance", "Other"] },
    { name: "date", label: "Preferred date", required: true, type: "date" },
    { name: "time", label: "Preferred time", required: true, options: ["Morning", "Midday", "Afternoon"] },
    { name: "location", label: "Location", placeholder: "District, town or directions", required: true },
    { name: "details", label: "Describe the issue or work", placeholder: "Share any useful details", required: true, multiline: true },
  ],
  contact: [
    { name: "name", label: "Name", placeholder: "Your name", required: true },
    { name: "phone", label: "Phone number", placeholder: "+250 ...", required: true, type: "tel" },
    { name: "email", label: "Email address (optional)", placeholder: "name@example.com", type: "email" },
    { name: "message", label: "Message", placeholder: "How can BMTECH help?", required: true, multiline: true },
  ],
  review: [
    { name: "name", label: "Display name", placeholder: "How you would like to be shown", required: true },
    { name: "rating", label: "Your rating", required: true, options: ["5 · Excellent", "4 · Good", "3 · Satisfactory", "2 · Could be better", "1 · Poor"] },
    { name: "experience", label: "Your experience", placeholder: "Tell us about your experience", required: true, multiline: true },
  ],
};

const pageCopy: Record<Kind, { title: string; success: string; intro: string; button: string }> = {
  quote: { title: "Quotation request received", success: "Your request has been recorded. BMTECH can review your requirements and follow up using your contact details.", intro: "Share your product, installation or service requirements. Your request will be sent to BMTECH for review.", button: "Send quote request" },
  booking: { title: "Booking request received", success: "Your request is recorded. A booking is not confirmed until BMTECH confirms the appointment.", intro: "Tell us what service you need and when you would prefer it. BMTECH will review the booking request.", button: "Request a technician" },
  contact: { title: "Message received", success: "Your message has been recorded for BMTECH follow-up.", intro: "Use the form to share a question or enquiry. You can also contact BMTECH by phone or WhatsApp.", button: "Send message" },
  review: { title: "Review submitted for moderation", success: "Thanks for sharing your feedback. Your review is pending moderation and is not published automatically.", intro: "Share your experience. Reviews are sent to BMTECH for moderation before publication.", button: "Submit review" },
};

export function RequestForm({ kind, initialSelection = "" }: { kind: Kind; initialSelection?: string }) {
  const { language, notify, company } = useStore();
  const fr = language === "fr";
  const [values, setValues] = useState<Values>({ selection: initialSelection });
  const [errors, setErrors] = useState<Values>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<DemoRequest | null>(null);
  const [attachment, setAttachment] = useState("");
  const [submitError, setSubmitError] = useState("");
  const config = fieldsByKind[kind];
  const copy = pageCopy[kind];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Values = {};
    config.forEach((field) => {
      const value = values[field.name]?.trim() ?? "";
      if (field.required && !value) nextErrors[field.name] = fr ? "Ce champ est obligatoire." : "This field is required.";
      if (field.type === "email" && value && !/^\S+@\S+\.\S+$/.test(value)) nextErrors[field.name] = fr ? "Saisissez une adresse e-mail valide." : "Enter a valid email address.";
      if (field.type === "tel" && value.replace(/[\s()+-]/g, "").length < 8) nextErrors[field.name] = fr ? "Saisissez un numéro de téléphone valide." : "Enter a valid phone number.";
    });
    if (kind === "booking" && values.date && values.date < new Date().toISOString().slice(0, 10)) nextErrors.date = fr ? "Choisissez une date future." : "Choose a future date.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    setSubmitError("");
    const clientReference = `BM-${{ quote: "Q", booking: "B", contact: "M", review: "R" }[kind]}-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
    const payload: Record<string, unknown> = { ...values, locale: language, clientReference };
    if (kind === "quote") payload.productOrService = values.selection;
    if (kind === "booking") { payload.serviceType = values.service; payload.preferredDate = values.date; payload.preferredTime = values.time; }
    if (kind === "review") { payload.displayName = values.name; payload.rating = Number.parseInt(values.rating?.slice(0, 1) ?? "5", 10); payload.comment = values.experience; }
    const endpoints = { quote: apiPaths.quoteCreate, booking: apiPaths.bookingCreate, contact: apiPaths.contactCreate, review: apiPaths.reviewCreate };
    try {
      const response = await apiRequest<unknown>(endpoints[kind], { method: "POST", body: JSON.stringify(payload) });
      const root = response && typeof response === "object" ? response as Record<string, unknown> : {};
      const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : root;
      const created = data.request && typeof data.request === "object" ? data.request as Record<string, unknown> : data;
      const referenceValue = created.reference ?? created.ref ?? created.code;
      const result: DemoRequest = { kind, ref: typeof referenceValue === "string" && referenceValue ? referenceValue : clientReference, createdAt: new Date().toISOString(), fields: values, status: String(created.status ?? (kind === "review" ? "Pending review" : "Received")) };
      setSubmitted(result);
      notify(fr ? "Demande envoyée à BMTECH" : "Request sent to BMTECH");
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : (fr ? "L’envoi a échoué." : "The request could not be submitted."));
    } finally { setLoading(false); }
  };

  if (submitted) return <div className="form-card form-success">
    <span className="success-icon"><Check size={25} /></span>
    <h2>{fr ? ({ quote: "Demande de devis reçue", booking: "Demande de rendez-vous reçue", contact: "Message reçu", review: "Avis soumis pour modération" } as Record<Kind, string>)[kind] : copy.title}</h2>
    <p>{fr ? "Votre demande a été enregistrée et sera examinée par BMTECH." : copy.success}</p>
    <div className="reference-box">{fr ? "Référence" : "Reference"}: {submitted.ref}</div>
    <p className="admin-submitted-status">{fr ? "Statut" : "Status"}: {submitted.status}</p>
    {kind === "booking" && <p>{fr ? "Le rendez-vous reste en attente jusqu’à sa confirmation par BMTECH." : "The booking remains pending until BMTECH confirms it."}</p>}
    {kind === "review" && <p>{fr ? "Votre avis reste en attente de modération." : "Your review remains pending moderation."}</p>}
    <div className="form-actions" style={{ justifyContent: "center" }}>
      <a href={whatsappLink(`Hello BMTECH, I submitted request ${submitted.ref} and would like to follow up.`, company.whatsapp)} target="_blank" rel="noreferrer" className="button button-primary"><MessageCircle size={15} />{fr ? "Contacter BMTECH sur WhatsApp" : "Contact BMTECH on WhatsApp"}</a>
      <Link href="/" className="button button-outline">{fr ? "Accueil" : "Back to Home"}</Link>
    </div>
  </div>;

  const fieldLabelFr: Record<string,string> = { "Full name":"Nom complet", "Phone number":"Téléphone", "Email address (optional)":"E-mail (facultatif)", "Product or service":"Produit ou service", "Location in Rwanda":"Lieu au Rwanda", "Preferred contact method":"Moyen de contact préféré", "Tell us about your requirements":"Décrivez vos besoins", "Service required":"Service demandé", "Preferred date":"Date souhaitée", "Preferred time":"Heure souhaitée", "Location":"Lieu", "Describe the issue or work":"Décrivez le problème ou le travail", "Name":"Nom", "Message":"Message", "Display name":"Nom affiché", "Your rating":"Votre note", "Your experience":"Votre expérience" };
  const optionFr = (option: string) => ({ "Phone call":"Appel téléphonique", WhatsApp:"WhatsApp", "Generator installation":"Installation de groupe électrogène", "Generator servicing or repair":"Entretien ou réparation de groupe", "Changeover switch installation":"Installation d'inverseur", "Electrical installation":"Installation électrique", Troubleshooting:"Diagnostic", "Preventive maintenance":"Maintenance préventive", Other:"Autre", "5 · Excellent":"5 · Excellent", "4 · Good":"4 · Bien", "3 · Satisfactory":"3 · Satisfaisant", "2 · Could be better":"2 · À améliorer", "1 · Poor":"1 · Insatisfaisant" } as Record<string,string>)[option] || option;

  const formIntroFr: Record<Kind, string> = {
    quote: "Décrivez vos besoins en équipement ou en service. BMTECH examinera votre demande.",
    booking: "Indiquez le service et vos disponibilités. BMTECH examinera la demande de rendez-vous.",
    contact: "Écrivez à BMTECH. Votre message sera envoyé pour suivi.",
    review: "Partagez votre expérience. Les avis sont modérés avant publication.",
  };

  return <form className="form-card" onSubmit={submit} noValidate>
    <p className="form-note" style={{ marginTop: 0 }}>{fr ? formIntroFr[kind] : copy.intro}</p>
    {submitError && <div className="admin-alert admin-alert-error" role="alert">{submitError}</div>}
    <div className="form-grid">
      {config.map((field) => <div className={`form-field ${field.multiline || field.name === "selection" ? "full" : ""}`} key={field.name}>
        <label htmlFor={`${kind}-${field.name}`}>{fr ? fieldLabelFr[field.label] || field.label : field.label}{field.required && <span style={{ color: "#dc2626" }}> *</span>}</label>
        {field.options ? <select id={`${kind}-${field.name}`} value={values[field.name] || ""} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}>
          <option value="">{fr ? "Sélectionner" : "Select an option"}</option>{field.options.map((option) => <option key={option} value={option}>{fr ? optionFr(option) : option}</option>)}
        </select> : field.multiline ? <textarea id={`${kind}-${field.name}`} value={values[field.name] || ""} placeholder={fr ? "Ajoutez des informations utiles" : field.placeholder} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} /> : <input id={`${kind}-${field.name}`} type={field.type || "text"} value={values[field.name] || ""} placeholder={field.placeholder} min={field.type === "date" ? new Date().toISOString().slice(0, 10) : undefined} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />}
        {errors[field.name] && <span className="field-error" role="alert">{errors[field.name]}</span>}
      </div>)}
    </div>
    {kind === "quote" && <div className="form-field" style={{ marginTop: 14 }}><label htmlFor="quote-file">Optional attachment</label><input id="quote-file" type="file" accept="image/*,.pdf" onChange={(event) => setAttachment(event.target.files?.[0]?.name || "")} /><span className="field-hint">{attachment ? `${attachment} · ` : ""}The current quotation API does not accept file uploads.</span></div>}
    {kind === "review" && <div className="demo-banner" style={{ marginTop: 14 }}><CalendarDays size={14} /> Your review will be held for moderation.</div>}
    {kind === "contact" && <p className="form-note">Submitting sends your message to BMTECH for follow-up.</p>}
    {kind === "booking" && <p className="form-note">Your booking is a request; BMTECH must confirm the appointment.</p>}
    <div className="form-actions"><button className="button button-primary" type="submit" disabled={loading}>{loading ? (fr ? "Envoi…" : "Submitting…") : <>{fr ? "Envoyer la demande" : copy.button}<Send size={14} /></>}</button>{kind !== "review" && <a href={whatsappLink(undefined, company.whatsapp)} target="_blank" rel="noreferrer" className="button button-outline"><MessageCircle size={14} />{fr ? "WhatsApp" : "Ask on WhatsApp"}</a>}</div>
  </form>;
}
