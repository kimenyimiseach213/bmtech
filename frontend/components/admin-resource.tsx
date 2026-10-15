"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, ExternalLink, Eye, FilePlus2, ImagePlus, LoaderCircle, MessageCircle, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { useStore } from "@/app/providers";
import { apiPaths, apiRequest, unwrapList } from "@/lib/api";

type ResourceKey = "products" | "categories" | "orders" | "payments" | "quotations" | "bookings" | "messages" | "reviews" | "settings";
type Row = Record<string, unknown>;
type Field = { key: string; label: string; type?: "text" | "email" | "tel" | "number" | "textarea" | "select" | "checkbox" | "datetime-local"; options?: string[]; required?: boolean; wide?: boolean };
type ImageDraft = { key: string; id?: string; src: string; file?: File; alt: string };

const config: Record<ResourceKey, { title: string; subtitle: string; endpoint: string; fields: Field[]; columns: Array<{ key: string; label: string }> }> = {
  products: { title: "Products & inventory", subtitle: "Manage bilingual product details, pricing, stock and product photography.", endpoint: "products", fields: [
    { key: "sku", label: "SKU" }, { key: "categoryId", label: "Category ID" }, { key: "brand", label: "Brand" }, { key: "model", label: "Model" },
    { key: "nameEn", label: "Name (English)", required: true }, { key: "nameFr", label: "Name (French)", required: true },
    { key: "descriptionEn", label: "Description (English)", type: "textarea", wide: true }, { key: "descriptionFr", label: "Description (French)", type: "textarea", wide: true },
    { key: "condition", label: "Condition", type: "select", options: ["NEW", "USED"] }, { key: "priceMode", label: "Price mode", type: "select", options: ["FIXED", "QUOTE_REQUIRED"] },
    { key: "price", label: "Price (RWF)", type: "number" }, { key: "stockQuantity", label: "Stock quantity", type: "number" }, { key: "isPublished", label: "Published on storefront", type: "checkbox" },
  ], columns: [{ key: "nameEn", label: "Product" }, { key: "sku", label: "SKU" }, { key: "category", label: "Category" }, { key: "stockQuantity", label: "Stock" }, { key: "price", label: "Price" }, { key: "status", label: "Status" }] },
  categories: { title: "Categories", subtitle: "Create and organize active storefront categories in English and French.", endpoint: "categories", fields: [
    { key: "nameEn", label: "Name (English)", required: true }, { key: "nameFr", label: "Name (French)", required: true }, { key: "slug", label: "Slug", required: true },
    { key: "descriptionEn", label: "Description (English)", type: "textarea", wide: true }, { key: "descriptionFr", label: "Description (French)", type: "textarea", wide: true },
    { key: "sortOrder", label: "Display order", type: "number" }, { key: "isActive", label: "Active on storefront", type: "checkbox" },
  ], columns: [{ key: "nameEn", label: "Category" }, { key: "slug", label: "Slug" }, { key: "sortOrder", label: "Order" }, { key: "isActive", label: "Visibility" }] },
  orders: { title: "Orders", subtitle: "Review customer details, fulfillment choices, item snapshots and payment status.", endpoint: "orders", fields: [], columns: [{ key: "reference", label: "Reference" }, { key: "customer.name", label: "Customer" }, { key: "fulfillment", label: "Fulfillment" }, { key: "total", label: "Total" }, { key: "paymentStatus", label: "Payment" }, { key: "status", label: "Order status" }] },
  payments: { title: "Payments", subtitle: "Review submitted payment details and record manual verification through the API.", endpoint: "payments", fields: [], columns: [{ key: "reference", label: "Reference" }, { key: "order.reference", label: "Order" }, { key: "method", label: "Method" }, { key: "amount", label: "Amount" }, { key: "status", label: "Status" }, { key: "verifiedAt", label: "Verified" }] },
  quotations: { title: "Quotation requests", subtitle: "Review customer requirements, assign quoted amounts and update request status.", endpoint: "quotation-requests", fields: [
    { key: "status", label: "Status", type: "select", options: ["OPEN", "IN_REVIEW", "QUOTED", "ACCEPTED", "REJECTED", "CLOSED"] },
    { key: "quotedAmount", label: "Quoted amount (RWF)", type: "number" }, { key: "adminNotes", label: "Internal notes", type: "textarea", wide: true },
  ], columns: [{ key: "reference", label: "Reference" }, { key: "customer.name", label: "Customer" }, { key: "phone", label: "Phone" }, { key: "selection", label: "Requirement" }, { key: "status", label: "Status" }, { key: "quotedAmount", label: "Quote" }] },
  bookings: { title: "Technician bookings", subtitle: "Approve, reschedule or reject technician booking requests.", endpoint: "technician-bookings", fields: [
    { key: "status", label: "Status", type: "select", options: ["PENDING", "APPROVED", "RESCHEDULED", "REJECTED", "COMPLETED"] },
    { key: "scheduledAt", label: "Scheduled date and time", type: "datetime-local" }, { key: "adminNotes", label: "Internal notes", type: "textarea", wide: true },
  ], columns: [{ key: "reference", label: "Reference" }, { key: "customer.name", label: "Customer" }, { key: "phone", label: "Phone" }, { key: "service", label: "Service" }, { key: "preferredDate", label: "Preferred date" }, { key: "status", label: "Status" }] },
  messages: { title: "Contact messages", subtitle: "Read and mark customer messages as handled, with WhatsApp follow-up.", endpoint: "contact-messages", fields: [
    { key: "status", label: "Status", type: "select", options: ["UNREAD", "READ", "HANDLED"] }, { key: "adminNotes", label: "Internal notes", type: "textarea", wide: true },
  ], columns: [{ key: "name", label: "Name" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "message", label: "Message" }, { key: "status", label: "Status" }] },
  reviews: { title: "Review moderation", subtitle: "Approve, hide or remove customer reviews before they appear publicly.", endpoint: "reviews", fields: [
    { key: "status", label: "Status", type: "select", options: ["PENDING", "APPROVED", "HIDDEN"] }, { key: "adminNotes", label: "Moderation notes", type: "textarea", wide: true },
  ], columns: [{ key: "name", label: "Customer" }, { key: "rating", label: "Rating" }, { key: "experience", label: "Review" }, { key: "createdAt", label: "Submitted" }, { key: "status", label: "Status" }] },
  settings: { title: "Company settings", subtitle: "Maintain the public company profile. The public email also receives new customer enquiries when SMTP is configured.", endpoint: "settings", fields: [
    { key: "companyName", label: "Company name" }, { key: "phone", label: "Public phone", type: "tel" }, { key: "whatsapp", label: "WhatsApp number", type: "tel" }, { key: "email", label: "Public email and enquiry inbox", type: "email" },
    { key: "businessHours", label: "Business hours", type: "textarea", wide: true }, { key: "aboutEn", label: "Company information (English)", type: "textarea", wide: true }, { key: "aboutFr", label: "Company information (French)", type: "textarea", wide: true },
  ], columns: [{ key: "companyName", label: "Company" }, { key: "phone", label: "Phone" }, { key: "whatsapp", label: "WhatsApp" }, { key: "email", label: "Email" }] },
};

