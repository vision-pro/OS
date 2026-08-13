import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CheckCircle2,
  FileText,
  FolderKanban,
  ImagePlus,
  Images,
  LayoutPanelTop,
  Loader2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type Tab = "overview" | "content" | "requests" | "media" | "users" | "settings";
type Entity = "projects" | "categories" | "services" | "achievements" | "clients" | "partners" | "testimonials" | "faqs" | "pages";
type FormValues = Record<string, string | boolean | number | null>;

const entities: Array<{ id: Entity; label: string; icon: typeof FolderKanban; hint: string }> = [
  { id: "projects", label: "المشاريع", icon: FolderKanban, hint: "معرض الأعمال والتصنيفات والوسائط" },
  { id: "categories", label: "التصنيفات", icon: LayoutPanelTop, hint: "تصفية وتنظيم معرض الأعمال" },
  { id: "services", label: "الخدمات", icon: Settings2, hint: "الخدمات الظاهرة في الموقع" },
  { id: "achievements", label: "الإنجازات", icon: CheckCircle2, hint: "الإنجازات المعتمدة فقط" },
  { id: "clients", label: "العملاء", icon: Users, hint: "شعارات وأسماء العملاء" },
  { id: "partners", label: "الشركاء", icon: ShieldCheck, hint: "الجهات الشريكة" },
  { id: "testimonials", label: "الشهادات", icon: MessageCircle, hint: "لا تنشر إلا شهادات حقيقية وموثقة" },
  { id: "faqs", label: "الأسئلة الشائعة", icon: FileText, hint: "إجابات مفيدة وقابلة للنشر" },
  { id: "pages", label: "الصفحات وSEO", icon: LayoutPanelTop, hint: "الصفحات الديناميكية وإعدادات البحث" },
];

