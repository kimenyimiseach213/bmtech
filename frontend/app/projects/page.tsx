"use client";

import { useMemo, useState } from "react";
import { PageHero, Breadcrumbs } from "@/components/ui";
import { imageUrls } from "@/lib/data";

const projects = [
  { title:"Standby power planning", category:"Generators", image:imageUrls.generator },
  { title:"Electrical distribution", category:"Electrical", image:imageUrls.panel },
  { title:"Backup energy options", category:"Backup power", image:imageUrls.solar },
  { title:"Technician at work", category:"Electrical", image:imageUrls.technician },
  { title:"Industrial power systems", category:"Generators", image:imageUrls.industrial },
  { title:"Power equipment detail", category:"Backup power", image:imageUrls.inverter },
  { title:"Engineering work", category:"Electrical", image:imageUrls.engineer },
];
const filters = ["All", "Generators", "Electrical", "Backup power"];

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  const filtered = useMemo(()=>filter === "All" ? projects : projects.filter((item)=>item.category === filter),[filter]);
  return <main className="projects-page"><PageHero eyebrow="PROJECT GALLERY" title="Power systems in practice" description="Explore generator installations, electrical systems, backup power and technical work."/><div className="container page-content"><Breadcrumbs items={[{label:"Projects"}]}/><div className="filter-chips" style={{marginBottom:20}}>{filters.map((item)=><button key={item} className={`filter-chip ${filter===item?"selected":""}`} onClick={()=>setFilter(item)}>{item}</button>)}</div><div className="project-grid">{filtered.map((project)=><article className="project-tile" key={project.title}><img src={project.image} alt={project.title} loading="lazy"/><div className="project-tile-copy"><small>Illustrative · {project.category}</small><h3>{project.title}</h3></div></article>)}</div></div></main>;
}