const record = (value: unknown): Row => value && typeof value === "object" ? value as Row : {};
function byPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => record(current)[key], value);
}
function displayValue(value: unknown, key: string) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Active" : "Inactive";
  if (typeof value === "object") return String(record(value).name ?? record(value).reference ?? record(value).id ?? "—");
  if (key.toLowerCase().includes("price") || key === "amount" || key === "total" || key === "quotedAmount") return `${new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 }).format(Number(value) || 0)} RWF`;
  return String(value);
}
function idOf(item: Row) { return String(item.id ?? item._id ?? item.slug ?? item.reference ?? ""); }
function fieldValue(item: Row, key: string): unknown {
  if (key === "nameEn") return byPath(item, "name.en") ?? item.nameEn ?? item.name;
  if (key === "nameFr") return byPath(item, "name.fr") ?? item.nameFr;
  if (key === "descriptionEn") return byPath(item, "description.en") ?? item.descriptionEn;
  if (key === "descriptionFr") return byPath(item, "description.fr") ?? item.descriptionFr;
  if (key === "categoryId") return item.categoryId ?? byPath(item, "category.id");
  return item[key];
}
function columnValue(item: Row, key: string) { return key.includes(".") ? byPath(item, key) : fieldValue(item, key); }
function imageRows(item: Row): ImageDraft[] {
  if (!Array.isArray(item.images)) return [];
  const images: ImageDraft[] = [];
  item.images.forEach((entry, index) => {
    const image = record(entry);
    const src = String(image.url ?? image.src ?? image.path ?? "");
    if (src) images.push({ key: String(image.id ?? `existing-${index}`), id: image.id ? String(image.id) : undefined, src, alt: String(image.alt ?? `Product photo ${index + 1}`) });
  });
  return images;
}
function customerPhone(item: Row) { return String(item.phone ?? byPath(item, "customer.phone") ?? item.customerPhone ?? "").replace(/[^\d+]/g, ""); }
function waHref(phone: string, message: string) {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = `250${cleaned.slice(1)}`;
  else if (!cleaned.startsWith("250") && cleaned.length === 9) cleaned = `250${cleaned}`;
  const recipient = cleaned.length >= 11 ? cleaned : "250788494513";
  return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
}

