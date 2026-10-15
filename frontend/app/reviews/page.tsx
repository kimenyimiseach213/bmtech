import { Star } from "lucide-react";
import { PageHero, Breadcrumbs } from "@/components/ui";
import { RequestForm } from "@/components/request-form";

export default function ReviewsPage() {
  return <main><PageHero eyebrow="CUSTOMER FEEDBACK" title="Reviews & experiences" description="BMTECH has not supplied verified review data for this preview. All sample feedback remains clearly labelled as a demo."/><div className="container page-content"><Breadcrumbs items={[{label:"Reviews"}]}/><div className="checkout-layout" style={{maxWidth:990,margin:"0 auto"}}><section><div className="form-card" style={{textAlign:"center"}}><div className="demo-banner" style={{justifyContent:"center"}}>Demo state · No verified reviews supplied</div><div className="stars" style={{marginTop:17}}><Star size={18}/><Star size={18}/><Star size={18}/><Star size={18}/><Star size={18}/></div><h2 style={{color:"var(--navy)",fontSize:21,margin:"7px 0"}}>No verified rating yet</h2><p className="detail-copy" style={{margin:"0 auto"}}>A rating summary will appear when BMTECH provides genuine customer reviews and permission to publish them.</p></div><div style={{marginTop:15}} className="demo-banner"><Star size={14}/> Demo reviews submitted here remain pending moderation and do not become public automatically.</div></section><RequestForm kind="review"/></div></div></main>;
}