const fieldsByEntity: Record<Entity, Array<{ key: string; label: string; type?: "text" | "textarea" | "number" | "checkbox" | "select"; required?: boolean; options?: Array<[string, string]> }>> = {
  projects: [
    { key: "slug", label: "الرابط المختصر", required: true }, { key: "titleAr", label: "العنوان بالعربية", required: true }, { key: "titleEn", label: "العنوان بالإنجليزية", required: true },
    { key: "summaryAr", label: "ملخص عربي", type: "textarea" }, { key: "summaryEn", label: "English summary", type: "textarea" }, { key: "descriptionAr", label: "الوصف العربي", type: "textarea" }, { key: "descriptionEn", label: "English description", type: "textarea" },
    { key: "categoryId", label: "رقم التصنيف", type: "number" }, { key: "coverMediaId", label: "رقم وسائط الغلاف", type: "number" }, { key: "clientName", label: "اسم العميل" }, { key: "projectDate", label: "تاريخ المشروع" },
    { key: "status", label: "الحالة", type: "select", options: [["draft", "مسودة"], ["published", "منشور"], ["archived", "مؤرشف"]] }, { key: "isFeatured", label: "عمل مختار", type: "checkbox" },
    { key: "seoTitleAr", label: "عنوان SEO بالعربية" }, { key: "seoTitleEn", label: "SEO title in English" }, { key: "seoDescriptionAr", label: "وصف SEO بالعربية", type: "textarea" }, { key: "seoDescriptionEn", label: "SEO description in English", type: "textarea" }, { key: "seoKeywords", label: "الكلمات المفتاحية" },
  ],
  categories: [{ key: "slug", label: "الرابط المختصر", required: true }, { key: "titleAr", label: "العنوان بالعربية", required: true }, { key: "titleEn", label: "العنوان بالإنجليزية", required: true }, { key: "descriptionAr", label: "الوصف العربي", type: "textarea" }, { key: "descriptionEn", label: "English description", type: "textarea" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isActive", label: "نشط", type: "checkbox" }],
  services: [{ key: "slug", label: "الرابط المختصر", required: true }, { key: "titleAr", label: "العنوان بالعربية", required: true }, { key: "titleEn", label: "العنوان بالإنجليزية", required: true }, { key: "summaryAr", label: "الملخص العربي", type: "textarea" }, { key: "summaryEn", label: "English summary", type: "textarea" }, { key: "descriptionAr", label: "الوصف العربي", type: "textarea" }, { key: "descriptionEn", label: "English description", type: "textarea" }, { key: "icon", label: "اسم الأيقونة (Lucide)" }, { key: "coverMediaId", label: "رقم وسائط الغلاف", type: "number" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isActive", label: "نشط", type: "checkbox" }],
  achievements: [{ key: "titleAr", label: "العنوان بالعربية", required: true }, { key: "titleEn", label: "العنوان بالإنجليزية", required: true }, { key: "descriptionAr", label: "الوصف العربي", type: "textarea" }, { key: "descriptionEn", label: "English description", type: "textarea" }, { key: "achievementDate", label: "تاريخ الإنجاز" }, { key: "mediaId", label: "رقم الوسائط", type: "number" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isPublished", label: "منشور", type: "checkbox" }],
  clients: [{ key: "nameAr", label: "الاسم بالعربية", required: true }, { key: "nameEn", label: "الاسم بالإنجليزية", required: true }, { key: "logoMediaId", label: "رقم الشعار في الوسائط", type: "number" }, { key: "websiteUrl", label: "رابط الموقع" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isActive", label: "نشط", type: "checkbox" }],
  partners: [{ key: "nameAr", label: "الاسم بالعربية", required: true }, { key: "nameEn", label: "الاسم بالإنجليزية", required: true }, { key: "logoMediaId", label: "رقم الشعار في الوسائط", type: "number" }, { key: "websiteUrl", label: "رابط الموقع" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isActive", label: "نشط", type: "checkbox" }],
  testimonials: [{ key: "authorName", label: "اسم صاحب الشهادة", required: true }, { key: "authorRoleAr", label: "الصفة بالعربية" }, { key: "authorRoleEn", label: "Role in English" }, { key: "quoteAr", label: "الشهادة بالعربية", type: "textarea", required: true }, { key: "quoteEn", label: "Testimonial in English", type: "textarea", required: true }, { key: "sourceUrl", label: "رابط المصدر الموثق" }, { key: "isVerified", label: "موثقة", type: "checkbox" }, { key: "isPublished", label: "منشورة", type: "checkbox" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }],
  faqs: [{ key: "questionAr", label: "السؤال بالعربية", type: "textarea", required: true }, { key: "questionEn", label: "Question in English", type: "textarea", required: true }, { key: "answerAr", label: "الإجابة بالعربية", type: "textarea", required: true }, { key: "answerEn", label: "Answer in English", type: "textarea", required: true }, { key: "category", label: "التصنيف" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isPublished", label: "منشور", type: "checkbox" }],
  pages: [{ key: "slug", label: "الرابط المختصر", required: true }, { key: "template", label: "نوع الصفحة", required: true }, { key: "titleAr", label: "عنوان الصفحة بالعربية", required: true }, { key: "titleEn", label: "Page title in English", required: true }, { key: "heroTitleAr", label: "عنوان الواجهة بالعربية" }, { key: "heroTitleEn", label: "Hero title in English" }, { key: "heroTextAr", label: "نص الواجهة بالعربية", type: "textarea" }, { key: "heroTextEn", label: "Hero text in English", type: "textarea" }, { key: "heroMediaId", label: "رقم وسائط الواجهة", type: "number" }, { key: "showInNavigation", label: "إظهار في القائمة", type: "checkbox" }, { key: "navigationOrder", label: "ترتيب القائمة", type: "number" }, { key: "status", label: "الحالة", type: "select", options: [["draft", "مسودة"], ["published", "منشور"], ["archived", "مؤرشف"]] }, { key: "seoTitleAr", label: "عنوان SEO بالعربية" }, { key: "seoTitleEn", label: "SEO title in English" }, { key: "seoDescriptionAr", label: "وصف SEO بالعربية", type: "textarea" }, { key: "seoDescriptionEn", label: "SEO description in English", type: "textarea" }, { key: "seoKeywords", label: "الكلمات المفتاحية" }],
};

function makeInitialValues(entity: Entity, row?: Record<string, any>): FormValues {
  const values: FormValues = {};
  fieldsByEntity[entity].forEach(field => { values[field.key] = row?.[field.key] ?? (field.type === "checkbox" ? false : field.type === "number" ? "" : ""); });
  return values;
}

function valueLabel(row: Record<string, any>) { return row.titleAr || row.nameAr || row.authorName || row.questionAr || row.slug || `#${row.id}`; }

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const { user, loading } = useAuth();
  if (loading) return <div className="admin-loading"><Loader2 className="animate-spin" /></div>;
  if (!user) return <DashboardLayout><div /></DashboardLayout>;
  if (user.role !== "admin") return <DashboardLayout><div className="access-denied"><ShieldCheck className="h-8 w-8" /><h1>هذه المساحة للمسؤولين فقط</h1><p>سجّل الدخول بالحساب المعيّن كمسؤول لإدارة محتوى الموقع.</p></div></DashboardLayout>;

  return <DashboardLayout><main className="admin-page" dir="rtl"><header className="admin-header"><div><p className="admin-eyebrow">VISION PRODUCTION / CMS</p><h1>لوحة إدارة المحتوى</h1></div><a href="/" target="_blank" rel="noreferrer" className="admin-public-link">عرض الموقع <ArrowUpIcon /></a></header><div className="admin-tabs">{([{ id: "overview", label: "نظرة عامة", icon: BarChart3 }, { id: "content", label: "المحتوى", icon: FileText }, { id: "requests", label: "الطلبات", icon: Mail }, { id: "media", label: "الوسائط", icon: Images }, { id: "users", label: "المستخدمون", icon: Users }, { id: "settings", label: "الإعدادات", icon: Settings2 }] as Array<any>).map(item => <button key={item.id} onClick={() => setTab(item.id)} className={cn(tab === item.id && "active")}><item.icon className="h-4 w-4" />{item.label}</button>)}</div>{tab === "overview" && <Overview onChangeTab={setTab} />}{tab === "content" && <ContentManager />}{tab === "requests" && <RequestsManager />}{tab === "media" && <MediaManager />}{tab === "users" && <UsersManager />}{tab === "settings" && <SettingsManager />}</main></DashboardLayout>;
}

function ArrowUpIcon() { return <span aria-hidden="true">↗</span>; }

function Overview({ onChangeTab }: { onChangeTab: (tab: Tab) => void }) {
  const { data, isLoading } = trpc.admin.overview.useQuery();
  const stats = [{ label: "المشاريع", value: data?.projects ?? 0, icon: FolderKanban, tab: "content" as Tab }, { label: "طلبات الحجز الجديدة", value: data?.bookings ?? 0, icon: MessageCircle, tab: "requests" as Tab }, { label: "رسائل جديدة", value: data?.contacts ?? 0, icon: Mail, tab: "requests" as Tab }, { label: "الوسائط", value: data?.media ?? 0, icon: Images, tab: "media" as Tab }];
  return <section className="admin-overview"><div className="admin-stat-grid">{stats.map(stat => <button key={stat.label} onClick={() => onChangeTab(stat.tab)} className="admin-stat"><span><stat.icon className="h-5 w-5" /></span><div><b>{isLoading ? "—" : stat.value}</b><p>{stat.label}</p></div></button>)}</div><div className="admin-welcome"><div><p className="admin-eyebrow">خطوة البداية</p><h2>أضف الأعمال والوسائط المعتمدة، ثم انشرها من شاشة المحتوى.</h2><p>لا تستخدم لوحة التحكم لنشر تقييمات أو شهادات إلا بعد توثيقها، واحرص على إدخال النص العربي والإنجليزي لكل عنصر ظاهر.</p></div><button className="admin-primary" onClick={() => onChangeTab("content")}><Plus className="h-4 w-4" />إدارة المحتوى</button></div></section>;
}

function ContentManager() {
  const [entity, setEntity] = useState<Entity>("projects");
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const { data = [], isLoading } = trpc.admin.content.list.useQuery(entity);
  const utils = trpc.useUtils();
  const save = trpc.admin.content.save.useMutation({ onSuccess: () => { utils.admin.content.list.invalidate(entity); toast.success("تم حفظ العنصر."); setEditing(null); }, onError: () => toast.error("تعذر حفظ العنصر.") });
  const remove = trpc.admin.content.remove.useMutation({ onSuccess: () => { utils.admin.content.list.invalidate(entity); toast.success("تم حذف العنصر."); }, onError: () => toast.error("تعذر حذف العنصر.") });
  const selected = entities.find(item => item.id === entity)!;
  return <section className="content-manager"><aside className="entity-sidebar">{entities.map(item => <button key={item.id} onClick={() => { setEntity(item.id); setEditing(null); }} className={cn(entity === item.id && "active")}><item.icon className="h-4 w-4" /><span>{item.label}</span></button>)}</aside><div className="entity-content"><div className="entity-header"><div><p className="admin-eyebrow">{selected.label}</p><h2>{selected.hint}</h2></div><button className="admin-primary" onClick={() => setEditing({})}><Plus className="h-4 w-4" />إضافة عنصر</button></div>{isLoading ? <div className="admin-loading compact"><Loader2 className="animate-spin" /></div> : <div className="entity-table"><div className="entity-table-head"><span>العنصر</span><span>الحالة</span><span>إجراءات</span></div>{(data as Record<string, any>[]).map(row => <div className="entity-row" key={row.id}><div><b>{valueLabel(row)}</b><small>{row.slug ? `/${row.slug}` : row.titleEn || row.nameEn || ""}</small></div><div><StatusBadge row={row} /></div><div className="entity-actions"><button aria-label="تعديل" onClick={() => setEditing(row)}><MoreHorizontal className="h-4 w-4" /></button><button aria-label="حذف" className="danger" onClick={() => { if (confirm("هل تريد حذف هذا العنصر؟")) remove.mutate({ entity, id: row.id }); }}><Trash2 className="h-4 w-4" /></button></div></div>)}{data.length === 0 ? <div className="admin-empty">لا توجد عناصر بعد. أضف أول عنصر ليظهر في الموقع.</div> : null}</div>}</div>{editing !== null ? <ContentEditor entity={entity} initial={editing} saving={save.isPending} onClose={() => setEditing(null)} onSave={(values) => save.mutate({ entity, id: editing.id, values })} /> : null}</section>;
}

function StatusBadge({ row }: { row: Record<string, any> }) { const active = row.status === "published" || row.isActive || row.isPublished; const text = row.status ? ({ published: "منشور", draft: "مسودة", archived: "مؤرشف" } as Record<string, string>)[row.status] : active ? "نشط" : "غير منشور"; return <span className={cn("status-badge", active && "active")}>{text}</span>; }

function ContentEditor({ entity, initial, saving, onClose, onSave }: { entity: Entity; initial: Record<string, any>; saving: boolean; onClose: () => void; onSave: (values: Record<string, unknown>) => void }) {
  const [values, setValues] = useState<FormValues>(() => makeInitialValues(entity, initial));
  function submit(event: FormEvent) { event.preventDefault(); const clean: Record<string, unknown> = {}; fieldsByEntity[entity].forEach(field => { const value = values[field.key]; if (field.type === "number") clean[field.key] = value === "" ? null : Number(value); else clean[field.key] = value; }); if (entity === "projects" && !initial.id) clean.mediaIds = []; onSave(clean); }
  return <div className="admin-modal-layer"><form className="admin-modal" onSubmit={submit}><div className="modal-head"><div><p className="admin-eyebrow">{initial.id ? "تعديل" : "إضافة"}</p><h2>{entities.find(item => item.id === entity)?.label}</h2></div><button type="button" onClick={onClose}><X className="h-5 w-5" /></button></div><div className="editor-grid">{fieldsByEntity[entity].map(field => <EditorField key={field.key} field={field} value={values[field.key]} onChange={(value) => setValues(prev => ({ ...prev, [field.key]: value }))} />)}</div><div className="modal-actions"><button type="button" className="admin-ghost" onClick={onClose}>إلغاء</button><button className="admin-primary" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{initial.id ? "حفظ التعديلات" : "إنشاء العنصر"}</button></div></form></div>;
}

function EditorField({ field, value, onChange }: { field: any; value: any; onChange: (value: any) => void }) { return <div className={cn("editor-field", field.type === "textarea" && "wide", field.type === "checkbox" && "checkbox-field")}><Label>{field.label}{field.required ? " *" : ""}</Label>{field.type === "textarea" ? <Textarea required={field.required} value={String(value ?? "")} onChange={event => onChange(event.target.value)} /> : field.type === "checkbox" ? <button type="button" onClick={() => onChange(!value)} className={cn("toggle", value && "on")}><span />{value ? "مفعّل" : "غير مفعّل"}</button> : field.type === "select" ? <select value={String(value || field.options?.[0]?.[0] || "")} onChange={event => onChange(event.target.value)}>{field.options?.map(([val, label]: [string, string]) => <option key={val} value={val}>{label}</option>)}</select> : <Input type={field.type === "number" ? "number" : "text"} required={field.required} value={String(value ?? "")} onChange={event => onChange(event.target.value)} />}</div>; }

function RequestsManager() {
  const [kind, setKind] = useState<"bookings" | "contacts">("bookings");
  const { data = [], isLoading } = trpc.admin.requests.list.useQuery(kind);
  const utils = trpc.useUtils();
  const update = trpc.admin.requests.updateStatus.useMutation({ onSuccess: () => { utils.admin.requests.list.invalidate(kind); toast.success("تم تحديث حالة الطلب."); } });
  return <section className="request-manager"><div className="entity-header"><div><p className="admin-eyebrow">الطلبات الواردة</p><h2>الحجوزات ورسائل التواصل</h2></div><div className="segment-control"><button className={cn(kind === "bookings" && "active")} onClick={() => setKind("bookings")}>الحجوزات</button><button className={cn(kind === "contacts" && "active")} onClick={() => setKind("contacts")}>الرسائل</button></div></div>{isLoading ? <div className="admin-loading compact"><Loader2 className="animate-spin" /></div> : <div className="request-list">{(data as Record<string, any>[]).map(request => <article key={request.id} className="request-card"><div><span className="request-id">#{request.id}</span><h3>{request.name}</h3><p>{request.phone || request.email || "—"}</p></div><p className="request-message">{request.message || request.subject || request.projectType || "لا توجد تفاصيل إضافية"}</p><select value={request.status} onChange={event => update.mutate({ kind, id: request.id, status: event.target.value })}>{(kind === "bookings" ? [["new", "جديد"], ["contacted", "تم التواصل"], ["confirmed", "مؤكد"], ["closed", "مغلق"]] : [["new", "جديد"], ["read", "مقروء"], ["resolved", "مُعالج"]]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></article>)}{data.length === 0 ? <div className="admin-empty">لا توجد طلبات في هذه القائمة.</div> : null}</div>}</section>;
}

function MediaManager() {
  const { data = [], isLoading } = trpc.admin.media.list.useQuery();
  const utils = trpc.useUtils();
  const [uploading, setUploading] = useState(false);
  async function upload(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; if (file.size > 45 * 1024 * 1024) { toast.error("الحد الأقصى للملف 45 ميغابايت."); return; } setUploading(true); try { const dataUrl = await toDataUrl(file); const response = await fetch("/api/media/upload", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ fileName: file.name, mimeType: file.type || "application/octet-stream", dataUrl }) }); if (!response.ok) throw new Error(); toast.success("تم رفع الملف إلى التخزين السحابي."); utils.admin.media.list.invalidate(); } catch { toast.error("تعذر رفع الملف. تأكد من تسجيل دخولك كمسؤول."); } finally { setUploading(false); event.target.value = ""; } }
  return <section className="media-manager"><div className="entity-header"><div><p className="admin-eyebrow">S3 MEDIA LIBRARY</p><h2>مكتبة الوسائط</h2></div><label className="admin-primary upload-button"><Upload className="h-4 w-4" />{uploading ? "جارٍ الرفع…" : "رفع ملف"}<input type="file" accept="image/*,video/*,.pdf" onChange={upload} disabled={uploading} /></label></div><p className="admin-note">تُحفظ الملفات في Amazon S3 وتُحفظ في قاعدة البيانات روابطها وبياناتها فقط. استخدم رقم الوسائط كغلاف أو شعار داخل نماذج المحتوى.</p>{isLoading ? <div className="admin-loading compact"><Loader2 className="animate-spin" /></div> : <div className="media-grid">{(data as any[]).map(media => <article key={media.id} className="media-card">{media.kind === "image" ? <img src={media.url} alt={media.altAr || media.originalName} /> : <div className="media-file"><Images className="h-7 w-7" /><span>{media.kind.toUpperCase()}</span></div>}<div><b>#{media.id} — {media.originalName}</b><small>{Math.ceil(media.sizeBytes / 1024)} KB · {media.mimeType}</small></div></article>)}{data.length === 0 ? <div className="admin-empty">لا توجد وسائط مرفوعة بعد.</div> : null}</div>}</section>;
}

function UsersManager() { const { data = [], isLoading } = trpc.admin.users.list.useQuery(); const utils = trpc.useUtils(); const update = trpc.admin.users.updateRole.useMutation({ onSuccess: () => { utils.admin.users.list.invalidate(); toast.success("تم تحديث الدور."); } }); return <section className="users-manager"><div className="entity-header"><div><p className="admin-eyebrow">ACCESS CONTROL</p><h2>المستخدمون والصلاحيات</h2></div></div><div className="admin-note">يمكن فقط للحسابات التي سجلت دخولها عبر Manus الظهور هنا. يملك دور المسؤول صلاحية إدارة المحتوى والوسائط.</div>{isLoading ? <div className="admin-loading compact"><Loader2 className="animate-spin" /></div> : <div className="entity-table"><div className="entity-table-head"><span>المستخدم</span><span>آخر دخول</span><span>الدور</span></div>{(data as any[]).map(user => <div className="entity-row" key={user.id}><div><b>{user.name || "—"}</b><small>{user.email || user.openId}</small></div><small>{new Date(user.lastSignedIn).toLocaleDateString("ar-IQ")}</small><select value={user.role} onChange={event => update.mutate({ id: user.id, role: event.target.value as "admin" | "user" })}><option value="admin">مسؤول</option><option value="user">مستخدم</option></select></div>)}</div>}</section>; }

function SettingsManager() {
  const { data = [], isLoading } = trpc.admin.settings.list.useQuery();
  const utils = trpc.useUtils();
  const companySetting = data.find(item => item.key === "company");
  const initial = (companySetting?.value ?? {}) as Record<string, string>;
  const [values, setValues] = useState<Record<string, string>>({});
  const save = trpc.admin.settings.save.useMutation({ onSuccess: () => { utils.admin.settings.list.invalidate(); toast.success("تم حفظ إعدادات الموقع."); }, onError: () => toast.error("تعذر حفظ الإعدادات.") });
  const field = (key: string) => values[key] ?? initial[key] ?? "";
  if (isLoading) return <div className="admin-loading compact"><Loader2 className="animate-spin" /></div>;
  return <section className="settings-manager"><div className="entity-header"><div><p className="admin-eyebrow">SITE SETTINGS</p><h2>إعدادات الشركة والموقع</h2></div></div><p className="admin-note">تتحكم هذه الحقول باسم الشركة والشعار النصي ورقم واتساب الظاهر في الموقع. لإدارة عنوان ووصف البحث لكل صفحة، انتقل إلى «الصفحات وSEO» ضمن المحتوى.</p><form className="settings-form" onSubmit={event => { event.preventDefault(); save.mutate({ key: "company", value: { ...initial, ...values } }); }}><div className="editor-grid"><EditorField field={{ key: "nameAr", label: "اسم الشركة بالعربية", required: true }} value={field("nameAr")} onChange={value => setValues(prev => ({ ...prev, nameAr: value }))} /><EditorField field={{ key: "nameEn", label: "اسم الشركة بالإنجليزية", required: true }} value={field("nameEn")} onChange={value => setValues(prev => ({ ...prev, nameEn: value }))} /><EditorField field={{ key: "taglineAr", label: "الشعار النصي بالعربية", required: true }} value={field("taglineAr")} onChange={value => setValues(prev => ({ ...prev, taglineAr: value }))} /><EditorField field={{ key: "taglineEn", label: "Tagline in English", required: true }} value={field("taglineEn")} onChange={value => setValues(prev => ({ ...prev, taglineEn: value }))} /><EditorField field={{ key: "whatsapp", label: "رقم واتساب (دولي دون +)", required: true }} value={field("whatsapp")} onChange={value => setValues(prev => ({ ...prev, whatsapp: value }))} /></div><button className="admin-primary" disabled={save.isPending}>{save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}حفظ الإعدادات</button></form></section>;
}

function toDataUrl(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = reject; reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file); }); }