export function AdminResourcePage({ resource }: { resource: ResourceKey }) {
  const conf = config[resource];
  const { language, notify } = useStore();
  const french = language === "fr";
  const [rows, setRows] = useState<Row[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productConditionFilter, setProductConditionFilter] = useState("all");
  const [editing, setEditing] = useState<Row | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [confirm, setConfirm] = useState<{ title: string; message: string; action: () => Promise<void> } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<unknown>(apiPaths.admin(conf.endpoint));
      const data = unwrapList(response);
      if (resource === "settings" && data.length === 0) {
        const root = record(response); const nested = record(root.data);
        const setting = record(nested.settings ?? nested.company ?? root.settings ?? (Object.keys(nested).length ? nested : root));
        setRows(Object.keys(setting).length ? [setting] : []);
      } else setRows(data.map(record));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load this section.");
      setRows([]);
    } finally { setLoading(false); }
  }, [conf.endpoint, resource]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (resource !== "products") return;
    apiRequest<unknown>(apiPaths.admin("categories")).then((response) => setCategoryOptions(unwrapList(response).map(record))).catch(() => setCategoryOptions([]));
  }, [resource]);

  const visibleRows = useMemo(() => rows.filter((row) => {
    const searchable = conf.columns.map(({ key }) => String(columnValue(row, key) ?? "")).join(" ").toLowerCase();
    const matchesQuery = !query.trim() || searchable.includes(query.trim().toLowerCase());
    const status = String(row.status ?? (row.isActive === true ? "active" : row.isActive === false ? "inactive" : "all")).toLowerCase();
    const categoryId = String(row.categoryId ?? byPath(row, "category.id") ?? byPath(row, "category.name") ?? "");
    const condition = String(row.condition ?? "").toLowerCase();
    return matchesQuery && (statusFilter === "all" || status === statusFilter.toLowerCase())
      && (resource !== "products" || productCategoryFilter === "all" || categoryId === productCategoryFilter)
      && (resource !== "products" || productConditionFilter === "all" || condition === productConditionFilter);
  }), [rows, query, statusFilter, conf.columns, resource, productCategoryFilter, productConditionFilter]);

  function openEditor(item: Row | null) {
    setEditing(item ?? {});
    setImages(item ? imageRows(item) : []);
    const next: Record<string, string | boolean> = {};
    for (const field of conf.fields) {
      let value = item ? fieldValue(item, field.key) : undefined;
      if (field.key === "status" && typeof value === "string") value = value.toUpperCase();
      if (field.type === "datetime-local" && typeof value === "string" && value.includes("T")) value = value.slice(0, 16);
      if (value === undefined && !item && resource === "products" && field.key === "condition") value = "NEW";
      if (value === undefined && !item && resource === "products" && field.key === "priceMode") value = "FIXED";
      if (value === undefined && !item && resource === "products" && field.key === "stockQuantity") value = "0";
      if (value === undefined && !item && resource === "products" && field.key === "isPublished") value = true;
      if (value === undefined && !item && resource === "categories" && field.key === "isActive") value = true;
      if (value === undefined && !item && resource === "categories" && field.key === "sortOrder") value = String(rows.length);
      if (value === undefined && !item && field.key === "status") value = resource === "quotations" ? "OPEN" : resource === "bookings" ? "PENDING" : resource === "messages" ? "UNREAD" : "PENDING";
      if (value === undefined && !item && resource === "settings" && field.key === "whatsapp") value = "250788494513";
      next[field.key] = field.type === "checkbox" ? value === true : value === null || value === undefined ? "" : String(value);
    }
    setValues(next);
  }

  function closeEditor() {
    images.forEach((image) => { if (image.file) URL.revokeObjectURL(image.src); });
    setEditing(null); setImages([]); setValues({});
  }

  function addImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    setImages((current) => [...current, ...files.map((file) => ({ key: `new-${crypto.randomUUID()}`, src: URL.createObjectURL(file), file, alt: file.name }))]);
    event.target.value = "";
  }

  function moveImage(index: number, delta: number) {
    setImages((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const result = [...current]; [result[index], result[target]] = [result[target], result[index]]; return result;
    });
  }

  async function saveImages(productId: string) {
    const deleted = imageRows(editing ?? {}).filter((old) => !images.some((image) => image.key === old.key));
    for (const image of deleted) if (image.id) await apiRequest(`${apiPaths.admin(`products/${encodeURIComponent(productId)}/images/${encodeURIComponent(image.id)}`)}`, { method: "DELETE" });
    const newImages = images.filter((image) => image.file);
    let uploaded: ImageDraft[] = [];
    if (newImages.length) {
      for (const [index, source] of newImages.entries()) {
        const formData = new FormData();
        formData.append("files", source.file!, source.file!.name);
        const response = await apiRequest<unknown>(apiPaths.admin(`products/${encodeURIComponent(productId)}/images`), { method: "POST", body: formData });
        const payload = record(response); const data = record(payload.data);
        const serverImages = Array.isArray(payload.images) ? payload.images : Array.isArray(data.images) ? data.images : unwrapList(response);
        const image = record(serverImages[0]);
        uploaded.push({ key: source.key ?? `uploaded-${index}`, id: image.id ? String(image.id) : undefined, src: String(image.url ?? image.src ?? source.src ?? ""), alt: String(image.alt ?? source.alt ?? "Product photo") });
      }
    }
    const merged = images.map((image) => image.file ? uploaded.find((uploadedImage) => uploadedImage.key === image.key) ?? image : image);
    const imageIds = merged.map((image) => image.id).filter((id): id is string => Boolean(id));
    const coverImageId = merged.find((image) => image.key === images[0]?.key)?.id;
    if (imageIds.length || merged.length === 0) {
      await apiRequest(apiPaths.admin(`products/${encodeURIComponent(productId)}/images/reorder`), {
        method: "PATCH", body: JSON.stringify({ imageIds, coverImageId }),
      });
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true); setError("");
    const isUpdate = Boolean(idOf(editing));
    const body: Row = { ...values };
    for (const field of conf.fields) {
      if (field.type === "number") body[field.key] = values[field.key] === "" ? null : Number(values[field.key]);
      if (field.type === "checkbox") body[field.key] = values[field.key] === true;
    }
    if (resource === "products") {
      body.name = { en: values.nameEn ?? "", fr: values.nameFr ?? "" };
      body.description = { en: values.descriptionEn ?? "", fr: values.descriptionFr ?? "" };
      if (String(values.priceMode).toUpperCase().includes("QUOTE")) body.price = null;
    }
    if (resource === "categories") body.name = { en: values.nameEn ?? "", fr: values.nameFr ?? "" };
    const entityId = idOf(editing);
    const path = resource === "settings" ? apiPaths.admin("settings") : apiPaths.admin(`${conf.endpoint}${isUpdate ? `/${encodeURIComponent(entityId)}` : ""}`);
    try {
      const response = await apiRequest<unknown>(path, { method: isUpdate || resource === "settings" ? "PATCH" : "POST", body: JSON.stringify(body) });
      const saved = record(response); const nested = record(saved.data); const savedId = String(saved.id ?? saved.slug ?? nested.id ?? nested.slug ?? entityId);
      if (resource === "products" && savedId && images.length >= 0) await saveImages(savedId);
      notify(french ? "Modifications enregistrées." : "Changes saved.");
      closeEditor(); await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The change could not be saved.");
    } finally { setSaving(false); }
  }

  async function updateStatus(item: Row, status: string) {
    const itemId = idOf(item);
    if (!itemId) { setError("The API record has no id, slug or reference to update."); return; }
    setError("");
    try {
      const body = resource === "categories" ? { isActive: status === "ACTIVE" } : { status };
      await apiRequest(apiPaths.admin(`${conf.endpoint}/${encodeURIComponent(itemId)}`), { method: "PATCH", body: JSON.stringify(body) });
      notify(french ? "Statut mis à jour." : "Status updated."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Status update failed."); }
  }

  async function verifyPayment(item: Row) {
    const paymentId = idOf(item);
    const orderId = String(item.orderId ?? byPath(item, "order.id") ?? "");
    const path = orderId
      ? apiPaths.admin(`orders/${encodeURIComponent(orderId)}/payment/verify`)
      : apiPaths.admin(`payments/${encodeURIComponent(paymentId)}/verify`);
    setError("");
    try {
      await apiRequest(path, { method: "POST", body: JSON.stringify({ status: "VERIFIED", paymentStatus: "PAID", verified: true }) });
      notify(french ? "Paiement vérifié par le serveur." : "Payment verification recorded by the server."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Payment verification failed."); }
  }

  async function deleteItem(item: Row) {
    const itemId = idOf(item);
    if (!itemId) { setError("The API record has no identifier to remove."); return; }
    try {
      await apiRequest(apiPaths.admin(`${conf.endpoint}/${encodeURIComponent(itemId)}`), { method: "DELETE" });
      notify(french ? "Élément supprimé." : "Record deleted."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Delete failed."); }
  }

  const title = french ? ({ products: "Produits et stock", categories: "Catégories", orders: "Commandes", payments: "Paiements", quotations: "Demandes de devis", bookings: "Rendez-vous techniciens", messages: "Messages clients", reviews: "Modération des avis", settings: "Paramètres de l’entreprise" } as Record<ResourceKey, string>)[resource] : conf.title;

  return <main className="admin-content">
    <div className="admin-title-row"><div><span className="admin-eyebrow">BMTECH ADMIN</span><h1>{title}</h1><p>{french ? "Gérez les informations enregistrées par le serveur." : conf.subtitle}</p></div><div className="admin-title-actions">{((resource === "products" || resource === "categories") || (resource === "settings" && rows.length > 0)) && <button className="button button-primary" type="button" onClick={() => openEditor(resource === "settings" ? rows[0] ?? null : null)}><Plus size={15} />{french ? "Ajouter" : resource === "products" ? "Add product" : resource === "settings" ? "Edit settings" : "Add new"}</button>}{resource === "settings" && rows.length === 0 && !loading && <button className="button button-primary" type="button" onClick={() => openEditor(null)}><Pencil size={15} />Edit company settings</button>}<button className="button button-outline admin-refresh" type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={14} className={loading ? "admin-spin" : ""} />{french ? "Actualiser" : "Refresh"}</button></div></div>
    {error && <div className="admin-alert admin-alert-error" role="alert"><b>{french ? "Action impossible" : "Request failed"}</b><span>{error}</span><button type="button" aria-label="Dismiss" onClick={() => setError("")}><X size={15} /></button></div>}
    <section className="admin-panel admin-resource-panel">
      <div className="admin-toolbar"><label className="admin-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={french ? "Rechercher…" : "Search records…"} /></label>{resource === "products" && <><label className="admin-filter-label">Category<select className="select-control" value={productCategoryFilter} onChange={(event) => setProductCategoryFilter(event.target.value)}><option value="all">All categories</option>{categoryOptions.map((category) => <option key={idOf(category)} value={idOf(category)}>{String(category.nameEn ?? byPath(category, "name.en") ?? category.name ?? idOf(category))}</option>)}</select></label><label className="admin-filter-label">Condition<select className="select-control" value={productConditionFilter} onChange={(event) => setProductConditionFilter(event.target.value)}><option value="all">All</option><option value="new">New</option><option value="used">Used</option></select></label></>}<label className="admin-filter-label">{french ? "Statut" : "Status"}<select className="select-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">{french ? "Tous" : "All statuses"}</option>{["pending", "open", "unread", "handled", "approved", "hidden", "active", "inactive", "paid", "verified", "rejected"].map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label><span className="admin-record-count">{loading ? "…" : `${visibleRows.length} ${french ? "éléments" : "records"}`}</span></div>
      {loading ? <div className="admin-loading"><LoaderCircle className="admin-spin" size={20} />{french ? "Chargement des données…" : "Loading records from API…"}</div> : error && rows.length === 0 ? <div className="admin-empty"><ShieldCheck size={24} /><b>{french ? "Connexion au serveur requise" : "Backend connection required"}</b><p>{error}</p><small>{french ? "Aucun enregistrement local n’a été présenté comme sauvegardé." : "No local records are shown as if they were saved."}</small></div> : visibleRows.length === 0 ? <div className="admin-empty"><FilePlus2 size={24} /><b>{french ? "Aucun résultat" : "No records found"}</b><p>{french ? "Ajustez votre recherche ou créez un élément." : "Change the search or add the first record."}</p></div> : <div className="admin-table-wrap"><table className="admin-table admin-wide-table"><thead><tr>{conf.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th className="admin-actions-head">Actions</th></tr></thead><tbody>{visibleRows.map((item, index) => <tr key={idOf(item) || index}>{conf.columns.map((column) => <td key={column.key}>{column.key === "status" || column.key === "paymentStatus" || column.key === "isActive" ? <span className={`admin-status-pill ${(String(columnValue(item, column.key) ?? (item.isActive ? "active" : "inactive"))).toLowerCase().replace(/[^a-z]+/g, "-")}`}>{displayValue(columnValue(item, column.key) ?? (column.key === "isActive" ? item.isActive : undefined), column.key)}</span> : <span className={column.key === "message" || column.key === "experience" ? "admin-cell-truncate" : ""} title={String(columnValue(item, column.key) ?? "")}>{displayValue(columnValue(item, column.key), column.key)}</span>}</td>)}<td><div className="admin-row-actions">
        {(resource === "products" || resource === "categories" || resource === "quotations" || resource === "bookings" || resource === "messages" || resource === "reviews" || resource === "settings") && <button className="admin-icon-action" title="Edit" aria-label={`Edit ${idOf(item)}`} onClick={() => openEditor(item)}><Pencil size={14} /></button>}
        {(resource === "orders" || resource === "payments") && <button className="admin-small-action" onClick={() => void verifyPayment(item)}><ShieldCheck size={13} />{french ? "Vérifier" : "Verify payment"}</button>}
        {resource === "categories" && <><button className="admin-icon-action" title="Move up" aria-label="Move category up" onClick={() => { const order = Number(item.sortOrder ?? index); void apiRequest(apiPaths.admin(`categories/${encodeURIComponent(idOf(item))}/reorder`), { method: "PATCH", body: JSON.stringify({ sortOrder: order - 1 }) }).then(load).catch((reason) => setError(reason instanceof Error ? reason.message : "Reorder failed.")); }}><ArrowUp size={14} /></button><button className="admin-icon-action" title="Move down" aria-label="Move category down" onClick={() => { const order = Number(item.sortOrder ?? index); void apiRequest(apiPaths.admin(`categories/${encodeURIComponent(idOf(item))}/reorder`), { method: "PATCH", body: JSON.stringify({ sortOrder: order + 1 }) }).then(load).catch((reason) => setError(reason instanceof Error ? reason.message : "Reorder failed.")); }}><ArrowDown size={14} /></button><button className="admin-small-action" onClick={() => void updateStatus(item, item.isActive ? "INACTIVE" : "ACTIVE")}>{item.isActive ? "Deactivate" : "Activate"}</button></>}
        {resource === "bookings" && <><button className="admin-small-action" onClick={() => void updateStatus(item, "APPROVED")}>Approve</button><button className="admin-small-action" onClick={() => { openEditor(item); setValues((current) => ({ ...current, status: "RESCHEDULED" })); }}>Reschedule</button><button className="admin-small-action danger" onClick={() => void updateStatus(item, "REJECTED")}>Reject</button></>}
        {resource === "messages" && <><a className="admin-icon-action admin-whatsapp-action" href={waHref(customerPhone(item), `Hello ${String(item.name ?? byPath(item, "customer.name") ?? "").trim()}, BMTECH is following up on your message.`)} target="_blank" rel="noreferrer" title="Open WhatsApp chat" aria-label="Open WhatsApp chat"><MessageCircle size={14} /></a><button className="admin-small-action" onClick={() => void updateStatus(item, "HANDLED")}>Mark handled</button><button className="admin-icon-action" title="Read message" aria-label="Read message" onClick={() => openEditor(item)}><Eye size={14} /></button></>}
        {resource === "reviews" && <><button className="admin-small-action" onClick={() => void updateStatus(item, "APPROVED")}>Approve</button><button className="admin-small-action" onClick={() => void updateStatus(item, "HIDDEN")}>Hide</button><button className="admin-icon-action danger" title="Remove review" aria-label="Remove review" onClick={() => setConfirm({ title: "Remove customer review?", message: "This permanently deletes the review through the API.", action: () => deleteItem(item) })}><Trash2 size={14} /></button></>}
        {resource === "products" && <button className="admin-icon-action danger" title="Delete product" aria-label="Delete product" onClick={() => setConfirm({ title: "Delete this product?", message: "This permanently removes the product from the catalogue.", action: () => deleteItem(item) })}><Trash2 size={14} /></button>}
        {resource === "categories" && <button className="admin-icon-action danger" title="Delete category" aria-label="Delete category" onClick={() => setConfirm({ title: "Delete this category?", message: "Products may rely on this category. The server will reject deletion if it is still in use.", action: () => deleteItem(item) })}><Trash2 size={14} /></button>}
        {resource === "orders" && <button className="admin-icon-action" title="View order snapshot" aria-label="View order snapshot" onClick={() => openEditor(item)}><Eye size={14} /></button>}
        {resource === "payments" && <button className="admin-icon-action" title="View payment" aria-label="View payment details" onClick={() => openEditor(item)}><Eye size={14} /></button>}
        {resource === "quotations" && <a className="admin-icon-action" href={waHref(customerPhone(item), `Hello ${String(byPath(item, "customer.name") ?? item.name ?? "").trim()}, BMTECH is following up on your quotation request.`)} target="_blank" rel="noreferrer" title="WhatsApp customer"><MessageCircle size={14} /></a>}
        {resource === "bookings" && <a className="admin-icon-action" href={waHref(customerPhone(item), `Hello ${String(byPath(item, "customer.name") ?? item.name ?? "").trim()}, BMTECH is following up about your technician booking.`)} target="_blank" rel="noreferrer" title="WhatsApp customer"><MessageCircle size={14} /></a>}
        </div></td></tr>)}</tbody></table></div>}
    </section>

    {editing && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEditor(); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-editor-title"><header><div><span className="admin-eyebrow">{resource.toUpperCase()}</span><h2 id="admin-editor-title">{conf.fields.length === 0 ? "Record details" : idOf(editing) ? "Edit record" : "Add new record"}</h2></div><button type="button" className="admin-icon-action" onClick={closeEditor} aria-label="Close editor"><X size={18} /></button></header>
      {(resource === "messages" || resource === "quotations" || resource === "bookings") && <section className="admin-request-preview"><h3>{resource === "messages" ? "Customer message" : resource === "quotations" ? "Quotation request details" : "Booking request details"}</h3><div><b>{String(byPath(editing, "customer.name") ?? editing.name ?? "Customer")}</b><span>{String(customerPhone(editing) || "Phone not supplied")}</span>{Boolean(editing.email ?? byPath(editing, "customer.email")) && <span>{String(editing.email ?? byPath(editing, "customer.email"))}</span>}</div><p>{String(editing.message ?? editing.details ?? editing.requirements ?? "No additional details provided.")}</p>{Boolean(editing.selection ?? editing.service ?? editing.serviceType) && <small>{String(editing.selection ?? editing.service ?? editing.serviceType)}</small>}</section>}
      {conf.fields.length === 0 ? <div className="admin-record-details">{Object.entries(editing).filter(([key]) => !["__v"].includes(key)).map(([key, value]) => <div key={key}><b>{key}</b><pre>{typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "—")}</pre></div>)}</div> : <form onSubmit={save}><div className="admin-form-grid">{conf.fields.map((field) => <label key={field.key} className={`admin-form-field ${field.wide ? "wide" : ""} ${field.type === "checkbox" ? "checkbox-field" : ""}`}><span>{field.label}{field.required && <i> *</i>}</span>{field.key === "categoryId" ? <select value={String(values[field.key] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}><option value="">Select a category</option>{categoryOptions.map((category) => <option key={idOf(category)} value={idOf(category)}>{String(category.nameEn ?? byPath(category, "name.en") ?? category.name ?? idOf(category))}</option>)}</select> : field.type === "textarea" ? <textarea rows={4} required={field.required} value={String(values[field.key] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} /> : field.type === "select" ? <select required={field.required} value={String(values[field.key] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}>{(field.options ?? []).map((option) => <option value={option} key={option}>{option}</option>)}</select> : field.type === "checkbox" ? <input type="checkbox" checked={values[field.key] === true} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.checked }))} /> : <input type={field.type ?? "text"} required={field.required} value={String(values[field.key] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} />}</label>)}</div>
        {resource === "products" && <section className="admin-image-manager"><div className="admin-image-manager-heading"><div><h3>Product photos</h3><p>Upload multiple images, drag order with the arrows, choose the cover and remove unwanted photos.</p></div><label className="button button-outline admin-upload-button"><ImagePlus size={15} />Add photos<input type="file" accept="image/*" multiple onChange={addImages} /></label></div>{images.length === 0 ? <div className="admin-image-empty"><ImagePlus size={19} />No product photos added yet.</div> : <div className="admin-image-grid">{images.map((image, index) => <div className={`admin-image-tile ${index === 0 ? "is-cover" : ""}`} key={image.key}><img src={image.src} alt={image.alt} /><span className="admin-image-index">{index === 0 ? "COVER" : `PHOTO ${index + 1}`}</span><div className="admin-image-actions"><button type="button" disabled={index === 0} aria-label="Move image earlier" onClick={() => moveImage(index, -1)}><ChevronLeft size={14} /></button><button type="button" disabled={index === images.length - 1} aria-label="Move image later" onClick={() => moveImage(index, 1)}><ChevronRight size={14} /></button><button type="button" title="Make cover image" aria-label="Make cover image" disabled={index === 0} onClick={() => moveImage(index, -index)}><Check size={14} /></button><button type="button" className="remove" aria-label="Remove image" onClick={() => { if (image.file) URL.revokeObjectURL(image.src); setImages((current) => current.filter((entry) => entry.key !== image.key)); }}><X size={14} /></button></div></div>)}</div>}</section>}
        {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}<footer className="admin-modal-footer"><button type="button" className="button button-outline" onClick={closeEditor}>{french ? "Annuler" : "Cancel"}</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? <><LoaderCircle className="admin-spin" size={15} />{french ? "Enregistrement…" : "Saving…"}</> : <><Check size={15} />{french ? "Enregistrer" : "Save changes"}</>}</button></footer></form>}
    </section></div>}

    {confirm && <div className="admin-modal-backdrop" role="presentation"><section className="admin-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><span className="admin-confirm-icon"><Trash2 size={18} /></span><h2 id="confirm-title">{confirm.title}</h2><p>{confirm.message}</p><div className="admin-modal-footer"><button type="button" className="button button-outline" onClick={() => setConfirm(null)}>Cancel</button><button type="button" className="button admin-danger-button" onClick={async () => { const current = confirm; setConfirm(null); await current.action(); }}>Delete permanently</button></div></section></div>}
  </main>;
}
