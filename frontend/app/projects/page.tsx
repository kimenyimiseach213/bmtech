"use client";

import { useMemo, useState } from "react";
import { X, MapPin, Image as ImageIcon } from "lucide-react";
import { PageHero, Breadcrumbs } from "@/components/ui";
import { imageUrls } from "@/lib/data";

const projects = [
  { title:"Standby power planning", category:"Generators", location:"Illustrative · Rwanda", image:imageUrls.generator, text:"An illustrative scene for a generator installation enquiry. It does not document a verified BMTECH project." },
  { title:"Electrical distribution", category:"Electrical", location:"Illustrative · Rwanda", image:imageUrls.panel, text:"An illustrative electrical panel image used to preview the project gallery layout." },
  { title:"Backup energy options", category:"Backup power", location:"Illustrative · Rwanda", image:imageUrls.solar, text:"Illustrative backup energy image. Equipment and output have not been verified." },
  { title:"Technician at work", category:"Electrical", location:"Illustrative · Kigali", image:imageUrls.technician, text:"An illustrative technician photo used for this design preview." },
  { title:"Industrial power systems", category:"Generators", location:"Illustrative · Rwanda", image:imageUrls.industrial, text:"An illustrative industrial image, not a confirmed BMTECH installation." },
  { title:"Power equipment detail", category:"Backup power", location:"Illustrative · Rwanda", image:imageUrls.inverter, text:"An illustrative power systems photograph for the gallery preview." },
  { title:"Engineering work", category:"Electrical", location:"Illustrative · Rwanda", image:imageUrls.engineer, text:"An illustrative engineering image, not a customer project record." },
];
const filters = ["All", "Generators", "Electrical", "Backup power"];

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);
  const filtered = useMemo(()=>filter === "All" ? projects : projects.filter((item)=>item.category === filter),[filter]);
  return <main><PageHero eyebrow="PROJECT GALLERY" title="Power systems in practice" description="A gallery layout preview using illustrative imagery. These examples are not presented as completed BMTECH projects."/><div className="container page-content"><Breadcrumbs items={[{label:"Projects"}]}/><div className="demo-banner" style={{marginBottom:17}}><ImageIcon size={14}/> Illustrative demo gallery · Replace with verified BMTECH project photos and details before launch.</div><div className="filter-chips" style={{marginBottom:20}}>{filters.map((item)=><button key={item} className={`filter-chip ${filter===item?"selected":""}`} onClick={()=>setFilter(item)}>{item}</button>)}</div><div className="project-grid">{filtered.map((project)=><button className="project-tile" key={project.title} onClick={()=>setSelected(project)} style={{border:0,padding:0,textAlign:"left",cursor:"pointer"}}><img src={project.image} alt={`${project.title}, illustrative`} /><div className="project-tile-copy"><small><MapPin size={11} style={{display:"inline",verticalAlign:"-2px"}}/> {project.location} · {project.category}</small><h3>{project.title}</h3></div></button>)}</div></div>{selected&&<div role="dialog" aria-modal="true" aria-label={selected.title} onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,zIndex:80,background:"rgba(4,15,31,.82)",display:"grid",placeItems:"center",padding:20}}><button onClick={()=>setSelected(null)} aria-label="Close gallery" className="icon-button" style={{position:"absolute",top:22,right:22,color:"white",background:"rgba(255,255,255,.12)"}}><X size={22}/></button><div onClick={(e)=>e.stopPropagation()} style={{width:"min(900px,100%)",background:"white",borderRadius:10,overflow:"hidden"}}><img src={selected.image} alt={`${selected.title}, illustrative`} style={{width:"100%",height:"min(62vh,570px)",objectFit:"cover"}}/><div style={{padding:"17px 20px"}}><div className="demo-banner" style={{display:"inline-flex",marginBottom:9}}>Illustrative example · Not a verified BMTECH project</div><h2 style={{fontSize:20,color:"var(--navy)",margin:"2px 0 4px"}}>{selected.title}</h2><p className="detail-copy" style={{margin:0}}>{selected.text}</p></div></div></div>}</main>;
}
