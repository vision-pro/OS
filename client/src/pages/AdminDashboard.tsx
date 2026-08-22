import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { notifyPublicContentUpdated } from "@/lib/publication";
import { formatBytes, getUploadLimit, isAllowedMediaFile, uploadMediaFile } from "@/lib/mediaUpload";
import { normalizeMediaIds, toggleProjectMediaId } from "@/lib/projectMediaSelection";
import { pageTemplates } from "@/lib/pageTemplates";
import {
  BarChart3,
  CheckCircle2,
  Eye,
  FileText,
  FolderKanban,
  ImagePlus,
  Images,
  LayoutPanelTop,
  Loader2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  Video,
  EyeOff,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type Tab = "overview" | "content" | "media" | "review" | "requests" | "instagram" | "settings";
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
    { key: "slug", label: "الرابط المختصر (اختياري)" }, { key: "titleAr", label: "العنوان بالعربية", required: true }, { key: "titleEn", label: "العنوان بالإنجليزية (اختياري)" },
    { key: "summaryAr", label: "ملخص عربي", type: "textarea" }, { key: "summaryEn", label: "English summary", type: "textarea" }, { key: "descriptionAr", label: "الوصف العربي", type: "textarea" }, { key: "descriptionEn", label: "English description", type: "textarea" },
    { key: "clientName", label: "اسم العميل" }, { key: "projectDate", label: "تاريخ المشروع" },
    { key: "status", label: "الحالة", type: "select", options: [["draft", "مسودة"], ["published", "منشور"], ["archived", "مؤرشف"]] }, { key: "displayLocation", label: "مكان ظهور المشروع", type: "select", options: [["both", "السلايد شو وشبكة الأعمال"], ["carousel", "السلايد شو فقط"], ["grid", "شبكة الأعمال فقط"]] }, { key: "isFeatured", label: "عمل مختار", type: "checkbox" },
    { key: "seoTitleAr", label: "عنوان SEO بالعربية" }, { key: "seoTitleEn", label: "SEO title in English" }, { key: "seoDescriptionAr", label: "وصف SEO بالعربية", type: "textarea" }, { key: "seoDescriptionEn", label: "SEO description in English", type: "textarea" }, { key: "seoKeywords", label: "الكلمات المفتاحية" },
  ],
  categories: [{ key: "slug", label: "الرابط المختصر (اختياري)" }, { key: "titleAr", label: "العنوان بالعربية", required: true }, { key: "titleEn", label: "العنوان بالإنجليزية (اختياري)" }, { key: "descriptionAr", label: "الوصف العربي", type: "textarea" }, { key: "descriptionEn", label: "English description", type: "textarea" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isActive", label: "نشط", type: "checkbox" }],
  services: [{ key: "slug", label: "الرابط المختصر (اختياري)" }, { key: "titleAr", label: "العنوان بالعربية", required: true }, { key: "titleEn", label: "العنوان بالإنجليزية (اختياري)" }, { key: "summaryAr", label: "الملخص العربي", type: "textarea" }, { key: "summaryEn", label: "English summary", type: "textarea" }, { key: "descriptionAr", label: "الوصف العربي", type: "textarea" }, { key: "descriptionEn", label: "English description", type: "textarea" }, { key: "icon", label: "أيقونة الخدمة", type: "select", options: [["Clapperboard", "إنتاج سينمائي"], ["Palette", "هوية بصرية"], ["Sparkles", "إنتاج فعاليات"], ["WandSparkles", "محتوى بالذكاء الاصطناعي"], ["Camera", "تصوير"], ["Mic", "تسجيل صوتي"]] }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isActive", label: "نشط", type: "checkbox" }],
  achievements: [{ key: "titleAr", label: "العنوان بالعربية", required: true }, { key: "titleEn", label: "العنوان بالإنجليزية (اختياري)" }, { key: "descriptionAr", label: "الوصف العربي", type: "textarea" }, { key: "descriptionEn", label: "English description", type: "textarea" }, { key: "achievementDate", label: "تاريخ الإنجاز" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isPublished", label: "منشور", type: "checkbox" }],
  clients: [{ key: "nameAr", label: "الاسم بالعربية", required: true }, { key: "nameEn", label: "الاسم بالإنجليزية", required: true }, { key: "websiteUrl", label: "رابط الموقع" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isActive", label: "نشط", type: "checkbox" }],
  partners: [{ key: "nameAr", label: "الاسم بالعربية", required: true }, { key: "nameEn", label: "الاسم بالإنجليزية", required: true }, { key: "websiteUrl", label: "رابط الموقع" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isActive", label: "نشط", type: "checkbox" }],
  testimonials: [{ key: "authorName", label: "اسم صاحب الشهادة", required: true }, { key: "authorRoleAr", label: "الصفة بالعربية" }, { key: "authorRoleEn", label: "Role in English" }, { key: "quoteAr", label: "الشهادة بالعربية", type: "textarea", required: true }, { key: "quoteEn", label: "Testimonial in English (اختياري)", type: "textarea" }, { key: "sourceUrl", label: "رابط المصدر الموثق" }, { key: "isVerified", label: "موثقة", type: "checkbox" }, { key: "isPublished", label: "منشورة", type: "checkbox" }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }],
  faqs: [{ key: "questionAr", label: "السؤال بالعربية", type: "textarea", required: true }, { key: "questionEn", label: "Question in English (اختياري)", type: "textarea" }, { key: "answerAr", label: "الإجابة بالعربية", type: "textarea", required: true }, { key: "answerEn", label: "Answer in English (اختياري)", type: "textarea" }, { key: "category", label: "التصنيف", type: "select", options: [["general", "عام"], ["services", "الخدمات"], ["booking", "الحجز"], ["production", "الإنتاج"], ["pricing", "الأسعار"], ["other", "أخرى"]] }, { key: "sortOrder", label: "ترتيب العرض", type: "number" }, { key: "isPublished", label: "منشور", type: "checkbox" }],
  pages: [{ key: "slug", label: "الرابط المختصر (اختياري)" }, { key: "template", label: "نوع الصفحة", required: true, type: "select", options: [["landing", "الصفحة الرئيسية"], ["portfolio", "معرض الأعمال"], ["services", "الخدمات"], ["about", "من نحن"], ["contact", "تواصل معنا"], ["standard", "صفحة محتوى عامة"]] }, { key: "titleAr", label: "عنوان الصفحة بالعربية", required: true }, { key: "titleEn", label: "Page title in English (اختياري)" }, { key: "heroTitleAr", label: "عنوان الواجهة بالعربية" }, { key: "heroTitleEn", label: "Hero title in English" }, { key: "heroTextAr", label: "نص الواجهة بالعربية", type: "textarea" }, { key: "heroTextEn", label: "Hero text in English", type: "textarea" }, { key: "showInNavigation", label: "إظهار في القائمة", type: "checkbox" }, { key: "navigationOrder", label: "ترتيب القائمة", type: "number" }, { key: "status", label: "الحالة", type: "select", options: [["draft", "مسودة"], ["published", "منشور"], ["archived", "مؤرشف"]] }, { key: "seoTitleAr", label: "عنوان SEO بالعربية" }, { key: "seoTitleEn", label: "SEO title in English" }, { key: "seoDescriptionAr", label: "وصف SEO بالعربية", type: "textarea" }, { key: "seoDescriptionEn", label: "SEO description in English", type: "textarea" }, { key: "seoKeywords", label: "الكلمات المفتاحية" }],
};

const singleMediaFieldByEntity: Partial<Record<Entity, { key: string; title: string; description: string }>> = {
  services: { key: "coverMediaId", title: "غلاف الخدمة", description: "اختر صورة أو فيديو لتمثيل الخدمة في الواجهة." },
  achievements: { key: "mediaId", title: "وسيط الإنجاز", description: "أرفق الصورة أو الفيديو الذي يوثق الإنجاز." },
  clients: { key: "logoMediaId", title: "شعار العميل", description: "اختر شعار العميل من مكتبة الوسائط." },
  partners: { key: "logoMediaId", title: "شعار الشريك", description: "اختر شعار الجهة الشريكة من مكتبة الوسائط." },
  testimonials: { key: "avatarMediaId", title: "صورة صاحب الشهادة", description: "أرفق صورة حقيقية عند توفرها، أو اتركها فارغة." },
  pages: { key: "heroMediaId", title: "وسيط واجهة الصفحة", description: "اختر الصورة أو الفيديو الذي يظهر في بداية الصفحة." },
};

const editorSectionOrder = [
  { id: "core", title: "المعلومات الأساسية", keys: ["slug", "titleAr", "titleEn", "nameAr", "nameEn", "authorName", "questionAr", "questionEn", "template"] },
  { id: "details", title: "التفاصيل والمحتوى", keys: ["summaryAr", "summaryEn", "descriptionAr", "descriptionEn", "quoteAr", "quoteEn", "answerAr", "answerEn", "authorRoleAr", "authorRoleEn", "clientName", "projectDate", "achievementDate", "websiteUrl", "sourceUrl", "icon", "category"] },
  { id: "visibility", title: "الظهور والترتيب", keys: ["status", "displayLocation", "isFeatured", "isActive", "isPublished", "isVerified", "showInNavigation", "navigationOrder", "sortOrder"] },
  { id: "seo", title: "إعدادات البحث (SEO)", keys: ["seoTitleAr", "seoTitleEn", "seoDescriptionAr", "seoDescriptionEn", "seoKeywords"] },
];

function makeInitialValues(entity: Entity, row?: Record<string, any>): FormValues {
  const values: FormValues = {};
  fieldsByEntity[entity].forEach(field => {
    const defaultChecked = field.type === "checkbox" && field.key === "isActive" && ["categories", "services", "clients", "partners"].includes(entity);
    values[field.key] = row?.[field.key] ?? (field.type === "checkbox" ? defaultChecked : field.type === "select" ? field.options?.[0]?.[0] ?? "" : field.type === "number" ? "" : "");
  });
  return values;
}

function valueLabel(row: Record<string, any>) { return row.titleAr || row.nameAr || row.authorName || row.questionAr || row.slug || `#${row.id}`; }

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const { user, loading } = useAuth();
  if (loading) return <div className="admin-loading"><Loader2 className="animate-spin" /></div>;
  if (!user) return <DashboardLayout><div /></DashboardLayout>;
  if (user.role !== "admin") return <DashboardLayout><div className="access-denied"><ShieldCheck className="h-8 w-8" /><h1>هذه المساحة للمسؤولين فقط</h1><p>سجّل الدخول بالحساب المعيّن كمسؤول لإدارة محتوى الموقع.</p></div></DashboardLayout>;

  const tabs = [{ id: "overview", label: "نظرة عامة", icon: BarChart3 }, { id: "content", label: "المحتوى", icon: FileText }, { id: "media", label: "الوسائط", icon: Images }, { id: "review", label: "مراجعة ونشر", icon: CheckCircle2 }, { id: "requests", label: "صندوق الوارد", icon: Mail }, { id: "instagram", label: "Instagram", icon: Video }, { id: "settings", label: "الإعدادات", icon: Settings2 }] as Array<any>;
  const activeTab = tabs.find(item => item.id === tab);
  return <DashboardLayout><main className="admin-page vision-admin-workspace" dir="rtl"><header className="admin-header admin-command-header"><div className="admin-header-copy"><p className="admin-eyebrow">VISION PRODUCTION / CONTROL ROOM</p><h1>{activeTab?.label || "لوحة إدارة المحتوى"}</h1><p>مسار عمل واضح: أضف الوسائط، أنشئ المحتوى، راجعه، ثم انشره للزوار.</p></div><div className="admin-header-actions"><span className="admin-live-chip"><i />الموقع متصل</span><a href="/" target="_blank" rel="noreferrer" className="admin-public-link">معاينة الموقع <ArrowUpIcon /></a></div></header><div className="admin-workflow" aria-label="تدفق النشر"><span>1. الوسائط</span><span>2. المحتوى</span><span>3. المراجعة</span><span>4. النشر</span></div><nav className="admin-tabs" aria-label="أقسام لوحة التحكم"><span className="admin-tabs-label">مساحة العمل</span><div className="admin-tabs-scroll">{tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={cn(tab === item.id && "active")}><item.icon className="h-4 w-4" /><span>{item.label}</span></button>)}</div></nav>{tab === "overview" && <Overview onChangeTab={setTab} />}{tab === "content" && <ContentManager />}{tab === "review" && <ReviewManager />}{tab === "requests" && <RequestsManager />}{tab === "media" && <MediaManager />}{tab === "instagram" && <InstagramManager />}{tab === "settings" && <SettingsManager />}</main></DashboardLayout>;
}

function ArrowUpIcon() { return <span aria-hidden="true">↗</span>; }

function Overview({ onChangeTab }: { onChangeTab: (tab: Tab) => void }) {
  const { data, isLoading } = trpc.admin.overview.useQuery();
  const stats = [{ label: "المشاريع", caption: "أعمالك في الموقع", value: data?.projects ?? 0, icon: FolderKanban, tab: "content" as Tab }, { label: "طلبات الحجز", caption: "تحتاج إلى متابعة", value: data?.bookings ?? 0, icon: MessageCircle, tab: "requests" as Tab }, { label: "رسائل التواصل", caption: "من الزوار والعملاء", value: data?.contacts ?? 0, icon: Mail, tab: "requests" as Tab }, { label: "مكتبة الوسائط", caption: "صور وفيديوهات موثقة", value: data?.media ?? 0, icon: Images, tab: "media" as Tab }];
  return <section className="admin-overview"><div className="admin-overview-intro"><div><p className="admin-eyebrow">TODAY AT A GLANCE</p><h2>كل ما يحتاجه فريقك، مرتب حسب المهمة التالية.</h2></div><p>ابدأ بمراجعة الطلبات، ثم أضف الوسائط أو حدّث المحتوى المنشور. أي تغيير معتمد ينعكس مباشرةً على الموقع العام.</p></div><div className="admin-stat-grid">{stats.map(stat => <button key={stat.label} onClick={() => onChangeTab(stat.tab)} className="admin-stat"><span><stat.icon className="h-5 w-5" /></span><div><small>{stat.caption}</small><b>{isLoading ? "—" : stat.value}</b><p>{stat.label}</p></div><ArrowUpIcon /></button>)}</div><div className="admin-action-grid"><button className="admin-action-card primary" onClick={() => onChangeTab("content")}><span><Plus className="h-5 w-5" /></span><div><b>أضف محتوى جديداً</b><small>أنشئ مشروعاً أو خدمة أو إنجازاً ثم انشره عند الجاهزية.</small></div><ArrowUpIcon /></button><button className="admin-action-card" onClick={() => onChangeTab("media")}><span><Upload className="h-5 w-5" /></span><div><b>ارفع وسائطك</b><small>ارفع الفيديوهات والصور إلى المكتبة السحابية بأمان.</small></div><ArrowUpIcon /></button><button className="admin-action-card" onClick={() => onChangeTab("requests")}><span><Mail className="h-5 w-5" /></span><div><b>تابع الطلبات</b><small>راجع الحجوزات ورسائل التواصل ورتّب حالتها.</small></div><ArrowUpIcon /></button></div><div className="admin-welcome"><div><p className="admin-eyebrow">قاعدة النشر</p><h2>احفظ أولاً، ثم انشر بثقة.</h2><p>لا تظهر المسودات للزوار. اعتمد كل عنصر فقط بعد اكتمال النص العربي والإنجليزي وربط الوسائط المناسبة.</p></div><button className="admin-primary" onClick={() => onChangeTab("content")}><FileText className="h-4 w-4" />فتح إدارة المحتوى</button></div></section>;
}

function ContentManager() {
  const [entity, setEntity] = useState<Entity>("projects");
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [query, setQuery] = useState("");
  const { data = [], isLoading } = trpc.admin.content.list.useQuery(entity);
  const utils = trpc.useUtils();
  const save = trpc.admin.content.save.useMutation({ onSuccess: result => { utils.admin.content.list.invalidate(entity); utils.site.data.invalidate(); notifyPublicContentUpdated(); if (result.syncWarning) toast.warning(result.syncWarning); else toast.success("تم حفظ العنصر وتحديث الموقع العام."); setEditing(null); }, onError: error => toast.error(error.message || "تعذر حفظ العنصر.") });
  const setPublication = trpc.admin.content.setPublication.useMutation({ onSuccess: result => { utils.admin.content.list.invalidate(entity); utils.site.data.invalidate(); notifyPublicContentUpdated(); if (result.syncWarning) toast.warning(result.syncWarning); else toast.success(result.published ? "تم النشر وهو ظاهر الآن في الموقع العام." : "تم إلغاء النشر وإخفاء العنصر من الموقع العام."); }, onError: error => toast.error(error.message || "تعذر تحديث حالة النشر.") });
  const remove = trpc.admin.content.remove.useMutation({ onSuccess: () => { utils.admin.content.list.invalidate(entity); toast.success("تم حذف العنصر."); }, onError: () => toast.error("تعذر حذف العنصر.") });
  const selected = entities.find(item => item.id === entity)!;
  const rows = (data as Record<string, any>[]).filter(row => `${valueLabel(row)} ${row.slug || ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="content-manager content-studio"><aside className="entity-sidebar"><div className="entity-sidebar-head"><p className="admin-eyebrow">CONTENT TYPES</p><b>أنواع المحتوى</b><small>اختر ما تريد إدارته</small></div>{entities.map(item => <button key={item.id} onClick={() => { setEntity(item.id); setEditing(null); setQuery(""); }} className={cn(entity === item.id && "active")}><item.icon className="h-4 w-4" /><span>{item.label}</span></button>)}</aside><div className="entity-content"><div className="entity-header"><div><p className="admin-eyebrow">{selected.label}</p><h2>{selected.hint}</h2><p>أضف عنصراً جديداً أو عدّل عنصراً قائماً، ثم انشره عندما يصبح جاهزاً للزوار.</p></div><button className="admin-primary" onClick={() => setEditing({})}><Plus className="h-4 w-4" />إضافة {selected.label}</button></div><div className="content-list-tools"><label><Search className="h-4 w-4" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder={`ابحث في ${selected.label}`} /></label><span>{isLoading ? "جارٍ التحميل…" : `${rows.length} عنصر`}</span></div>{isLoading ? <div className="admin-loading compact"><Loader2 className="animate-spin" /></div> : <div className="entity-table"><div className="entity-table-head"><span>العنصر</span><span>الحالة</span><span>إجراءات مباشرة</span></div>{rows.map(row => { const published = isEntityPublished(entity, row); return <div className="entity-row" key={row.id}><div><b>{valueLabel(row)}</b><small>{row.slug ? `/${row.slug}` : row.titleEn || row.nameEn || "عنصر محتوى"}</small></div><div><StatusBadge row={row} /></div><div className="entity-actions"><button className="edit-action" onClick={() => setEditing(row)}><Pencil className="h-3.5 w-3.5" />تعديل</button><button className={cn("publication-button", published && "unpublish")} disabled={setPublication.isPending} onClick={() => setPublication.mutate({ entity, id: row.id, published: !published })}>{published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{published ? "إخفاء" : "نشر"}</button><button aria-label="حذف" title="حذف" className="danger" onClick={() => { if (confirm(`هل تريد حذف ${valueLabel(row)}؟`)) remove.mutate({ entity, id: row.id }); }}><Trash2 className="h-4 w-4" /></button></div></div>; })}{rows.length === 0 ? <div className="admin-empty">{query ? "لا توجد نتائج مطابقة للبحث." : `لا توجد ${selected.label} بعد. استخدم زر الإضافة لبدء أول عنصر.`}</div> : null}</div>}</div>{editing !== null ? <ContentEditor entity={entity} initial={editing} saving={save.isPending} onClose={() => setEditing(null)} onSave={(values) => save.mutate({ entity, id: editing.id, values })} /> : null}</section>;
}

function ReviewManager() {
  const [entity, setEntity] = useState<Entity>("projects");
  const { data = [], isLoading } = trpc.admin.content.list.useQuery(entity);
  const utils = trpc.useUtils();
  const publish = trpc.admin.content.setPublication.useMutation({ onSuccess: () => { utils.admin.content.list.invalidate(entity); utils.site.data.invalidate(); notifyPublicContentUpdated(); toast.success("تم نشر العنصر وتحديث الواجهة العامة."); }, onError: error => toast.error(error.message || "تعذر نشر العنصر.") });
  const pending = (data as Record<string, any>[]).filter(row => !isEntityPublished(entity, row));
  return <section className="review-manager"><div className="entity-header"><div><p className="admin-eyebrow">REVIEW & PUBLISH</p><h2>راجع المسودات قبل اعتمادها</h2><p className="admin-note">اختر نوع المحتوى، راجع المسودات، ثم انشر العنصر المعتمد. لا يظهر أي محتوى في الموقع قبل هذه الخطوة.</p></div><select className="content-select" value={entity} onChange={event => setEntity(event.target.value as Entity)}>{entities.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>{isLoading ? <div className="admin-loading compact"><Loader2 className="animate-spin" /></div> : <div className="review-list">{pending.map(row => <article className="review-card" key={row.id}><div><span className="review-type">{entities.find(item => item.id === entity)?.label}</span><h3>{valueLabel(row)}</h3><p>{row.summaryAr || row.descriptionAr || row.quoteAr || row.slug || "بانتظار مراجعة تفاصيل المحتوى."}</p></div><div className="review-actions"><a className="admin-ghost" href="/" target="_blank" rel="noreferrer">معاينة الموقع <ArrowUpIcon /></a><button className="admin-primary" disabled={publish.isPending} onClick={() => publish.mutate({ entity, id: row.id, published: true })}>{publish.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}نشر</button></div></article>)}{pending.length === 0 ? <div className="admin-empty">لا توجد مسودات في هذا القسم حالياً.</div> : null}</div>}</section>;
}

function StatusBadge({ row }: { row: Record<string, any> }) { const active = row.status === "published" || row.isActive || row.isPublished; const text = row.status ? ({ published: "منشور", draft: "مسودة", archived: "مؤرشف" } as Record<string, string>)[row.status] : active ? "نشط" : "غير منشور"; return <span className={cn("status-badge", active && "active")}>{text}</span>; }
function isEntityPublished(entity: Entity, row: Record<string, any>) { return ["projects", "pages"].includes(entity) ? row.status === "published" : ["achievements", "testimonials", "faqs"].includes(entity) ? row.isPublished === true : row.isActive === true; }

function ContentEditor({ entity, initial, saving, onClose, onSave }: { entity: Entity; initial: Record<string, any>; saving: boolean; onClose: () => void; onSave: (values: Record<string, unknown>) => void }) {
  const [values, setValues] = useState<FormValues>(() => makeInitialValues(entity, initial));
  const { data: media = [], isLoading: mediaLoading } = trpc.admin.media.list.useQuery();
  const { data: categories = [], isLoading: categoriesLoading } = trpc.admin.content.list.useQuery("categories");
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>(() => normalizeMediaIds(initial.mediaIds));
  const [coverMediaId, setCoverMediaId] = useState<number | null>(() => Number(initial.coverMediaId) || null);
  const [posterMediaId, setPosterMediaId] = useState<number | null>(() => Number(initial.posterMediaId) || null);
  const singleMediaField = singleMediaFieldByEntity[entity];
  const [singleMediaId, setSingleMediaId] = useState<number | null>(() => singleMediaField ? Number(initial[singleMediaField.key]) || null : null);
  const [categoryId, setCategoryId] = useState<number | null>(() => Number(initial.categoryId) || null);
  const sections = editorSectionOrder.map(section => ({ ...section, fields: fieldsByEntity[entity].filter(field => section.keys.includes(field.key)) })).filter(section => section.fields.length > 0);
  function submit(event: FormEvent) { event.preventDefault(); const clean: Record<string, unknown> = {}; fieldsByEntity[entity].forEach(field => { const value = values[field.key]; if (field.type === "number") clean[field.key] = value === "" ? null : Number(value); else clean[field.key] = value; }); if (entity === "projects") { clean.categoryId = categoryId; clean.coverMediaId = coverMediaId; clean.posterMediaId = posterMediaId; clean.mediaIds = selectedMediaIds; } if (singleMediaField) clean[singleMediaField.key] = singleMediaId; onSave(clean); }
  return <div className="admin-modal-layer"><form className="admin-modal" onSubmit={submit}><div className="modal-head"><div><p className="admin-eyebrow">{initial.id ? "تعديل" : "إضافة"}</p><h2>{entities.find(item => item.id === entity)?.label}</h2></div><button type="button" onClick={onClose}><X className="h-5 w-5" /></button></div><div className="editor-stack">{sections.map((section, index) => <EditorSection key={section.id} title={section.title} open={index < 2}>{section.fields.map(field => <EditorField key={field.key} field={field} value={values[field.key]} onChange={(value) => setValues(prev => ({ ...prev, [field.key]: value }))} />)}</EditorSection>)}{entity === "projects" ? <><ProjectCategoryPicker categories={categories as Record<string, any>[]} loading={categoriesLoading} selectedId={categoryId} onSelect={setCategoryId} /><ProjectMediaPicker media={media as Record<string, any>[]} loading={mediaLoading} selectedIds={selectedMediaIds} coverId={coverMediaId} posterId={posterMediaId} onToggle={id => { setSelectedMediaIds(current => { const next = toggleProjectMediaId(current, id); if (!next.includes(id) && coverMediaId === id) setCoverMediaId(null); if (!next.includes(id) && posterMediaId === id) setPosterMediaId(null); return next; }); }} onSetCover={id => { setCoverMediaId(id); setSelectedMediaIds(current => current.includes(id) ? current : [...current, id]); }} onSetPoster={id => { setPosterMediaId(id); setSelectedMediaIds(current => current.includes(id) ? current : [...current, id]); }} /></> : null}{singleMediaField ? <SingleMediaPicker media={media as Record<string, any>[]} loading={mediaLoading} selectedId={singleMediaId} onSelect={setSingleMediaId} {...singleMediaField} /> : null}</div><div className="modal-actions"><button type="button" className="admin-ghost" onClick={onClose}>إلغاء</button><button className="admin-primary" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{initial.id ? "حفظ التعديلات" : "إنشاء العنصر"}</button></div></form></div>;
}

function EditorSection({ title, open, children }: { title: string; open: boolean; children: React.ReactNode }) { return <details className="editor-section" open={open}><summary>{title}<span>عرض الحقول</span></summary><div className="editor-grid">{children}</div></details>; }

function ProjectCategoryPicker({ categories, loading, selectedId, onSelect }: { categories: Record<string, any>[]; loading: boolean; selectedId: number | null; onSelect: (id: number | null) => void }) { return <section className="visual-picker category-picker"><div><p className="admin-eyebrow">PROJECT CATEGORY</p><h3>تصنيف المشروع</h3><p>اختر التصنيف الذي سيظهر به المشروع للزوار.</p></div><div className="category-option-row"><button type="button" className={cn("category-option", !selectedId && "selected")} onClick={() => onSelect(null)}>بدون تصنيف</button>{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : categories.map(category => <button type="button" key={category.id} className={cn("category-option", selectedId === category.id && "selected")} onClick={() => onSelect(category.id)}>{category.titleAr}</button>)}</div></section>; }

function ProjectMediaPicker({ media, loading, selectedIds, coverId, posterId, onToggle, onSetCover, onSetPoster }: { media: Record<string, any>[]; loading: boolean; selectedIds: number[]; coverId: number | null; posterId: number | null; onToggle: (id: number) => void; onSetCover: (id: number) => void; onSetPoster: (id: number) => void }) {
  return <section className="project-media-picker"><div><p className="admin-eyebrow">PROJECT MEDIA</p><h3>اختر فيديو أو صورة للمشروع</h3><p>ارفق الوسائط، عيّن الغلاف الذي يظهر في البطاقة، واختر صورة مصغرة للفيديو عند الحاجة. لا تحتاج إلى كتابة أي أرقام.</p></div>{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="project-media-grid">{media.map(item => { const attached = selectedIds.includes(item.id); const cover = coverId === item.id; const poster = posterId === item.id; return <article className={cn("project-media-choice", attached && "attached", cover && "cover", poster && "poster")} key={item.id}>{item.kind === "image" ? <img src={item.url} alt={item.altAr || item.originalName} /> : <div className="media-file"><Video className="h-6 w-6" /><span>{item.kind === "video" ? "VIDEO" : item.kind.toUpperCase()}</span></div>}<div className="project-media-meta"><b>{item.originalName}</b><small>{formatBytes(item.sizeBytes)}</small></div><div className="project-media-actions project-media-actions-triple"><button type="button" className="admin-ghost" onClick={() => onToggle(item.id)}>{attached ? "إزالة" : "إرفاق"}</button><button type="button" className={cn("admin-ghost", cover && "selected-cover")} onClick={() => onSetCover(item.id)}>{cover ? "غلاف" : "غلاف"}</button><button type="button" className={cn("admin-ghost", poster && "selected-poster")} onClick={() => onSetPoster(item.id)}>{poster ? "مصغرة" : "مصغرة"}</button></div></article>; })}{media.length === 0 ? <div className="admin-empty">ارفع الفيديو أو الصورة أولاً من مكتبة الوسائط.</div> : null}</div>}</section>;
}

function SingleMediaPicker({ media, loading, selectedId, onSelect, title, description }: { media: Record<string, any>[]; loading: boolean; selectedId: number | null; onSelect: (id: number | null) => void; title: string; description: string }) { return <section className="visual-picker single-media-picker"><div><p className="admin-eyebrow">MEDIA SELECTION</p><h3>{title}</h3><p>{description}</p></div>{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="project-media-grid"><button type="button" className={cn("media-none-option", !selectedId && "selected")} onClick={() => onSelect(null)}>بدون وسائط</button>{media.map(item => <button type="button" className={cn("project-media-choice", selectedId === item.id && "selected")} key={item.id} onClick={() => onSelect(item.id)}>{item.kind === "image" ? <img src={item.url} alt={item.altAr || item.originalName} /> : <div className="media-file"><Video className="h-6 w-6" /><span>{item.kind === "video" ? "VIDEO" : item.kind.toUpperCase()}</span></div>}<div className="project-media-meta"><b>{item.originalName}</b><small>{selectedId === item.id ? "محدّد" : formatBytes(item.sizeBytes)}</small></div></button>)}</div>}</section>; }

function PageTemplatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <section className="page-template-picker"><div><Label>اختر شكل الصفحة *</Label><p>حدد الغرض من الصفحة بصرياً؛ سيظهر النموذج المناسب عند حفظ المحتوى.</p></div><div className="page-template-grid" role="radiogroup" aria-label="اختر قالب الصفحة">{pageTemplates.map(template => <button type="button" role="radio" aria-checked={value === template.value} key={template.value} className={cn("page-template-card", value === template.value && "selected")} onClick={() => onChange(template.value)}><b>{template.label}</b><small>{template.description}</small></button>)}</div></section>;
}

function EditorField({ field, value, onChange }: { field: any; value: any; onChange: (value: any) => void }) {
  if (field.key === "template") return <PageTemplatePicker value={String(value || "landing")} onChange={onChange} />;
  return <div className={cn("editor-field", field.type === "textarea" && "wide", field.type === "checkbox" && "checkbox-field")}><Label>{field.label}{field.required ? " *" : ""}</Label>{field.type === "textarea" ? <Textarea required={field.required} value={String(value ?? "")} onChange={event => onChange(event.target.value)} /> : field.type === "checkbox" ? <button type="button" onClick={() => onChange(!value)} className={cn("toggle", value && "on")}><span />{value ? "مفعّل" : "غير مفعّل"}</button> : field.type === "select" ? <select value={String(value || field.options?.[0]?.[0] || "")} onChange={event => onChange(event.target.value)}>{field.options?.map(([val, label]: [string, string]) => <option key={val} value={val}>{label}</option>)}</select> : <Input type={field.type === "number" ? "number" : "text"} required={field.required} value={String(value ?? "")} onChange={event => onChange(event.target.value)} />}</div>;
}

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const remove = trpc.admin.media.remove.useMutation({ onSuccess: () => { utils.admin.media.list.invalidate(); toast.success("تم حذف الوسائط غير المرتبطة."); }, onError: error => toast.error(error.message || "تعذر حذف الوسائط.") });
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isAllowedMediaFile(file)) { toast.error("صيغة الملف غير مدعومة. ارفع MP4 أو WebM أو MOV أو JPG أو PNG أو WebP أو SVG أو PDF."); event.target.value = ""; return; }
    const limit = getUploadLimit(file);
    if (file.size > limit) { toast.error(`حجم ${file.type.startsWith("video/") ? "الفيديو" : "الملف"} يتجاوز الحد المسموح: ${formatBytes(limit)}.`); return; }
    setUploading(true); setUploadProgress(0);
    try {
      await uploadMediaFile(file, { onProgress: setUploadProgress });
      toast.success("تم رفع الملف إلى التخزين السحابي.");
      utils.admin.media.list.invalidate();
    } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر رفع الملف. تأكد من تسجيل دخولك كمسؤول."); }
    finally { setUploading(false); setUploadProgress(0); event.target.value = ""; }
  }
  return <section className="media-manager"><div className="entity-header"><div><p className="admin-eyebrow">S3 MEDIA LIBRARY</p><h2>مكتبة الوسائط</h2></div><label className="admin-primary upload-button"><Upload className="h-4 w-4" />{uploading ? `جارٍ الرفع… ${uploadProgress}%` : "رفع ملف"}<input aria-label="اختر ملفاً لرفعه إلى مكتبة الوسائط" type="file" accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf" onChange={upload} disabled={uploading} /></label></div><p className="admin-note">الصيغ المسموحة: MP4 وWebM وMOV وJPG وPNG وWebP وSVG وPDF. يرسل المتصفح الملف بصيغة ثنائية إلى خدمة الرفع ثم يُحفظ في S3؛ حد الفيديو 500 ميجابايت، وحد الصور والمستندات 50 ميجابايت.</p>{uploading ? <div className="media-upload-progress" aria-live="polite"><div style={{ width: `${uploadProgress}%` }} /><span>{uploadProgress}% — لا تغلق الصفحة حتى يكتمل الرفع.</span></div> : null}{isLoading ? <div className="admin-loading compact"><Loader2 className="animate-spin" /></div> : <div className="media-grid">{(data as any[]).map(media => <article key={media.id} className="media-card">{media.kind === "image" ? <img src={media.url} alt={media.altAr || media.originalName} /> : <div className="media-file"><Images className="h-7 w-7" /><span>{media.kind.toUpperCase()}</span></div>}<div><b>#{media.id} — {media.originalName}</b><small>{Math.ceil(media.sizeBytes / 1024)} KB · {media.mimeType}</small></div><button className="danger media-delete" disabled={remove.isPending} onClick={() => { if (confirm("سيُحذف هذا الملف من المكتبة إذا لم يكن مرتبطاً بمحتوى. متابعة؟")) remove.mutate({ id: media.id }); }}><Trash2 className="h-4 w-4" />حذف</button></article>)}{data.length === 0 ? <div className="admin-empty">لا توجد وسائط مرفوعة بعد.</div> : null}</div>}</section>;
}

function ClientLogosManager() {
  const utils = trpc.useUtils();
  const { data: clients = [], isLoading: clientsLoading } = trpc.admin.content.list.useQuery("clients");
  const { data: media = [], isLoading: mediaLoading } = trpc.admin.media.list.useQuery();
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [uploading, setUploading] = useState(false);
  const save = trpc.admin.content.save.useMutation({ onSuccess: () => { utils.admin.content.list.invalidate("clients"); utils.site.data.invalidate(); notifyPublicContentUpdated(); toast.success("تم حفظ بيانات شعار العميل وتحديث الموقع العام."); setEditing(null); }, onError: error => toast.error(error.message || "تعذر حفظ شعار العميل.") });
  const setPublication = trpc.admin.content.setPublication.useMutation({ onSuccess: result => { utils.admin.content.list.invalidate("clients"); utils.site.data.invalidate(); notifyPublicContentUpdated(); toast.success(result.published ? "تم اعتماد الشعار وظهر في الصفحة الرئيسية." : "تم إخفاء الشعار من الصفحة الرئيسية."); }, onError: error => toast.error(error.message || "تعذر تحديث اعتماد الشعار.") });
  const remove = trpc.admin.content.remove.useMutation({ onSuccess: () => { utils.admin.content.list.invalidate("clients"); utils.site.data.invalidate(); notifyPublicContentUpdated(); toast.success("تم حذف سجل العميل."); }, onError: () => toast.error("تعذر حذف سجل العميل.") });
  const images = (media as any[]).filter(item => item.kind === "image");
  const approved = (clients as any[]).filter(client => client.isActive && client.logoMediaId).length;
  const busy = clientsLoading || mediaLoading;
  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error("الحد الأقصى لشعار العميل هو 15 ميغابايت."); return; }
    setUploading(true);
    try {
      await uploadMediaFile(file);
      await utils.admin.media.list.invalidate();
      toast.success("تم رفع الشعار. اختره الآن عند إضافة العميل.");
    } catch { toast.error("تعذر رفع الشعار. تأكد من أن الملف صورة وأن تسجيل دخول الإدارة نشط."); }
    finally { setUploading(false); event.target.value = ""; }
  }
  return (
    <section className="client-logo-manager">
      <div className="entity-header"><div><p className="admin-eyebrow">APPROVED CLIENT LOGOS</p><h2>شعارات العملاء المعتمدين</h2></div><div className="client-logo-header-actions"><label className="admin-ghost upload-button"><Upload className="h-4 w-4" />{uploading ? "جارٍ الرفع…" : "رفع شعار"}<input type="file" accept="image/*" onChange={uploadLogo} disabled={uploading} /></label><button className="admin-primary" onClick={() => setEditing({ isActive: true, sortOrder: (clients as any[]).length + 1 })}><Plus className="h-4 w-4" />إضافة شعار عميل</button></div></div>
      <div className="client-logo-intro"><div><b>{approved}</b><span>شعار معتمد للعرض في الصفحة الرئيسية</span></div><p>اختر شعاراً مرفوعاً من مكتبة الوسائط، ثم فعّل الاعتماد. لن يظهر للزوار إلا العميل الذي يملك شعاراً ويكون مفعّلاً.</p></div>
      {busy ? <div className="admin-loading compact"><Loader2 className="animate-spin" /></div> : <div className="client-logo-admin-grid">
        {(clients as any[]).map(client => {
          const logo = images.find(item => item.id === client.logoMediaId);
          const approvedClient = Boolean(client.isActive && logo?.url);
          return <article className="client-logo-admin-card" key={client.id}>
            <div className="client-logo-preview">{logo?.url ? <img src={logo.url} alt={client.nameAr || client.nameEn} /> : <ImagePlus className="h-7 w-7" />}</div>
            <div className="client-logo-card-copy"><StatusBadge row={{ isActive: approvedClient }} /><h3>{client.nameAr}</h3><small>{client.nameEn}</small><p>{logo ? `الشعار: ${logo.originalName}` : "لم يتم ربط شعار بعد"}</p></div>
            <div className="client-logo-card-actions"><button className={cn("publication-button", approvedClient && "unpublish")} disabled={setPublication.isPending || !logo?.url} title={!logo?.url ? "اربط شعاراً أولاً" : undefined} onClick={() => setPublication.mutate({ entity: "clients", id: client.id, published: !approvedClient })}>{approvedClient ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{approvedClient ? "إخفاء" : "اعتماد"}</button><button aria-label="تعديل شعار العميل" onClick={() => setEditing(client)}><MoreHorizontal className="h-4 w-4" /></button><button aria-label="حذف العميل" className="danger" onClick={() => { if (confirm("هل تريد حذف سجل هذا العميل؟")) remove.mutate({ entity: "clients", id: client.id }); }}><Trash2 className="h-4 w-4" /></button></div>
          </article>;
        })}
        {(clients as any[]).length === 0 ? <div className="client-logo-empty"><ImagePlus className="h-8 w-8" /><h3>لم تضف شعارات عملاء بعد</h3><p>ارفع شعار العميل من هنا، ثم أضفه واعتمده لعرضه في الصفحة الرئيسية.</p><button className="admin-primary" onClick={() => setEditing({ isActive: true, sortOrder: 1 })}><Plus className="h-4 w-4" />إضافة أول شعار</button></div> : null}
      </div>}
      {editing !== null ? <ClientLogoEditor initial={editing} media={images} saving={save.isPending} onClose={() => setEditing(null)} onSave={values => save.mutate({ entity: "clients", id: editing.id, values })} /> : null}
    </section>
  );
}

function ClientLogoEditor({ initial, media, saving, onClose, onSave }: { initial: Record<string, any>; media: any[]; saving: boolean; onClose: () => void; onSave: (values: Record<string, unknown>) => void }) {
  const [values, setValues] = useState({ nameAr: initial.nameAr ?? "", nameEn: initial.nameEn ?? "", logoMediaId: initial.logoMediaId ? String(initial.logoMediaId) : "", websiteUrl: initial.websiteUrl ?? "", sortOrder: String(initial.sortOrder ?? 0), isActive: initial.isActive ?? true });
  function submit(event: FormEvent) { event.preventDefault(); onSave({ nameAr: values.nameAr, nameEn: values.nameEn, logoMediaId: values.logoMediaId ? Number(values.logoMediaId) : null, websiteUrl: values.websiteUrl || null, sortOrder: Number(values.sortOrder || 0), isActive: values.isActive }); }
  const selectedLogo = media.find(item => String(item.id) === values.logoMediaId);
  return <div className="admin-modal-layer"><form className="admin-modal client-logo-modal" onSubmit={submit}><div className="modal-head"><div><p className="admin-eyebrow">{initial.id ? "تعديل شعار" : "إضافة شعار"}</p><h2>شعار عميل معتمد</h2></div><button type="button" onClick={onClose}><X className="h-5 w-5" /></button></div><div className="client-logo-editor-preview">{selectedLogo?.url ? <img src={selectedLogo.url} alt={values.nameAr || "معاينة الشعار"} /> : <ImagePlus className="h-7 w-7" />}</div><div className="editor-grid"><EditorField field={{ label: "اسم العميل بالعربية", required: true }} value={values.nameAr} onChange={value => setValues(prev => ({ ...prev, nameAr: value }))} /><EditorField field={{ label: "Client name in English", required: true }} value={values.nameEn} onChange={value => setValues(prev => ({ ...prev, nameEn: value }))} /><div className="editor-field wide"><Label>الشعار من مكتبة الوسائط *</Label><select required value={values.logoMediaId} onChange={event => setValues(prev => ({ ...prev, logoMediaId: event.target.value }))}><option value="">اختر شعاراً مرفوعاً</option>{media.map(item => <option value={item.id} key={item.id}>#{item.id} — {item.originalName}</option>)}</select><small>ارفع الشعار أولاً من تبويب «الوسائط» إذا لم يكن موجوداً في القائمة.</small></div><EditorField field={{ label: "رابط موقع العميل" }} value={values.websiteUrl} onChange={value => setValues(prev => ({ ...prev, websiteUrl: value }))} /><EditorField field={{ label: "ترتيب العرض", type: "number" }} value={values.sortOrder} onChange={value => setValues(prev => ({ ...prev, sortOrder: value }))} /><EditorField field={{ label: "اعتماد الشعار للعرض", type: "checkbox" }} value={values.isActive} onChange={value => setValues(prev => ({ ...prev, isActive: value }))} /></div><div className="modal-actions"><button type="button" className="admin-ghost" onClick={onClose}>إلغاء</button><button className="admin-primary" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{initial.id ? "حفظ الشعار" : "إضافة الشعار"}</button></div></form></div>;
}

function InstagramManager() {
  const utils = trpc.useUtils();
  const { data: config, isLoading: configLoading } = trpc.admin.instagram.config.useQuery();
  const { data: videos = [], isLoading: videosLoading } = trpc.admin.instagram.videos.useQuery();
  const sync = trpc.admin.instagram.syncNow.useMutation({ onSuccess: result => { utils.admin.instagram.videos.invalidate(); utils.admin.instagram.config.invalidate(); toast.success(`تمت مزامنة ${result.imported} فيديو. وصلت الفيديوهات كمسودات.`); }, onError: error => toast.error(error.message || "تعذرت مزامنة فيديوهات Instagram.") });
  const updateStatus = trpc.admin.instagram.setVideoStatus.useMutation({ onSuccess: () => { utils.admin.instagram.videos.invalidate(); toast.success("تم تحديث حالة الفيديو."); }, onError: () => toast.error("تعذر تحديث حالة الفيديو.") });
  const [cronExpression, setCronExpression] = useState("0 0 */6 * * *");
  const schedule = trpc.admin.instagram.setSchedule.useMutation({ onSuccess: result => { utils.admin.instagram.config.invalidate(); toast.success(result.enabled ? "تم تفعيل المزامنة الدورية." : "تم إيقاف المزامنة الدورية."); }, onError: error => toast.error(error.message || "تعذر تحديث الجدولة.") });
  const scheduleEnabled = Boolean(config?.isScheduleEnabled);
  const busy = configLoading || videosLoading;
  return <section className="instagram-manager"><div className="entity-header"><div><p className="admin-eyebrow">INSTAGRAM VIDEO SYNC</p><h2>فيديوهات الحساب الرسمي</h2></div><button className="admin-primary" disabled={sync.isPending} onClick={() => sync.mutate()}>{sync.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}مزامنة الآن</button></div><div className="admin-note">تُستورد الفيديوهات المنشورة من <b>@{config?.instagramUsername || "vision.production.iq"}</b> كمسودات فقط. اختر «نشر» لكل فيديو تريد إظهاره في الموقع؛ لا تُنسخ ملفات الفيديو إلى الموقع أو قاعدة البيانات.</div><div className="instagram-schedule"><div><b>{scheduleEnabled ? "المزامنة الدورية مفعّلة" : "المزامنة الدورية غير مفعّلة"}</b><small>{config?.lastSyncedAt ? `آخر مزامنة: ${new Date(config.lastSyncedAt).toLocaleString("ar-IQ")}` : "لم تُنفذ مزامنة بعد"}</small></div><Input value={cronExpression} onChange={event => setCronExpression(event.target.value)} aria-label="جدولة المزامنة" /><button className="admin-ghost" disabled={schedule.isPending} onClick={() => schedule.mutate({ enabled: !scheduleEnabled, cronExpression })}>{scheduleEnabled ? "إيقاف الجدولة" : "تفعيل كل 6 ساعات"}</button></div>{busy ? <div className="admin-loading compact"><Loader2 className="animate-spin" /></div> : <div className="instagram-video-grid">{(videos as any[]).map(video => <article className="instagram-video-card" key={video.id}><div className="instagram-video-top"><span className="status-badge">{video.status === "published" ? "منشور في الموقع" : video.status === "archived" ? "مؤرشف" : "بانتظار الاعتماد"}</span><a href={video.permalink} target="_blank" rel="noreferrer">فتح في Instagram ↗</a></div><p>{video.caption || "فيديو من الحساب الرسمي"}</p><small>{video.sourcePublishedAt ? new Date(video.sourcePublishedAt).toLocaleDateString("ar-IQ") : "—"}</small><div className="instagram-video-actions">{video.status !== "published" ? <button className="admin-primary" onClick={() => updateStatus.mutate({ id: video.id, status: "published" })}>نشر في الموقع</button> : <button className="admin-ghost" onClick={() => updateStatus.mutate({ id: video.id, status: "draft" })}>إلغاء النشر</button>}<button className="admin-ghost" onClick={() => updateStatus.mutate({ id: video.id, status: "archived" })}>أرشفة</button></div></article>)}{videos.length === 0 ? <div className="admin-empty">اضغط «مزامنة الآن» لجلب فيديوهات الحساب كمسودات.</div> : null}</div>}</section>;
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
  return <><section className="settings-manager"><div className="entity-header"><div><p className="admin-eyebrow">SITE SETTINGS</p><h2>إعدادات الشركة والموقع</h2></div></div><p className="admin-note">تتحكم هذه الحقول باسم الشركة والشعار النصي ورقم واتساب الظاهر في الموقع. لإدارة عنوان ووصف البحث لكل صفحة، انتقل إلى «الصفحات وSEO» ضمن «الأعمال والمحتوى».</p><form className="settings-form" onSubmit={event => { event.preventDefault(); save.mutate({ key: "company", value: { ...initial, ...values } }); }}><div className="editor-grid"><EditorField field={{ key: "nameAr", label: "اسم الشركة بالعربية", required: true }} value={field("nameAr")} onChange={value => setValues(prev => ({ ...prev, nameAr: value }))} /><EditorField field={{ key: "nameEn", label: "اسم الشركة بالإنجليزية", required: true }} value={field("nameEn")} onChange={value => setValues(prev => ({ ...prev, nameEn: value }))} /><EditorField field={{ key: "taglineAr", label: "الشعار النصي بالعربية", required: true }} value={field("taglineAr")} onChange={value => setValues(prev => ({ ...prev, taglineAr: value }))} /><EditorField field={{ key: "taglineEn", label: "Tagline in English", required: true }} value={field("taglineEn")} onChange={value => setValues(prev => ({ ...prev, taglineEn: value }))} /><EditorField field={{ key: "whatsapp", label: "رقم واتساب (دولي دون +)", required: true }} value={field("whatsapp")} onChange={value => setValues(prev => ({ ...prev, whatsapp: value }))} /></div><button className="admin-primary" disabled={save.isPending}>{save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}حفظ الإعدادات</button></form></section><UsersManager /></>;
}
