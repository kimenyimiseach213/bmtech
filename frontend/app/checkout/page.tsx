"use client";

import { LocaleLink as Link } from "@/components/locale-link";
import { useState } from "react";
import { ArrowRight, Check, ClipboardList, MapPin, MessageCircle, PackageCheck, Truck } from "lucide-react";
import { useStore } from "@/app/providers";
import { formatRwf, whatsappLink as buildWhatsappLink } from "@/lib/data";
import { apiPaths, apiRequest } from "@/lib/api";
import { Breadcrumbs, EmptyState } from "@/components/ui";

type Order = { reference:string; name:string; phone:string; fulfillment:string; address:string; notes:string; total:number|null; whatsappUrl:string; lines:Array<{name:string;sku:string;quantity:number;price:number}> };

export default function CheckoutPage() {
  const { cart, clear, language, products, company } = useStore();
  const whatsappLink = (message?: string) => buildWhatsappLink(message, company.whatsapp);
  const fr = language === "fr";
  const [fulfillment,setFulfillment] = useState("delivery");
  const [values,setValues] = useState({name:"",phone:"",email:"",address:"",notes:""});
  const [errors,setErrors] = useState<Record<string,string>>({});
  const [order,setOrder] = useState<Order|null>(null);
  const [loading,setLoading] = useState(false);
  const [submitError,setSubmitError] = useState("");
  const lines = cart.map((line)=>({ ...line, product:products.find((p)=>p.slug===line.slug) })).filter((line)=>line.product && line.product.price !== null && line.product.stock > 0);
  const subtotal = lines.reduce((sum,line)=>sum+(line.product?.price||0)*line.quantity,0);
  const update = (key:string,value:string) => setValues((previous)=>({...previous,[key]:value}));

  const submit = async (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next:Record<string,string>={};
    if(!values.name.trim())next.name=fr?"Ce champ est obligatoire.":"This field is required.";
    if(values.phone.replace(/[\s()+-]/g,"").length<8)next.phone=fr?"Saisissez un numéro valide.":"Enter a valid phone number.";
    if(fulfillment==="delivery"&&!values.address.trim())next.address=fr?"Saisissez votre adresse de livraison.":"Enter a delivery address.";
    setErrors(next);
    if(Object.keys(next).length)return;
    const clientReference = `BM-O-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
    setLoading(true); setSubmitError("");
    try {
      const response = await apiRequest<unknown>(apiPaths.orderCreate, { method: "POST", body: JSON.stringify({
        clientReference,
        customer: { name: values.name.trim(), phone: values.phone.trim(), email: values.email.trim() || undefined },
        fulfillment: { method: fulfillment, address: fulfillment === "delivery" ? values.address.trim() : undefined },
        items: lines.map(({ slug, quantity }) => ({ productSlug: slug, quantity })),
        notes: values.notes.trim() || undefined,
        locale: language,
      }) });
      const root = response && typeof response === "object" ? response as Record<string, unknown> : {};
      const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : root;
      const serverOrder = data.order && typeof data.order === "object" ? data.order as Record<string, unknown> : data;
      const pricing = serverOrder.calculation && typeof serverOrder.calculation === "object" ? serverOrder.calculation as Record<string, unknown> : {};
      const amount = serverOrder.total ?? serverOrder.totalAmount ?? serverOrder.grandTotal ?? pricing.total;
      const total = amount === undefined || amount === null || !Number.isFinite(Number(amount)) ? null : Number(amount);
      const serverReference = serverOrder.reference ?? serverOrder.orderReference ?? serverOrder.orderNumber ?? serverOrder.code;
      const reference = typeof serverReference === "string" && serverReference ? serverReference : clientReference;
      const confirmationText = `Hello BMTECH, I have placed order ${reference}. Please confirm the order and payment next steps.`;
      const backendWhatsApp = data.whatsappConfirmationUrl ?? data.whatsappUrl ?? serverOrder.whatsappConfirmationUrl ?? serverOrder.whatsappUrl;
      const snapshotRows = Array.isArray(serverOrder.items) ? serverOrder.items : Array.isArray(serverOrder.lines) ? serverOrder.lines : [];
      const displayLines = snapshotRows.length ? snapshotRows.map((entry, index) => {
        const row = entry && typeof entry === "object" ? entry as Record<string, unknown> : {};
        const productSnapshot = row.product && typeof row.product === "object" ? row.product as Record<string, unknown> : {};
        const local = lines[index]?.product;
        return {
          name: String(row.productName ?? row.name ?? productSnapshot.nameEn ?? local?.name[language] ?? local?.name.en ?? "Product"),
          sku: String(row.sku ?? productSnapshot.sku ?? local?.sku ?? local?.slug ?? index),
          quantity: Number(row.quantity ?? 1),
          price: Number(row.unitPrice ?? row.price ?? local?.price ?? 0),
        };
      }) : lines.map(({ quantity, product }) => ({ name: product!.name[language] || product!.name.en, sku: product!.sku ?? product!.slug, quantity, price: product!.price! }));
      const prepared:Order={reference,name:values.name,phone:values.phone,fulfillment,address:values.address,notes:values.notes,total,whatsappUrl:typeof backendWhatsApp === "string" ? backendWhatsApp : whatsappLink(confirmationText),lines:displayLines};
      setOrder(prepared); clear();
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : (fr ? "La commande n’a pas pu être envoyée." : "The order could not be submitted."));
    } finally { setLoading(false); }
  };

  if (order) return <main className="container page-content">
    <Breadcrumbs items={[{ label: "Checkout", href: "/checkout" }, { label: "Order submitted" }]} />
    <div className="form-card form-success" style={{ maxWidth: 760, margin: "20px auto" }}>
      <span className="success-icon"><PackageCheck size={25} /></span>
      <div className="admin-submitted-status">Order request recorded by the BMTECH API</div>
      <h2>{fr ? "Demande de commande envoyée" : "Order request received"}</h2>
      <p>{fr ? "Le serveur a enregistré votre demande. BMTECH confirmera les articles et les prochaines étapes." : "The server recorded your order request. BMTECH will confirm the items and next steps."}</p>
      <div className="reference-box">{order.reference}</div>
      <div className="cart-summary" style={{ textAlign: "left", maxWidth: 470, margin: "0 auto 18px" }}>
        <h2>{fr ? "Résumé de la commande" : "Order summary"}</h2>
        {order.lines.map((line) => <div className="summary-line" key={line.sku}><span>{line.name} × {line.quantity}</span><strong>{formatRwf(line.price * line.quantity)}</strong></div>)}
        <div className="summary-line summary-total"><span>{fr ? "Total calculé par le serveur" : "Server-calculated total"}</span><strong>{order.total === null ? (fr ? "À confirmer" : "To be confirmed") : formatRwf(order.total)}</strong></div>
        <div className="summary-line"><span>{fr ? "Livraison" : "Fulfillment"}</span><strong>{order.fulfillment === "delivery" ? (fr ? "Demande de livraison" : "Delivery request") : (fr ? "Retrait" : "Collection request")}</strong></div>
      </div>
      <div className="payment-notice">{fr ? "Aucun paiement en ligne n’est traité sur ce site. Les modalités sont confirmées directement avec BMTECH." : "No online payment is processed here. Payment arrangements are confirmed directly with BMTECH."}</div>
      <p>{fr ? "WhatsApp s’ouvrira avec un message prérempli; l’envoi du message reste à votre initiative." : "WhatsApp opens with a prepared message; sending it is up to you."}</p>
      <div className="form-actions" style={{ justifyContent: "center" }}><a href={order.whatsappUrl} target="_blank" rel="noreferrer" className="button button-primary"><MessageCircle size={15} />{fr ? "Confirmer sur WhatsApp" : "Continue on WhatsApp"}</a><Link href="/products" className="button button-outline">{fr ? "Continuer les achats" : "Continue shopping"}</Link></div>
    </div>
  </main>;

  return <main className="container page-content"><Breadcrumbs items={[{label:fr?"Panier":"Cart",href:"/cart"},{label:"Checkout"}]}/><div className="section-heading"><span className="eyebrow">{fr?"COMMANDE INVITÉ":"GUEST CHECKOUT"}</span><div className="section-heading-row"><div><h2>{fr?"Vos informations de commande":"Complete your order request"}</h2><p>Guest checkout · No online payment is collected.</p></div></div></div>{lines.length===0?<EmptyState icon={ClipboardList} title={fr?"Votre panier est vide":"No eligible items in your cart"} description="Only published fixed-price products with available stock can be checked out. Request a quote for other products." action={{label:"Browse products",href:"/products"}}/>:<div className="checkout-layout"><form className="form-card" noValidate onSubmit={submit}><section className="checkout-section"><h2><span className="step-number">1</span>{fr?"Informations client":"Customer information"}</h2><div className="form-grid"><div className="form-field"><label htmlFor="name">Full name *</label><input id="name" value={values.name} onChange={(e)=>update("name",e.target.value)} autoComplete="name"/>{errors.name&&<span className="field-error">{errors.name}</span>}</div><div className="form-field"><label htmlFor="phone">Phone number *</label><input id="phone" type="tel" value={values.phone} onChange={(e)=>update("phone",e.target.value)} autoComplete="tel"/>{errors.phone&&<span className="field-error">{errors.phone}</span>}</div><div className="form-field full"><label htmlFor="email">Email address (optional)</label><input id="email" type="email" value={values.email} onChange={(e)=>update("email",e.target.value)} autoComplete="email"/></div></div></section><section className="checkout-section"><h2><span className="step-number">2</span>{fr?"Livraison ou retrait":"Fulfillment"}</h2><label className="radio-card"><input type="radio" checked={fulfillment==="delivery"} onChange={()=>setFulfillment("delivery")}/><span><b>Delivery request</b>Delivery price and arrangements must be confirmed directly with BMTECH.</span></label><label className="radio-card"><input type="radio" checked={fulfillment==="collection"} onChange={()=>setFulfillment("collection")}/><span><b>Collection request</b>Collection location and arrangements need to be confirmed with BMTECH.</span></label>{fulfillment==="delivery"&&<div className="form-field" style={{marginTop:12}}><label htmlFor="address">Delivery address *</label><textarea id="address" value={values.address} onChange={(e)=>update("address",e.target.value)} placeholder="District, town and directions" autoComplete="street-address"/>{errors.address&&<span className="field-error">{errors.address}</span>}</div>}<div className="form-field" style={{marginTop:12}}><label htmlFor="notes">Order notes (optional)</label><textarea id="notes" value={values.notes} onChange={(e)=>update("notes",e.target.value)} placeholder="Anything else BMTECH should know?"/></div></section>{submitError && <div className="admin-alert admin-alert-error" role="alert">{submitError}</div>}<div className="payment-notice">The order API calculates the amount and records the guest order. No online payment is processed on this website.</div><button className="button button-primary" type="submit" disabled={loading}>{loading?"Submitting…":fr?"Soumettre la demande":"Place order request"}<ArrowRight size={15}/></button></form><aside className="cart-summary"><h2>{fr?"Résumé de la commande":"Order summary"}</h2>{lines.map(({slug,quantity,product})=>product&&<div className="summary-line" key={slug}><span>{product.name[language]||product.name.en} × {quantity}</span><strong>{formatRwf((product.price||0)*quantity)}</strong></div>)}<div className="summary-line"><span>Subtotal</span><strong>{formatRwf(subtotal)}</strong></div><div className="summary-line"><span>Delivery</span><strong style={{color:"#218051"}}>Confirm with BMTECH</strong></div><div className="summary-line summary-total"><span>Indicative total</span><strong>{formatRwf(subtotal)}</strong></div><div className="delivery-note"><Truck size={14}/>Delivery terms must be confirmed with BMTECH.</div><Link href="/cart" className="text-link"><MapPin size={14}/>Return to cart</Link></aside></div>}</main>;
}
