import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  Check,
  Clapperboard,
  Film,
  Globe2,
  Loader2,
  Menu,
  MessageCircle,
  Palette,
  Play,
  Send,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

type Locale = "ar" | "en";
type SitePageProps = { slug: string };

const logoUrl = "/manus-storage/logo-lockup-color_0571cac2.svg";
const markUrl = "/manus-storage/logo-mark-white_adce3db0.svg";

const labels = {
  ar: {
    work: "الأعمال",
    book: "احجز مشروعك",
    all: "الكل",
    featured: "أعمال مختارة",
    explore: "استكشف العمل",
    viewWork: "شاهد أعمالنا",
    request: "اطلب استشارة",
    services: "خدمات متصلة برؤيتك",
    servicesText: "نحوّل الأهداف إلى لغة بصرية مدروسة، من الفكرة وحتى اللقطة الأخيرة.",
    aboutKicker: "رؤية — النجف",
    aboutTitle: "اللقطة القوية لا تبدأ بالكاميرا. تبدأ بالرؤية.",
    aboutText: "نحن استوديو إنتاج إبداعي عربي أولاً. نعمل بمنهج واضح: نستمع، نتصوّر، وننفّذ بتفاصيل تحترم قيمة الفكرة.",
    process: "منهجنا",
    processText: "فهم، تصوّر، إنتاج، وأثر. خطوات متصلة لا مراحل معزولة.",
    achievement: "الإنجازات",
    achievementText: "نشارك الإنجازات المعتمدة هنا عندما تكون جاهزة للنشر.",
    clients: "العملاء والشركاء",
    clientsText: "شعارات الجهات التي نعمل معها تظهر هنا بعد اعتمادها من الشركة.",
    faq: "أسئلة شائعة",
    bookingKicker: "ابدأ من الآن",
    bookingTitle: "لنحوّل فكرتك إلى صورة تتحرّك.",
    bookingText: "أخبرنا بما تحتاجه. نحفظ طلبك في فريقنا ثم نفتح واتساب لتكمل الحوار مباشرة.",
    name: "الاسم الكامل",
    phone: "رقم الهاتف",
    company: "اسم الشركة / الجهة",
    projectType: "نوع المشروع",
    date: "الموعد المفضل",
    budget: "نطاق الميزانية",
    message: "نبذة عن الفكرة",
    sendBooking: "احفظ الطلب وافتح واتساب",
    contactTitle: "لنبدأ حواراً",
    contactText: "للاستفسارات العامة، أرسل رسالتك وسنجدها في لوحة الإدارة.",
    subject: "الموضوع",
    email: "البريد الإلكتروني (اختياري)",
    sendContact: "إرسال الرسالة",
    emptyWork: "لا توجد مشاريع منشورة حالياً",
    emptyWorkText: "أضف مشاريعك وصورها من لوحة التحكم لتظهر هنا تلقائياً.",
    emptyItems: "لا توجد عناصر منشورة حالياً.",
    loading: "جارٍ تجهيز التجربة…",
    backHome: "العودة للرئيسية",
    successBooking: "حُفظ طلبك، سنفتح واتساب الآن.",
    successContact: "تم حفظ رسالتك بنجاح.",
    contact: "تواصل",
    more: "اكتشف المزيد",
    menu: "القائمة",
    placeholderProject: "مثال: إعلان، فعالية، هوية بصرية",
    allRights: "جميع الحقوق محفوظة",
    latestVideos: "أحدث فيديوهاتنا",
    latestVideosText: "فيديوهات مختارة من الحساب الرسمي، تُعرض هنا بعد اعتمادها من الفريق.",
    watchOnInstagram: "شاهد على Instagram",
  },
  en: {
    work: "Portfolio",
    book: "Book a Project",
    all: "All",
    featured: "Selected Work",
    explore: "Explore Project",
    viewWork: "View Our Work",
    request: "Request a Consultation",
    services: "Services Connected to Your Vision",
    servicesText: "We translate objectives into thoughtful visual language, from the first idea to the final frame.",
    aboutKicker: "RU'YA — NAJAF",
    aboutTitle: "The strongest frame does not start with a camera. It starts with vision.",
    aboutText: "We are an Arabic-first creative production studio. We listen, visualise, and execute with a respect for every idea.",
    process: "Our Method",
    processText: "Understanding, visualisation, production, and impact. Connected steps, not isolated stages.",
    achievement: "Achievements",
    achievementText: "Approved achievements will be shared here as they are ready to publish.",
    clients: "Clients & Partners",
    clientsText: "Approved client and partner marks appear here when the company adds them.",
    faq: "Frequently Asked Questions",
    bookingKicker: "Start Now",
    bookingTitle: "Let’s turn your idea into a moving image.",
    bookingText: "Tell us what you need. We will save your request, then open WhatsApp so you can continue the conversation directly.",
    name: "Full Name",
    phone: "Phone Number",
    company: "Company / Organisation",
    projectType: "Project Type",
    date: "Preferred Date",
    budget: "Budget Range",
    message: "Tell Us About Your Idea",
    sendBooking: "Save Request & Open WhatsApp",
    contactTitle: "Let's Start a Conversation",
    contactText: "For general enquiries, send a message and it will be available in the dashboard.",
    subject: "Subject",
    email: "Email (optional)",
    sendContact: "Send Message",
    emptyWork: "No published projects yet",
    emptyWorkText: "Add projects and their media from the dashboard and they will appear here automatically.",
    emptyItems: "There are no published items yet.",
    loading: "Preparing the experience…",
    backHome: "Back to Home",
    successBooking: "Your request is saved. Opening WhatsApp now.",
    successContact: "Your message has been saved.",
    contact: "Contact",
    more: "Discover More",
    menu: "Menu",
    placeholderProject: "For example: campaign, event, visual identity",
    allRights: "All rights reserved",
    latestVideos: "Latest Videos",
    latestVideosText: "Selected videos from the official account, published here after team approval.",
    watchOnInstagram: "Watch on Instagram",
  },
};

function tField<T extends Record<string, any>>(item: T | undefined, key: string, locale: Locale, fallback = "") {
  if (!item) return fallback;
  return (item[`${key}${locale === "ar" ? "Ar" : "En"}`] as string | null | undefined) || fallback;
}

function ServiceIcon({ name }: { name?: string | null }) {
  const cls = "h-5 w-5";
  if (name === "Palette") return <Palette className={cls} />;
  if (name === "Sparkles") return <Sparkles className={cls} />;
  if (name === "WandSparkles") return <WandSparkles className={cls} />;
  return <Clapperboard className={cls} />;
}

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <div className="section-title max-w-2xl">
      <p className="kicker">{kicker}</p>
      <h2>{title}</h2>
      {text ? <p className="section-intro">{text}</p> : null}
    </div>
  );
}

export default function PublicSite({ slug }: SitePageProps) {
  const { data, isLoading, error } = trpc.site.data.useQuery();
  const [locale, setLocale] = useState<Locale>("ar");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [, navigate] = useLocation();
  const copy = labels[locale];
  const isAr = locale === "ar";

  const currentPage = data?.pages.find(page => page.slug === slug) ?? data?.pages.find(page => page.slug === "home");
  const navPages = useMemo(() => data?.pages.filter(page => page.showInNavigation) ?? [], [data?.pages]);
  const company = (data?.settings.find(item => item.key === "company")?.value ?? {}) as Record<string, string>;
  const filteredProjects = useMemo(
    () => data?.projects.filter(project => activeCategory === "all" || project.categoryId === Number(activeCategory)) ?? [],
    [activeCategory, data?.projects],
  );

  const booking = trpc.site.createBooking.useMutation({
    onSuccess: (_, values) => {
      toast.success(copy.successBooking);
      const service = data?.services.find(item => item.id === values.serviceId);
      const message = isAr
        ? `مرحباً رؤية، أرغب بحجز مشروع.%0Aالاسم: ${values.name}%0Aالهاتف: ${values.phone}%0Aالخدمة: ${service ? service.titleAr : values.projectType || "غير محدد"}%0Aالتفاصيل: ${values.message || "—"}`
        : `Hello Ru'ya, I would like to book a project.%0AName: ${values.name}%0APhone: ${values.phone}%0AService: ${service ? service.titleEn : values.projectType || "Not specified"}%0ADetails: ${values.message || "—"}`;
      window.open(`https://wa.me/9647760076003?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    },
    onError: () => toast.error(isAr ? "تعذر حفظ الطلب. حاول مرة أخرى." : "We could not save your request. Please try again."),
  });
  const contact = trpc.site.createContact.useMutation({
    onSuccess: () => toast.success(copy.successContact),
    onError: () => toast.error(isAr ? "تعذر حفظ الرسالة. حاول مرة أخرى." : "We could not save your message. Please try again."),
  });

  function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    booking.mutate({
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      company: String(form.get("company") || "") || undefined,
      serviceId: form.get("serviceId") ? Number(form.get("serviceId")) : undefined,
      projectType: String(form.get("projectType") || "") || undefined,
      requestedDate: String(form.get("requestedDate") || "") || undefined,
      budgetRange: String(form.get("budgetRange") || "") || undefined,
      message: String(form.get("message") || "") || undefined,
      preferredLanguage: locale,
    });
  }

  function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    contact.mutate({
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || "") || undefined,
      email: String(form.get("email") || "") || undefined,
      subject: String(form.get("subject") || "") || undefined,
      message: String(form.get("message") || ""),
      preferredLanguage: locale,
    });
  }

  if (isLoading) {
    return <div className="site-loader" dir={isAr ? "rtl" : "ltr"}><Loader2 className="h-7 w-7 animate-spin" />{copy.loading}</div>;
  }
  if (error || !data || !currentPage) {
    return <div className="site-loader" dir={isAr ? "rtl" : "ltr"}>{isAr ? "تعذّر تحميل الموقع." : "Unable to load the website."}</div>;
  }

  const heroTitle = tField(currentPage, "heroTitle", locale, tField(currentPage, "title", locale));
  const heroText = tField(currentPage, "heroText", locale);
  const arrow = isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />;

  return (
    <div className="vision-site" dir={isAr ? "rtl" : "ltr"}>
      <header className="site-header">
        <div className="container nav-inner">
          <Link href="/" className="brand-link" aria-label="Ru'ya for Artistic Production">
            <img src={logoUrl} alt="VISION Production" className="brand-logo" />
          </Link>
          <nav className="desktop-nav" aria-label={copy.menu}>
            {navPages.map(page => <Link key={page.slug} href={`/${page.slug}`} className={slug === page.slug ? "active" : ""}>{tField(page, "title", locale)}</Link>)}
          </nav>
          <div className="nav-actions">
            <button className="language-button" onClick={() => setLocale(isAr ? "en" : "ar")} aria-label="Change language"><Globe2 className="h-4 w-4" />{isAr ? "EN" : "ع"}</button>
            <button className="header-cta" onClick={() => navigate("/contact")}><MessageCircle className="h-4 w-4" />{copy.book}</button>
            <button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={copy.menu}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuOpen ? <div className="mobile-nav container">{navPages.map(page => <Link key={page.slug} href={`/${page.slug}`} onClick={() => setMenuOpen(false)}>{tField(page, "title", locale)}</Link>)}</div> : null}
      </header>

      {slug === "home" ? (
        <>
          <section className="hero-section">
            <div className="hero-mark" aria-hidden="true"><img src={markUrl} alt="" /></div>
            <div className="container hero-grid">
              <div className="hero-copy">
                <p className="kicker kicker-light">VISION PRODUCTION — NAJAF</p>
                <h1>{heroTitle}</h1>
                <p className="hero-text">{heroText}</p>
                <div className="hero-actions">
                  <button className="button button-orange" onClick={() => navigate("/portfolio")}>{copy.viewWork}{arrow}</button>
                  <button className="button button-outline-light" onClick={() => navigate("/contact")}>{copy.request}</button>
                </div>
              </div>
              <div className="showreel-frame" role="img" aria-label={isAr ? "مساحة عرض فيديو الشركة" : "Company showreel area"}>
                <div className="frame-rule" />
                <img src={markUrl} alt="" className="frame-mark" />
                <div className="frame-copy"><span>{isAr ? "فيلم الرؤية" : "RU'YA REEL"}</span><strong>01 — 2026</strong></div>
                <button className="play-button" onClick={() => navigate("/portfolio")} aria-label={isAr ? "مشاهدة الأعمال" : "View portfolio"}><Play className="h-5 w-5 fill-current" /></button>
              </div>
            </div>
          </section>
          <section className="section section-white"><div className="container"><SectionTitle kicker="01 — SERVICES" title={copy.services} text={copy.servicesText} /><div className="service-grid">{data.services.map(service => <article key={service.id} className="service-card"><div className="service-icon"><ServiceIcon name={service.icon} /></div><span className="card-index">0{service.sortOrder}</span><h3>{tField(service, "title", locale)}</h3><p>{tField(service, "summary", locale)}</p><Link href="/services" className="card-link">{copy.more}<ArrowUpLeft className="h-4 w-4" /></Link></article>)}</div></div></section>
          <section className="section section-ink"><div className="container about-grid"><div><p className="kicker kicker-light">{copy.aboutKicker}</p><h2 className="light-heading">{copy.aboutTitle}</h2></div><div className="about-copy"><p>{copy.aboutText}</p><div className="method-list"><span><b>01</b>{isAr ? "نبدأ بالاستماع" : "We begin by listening"}</span><span><b>02</b>{isAr ? "نرسم الاتجاه" : "We shape the direction"}</span><span><b>03</b>{isAr ? "ننتج بثقة" : "We produce with confidence"}</span></div><Link href="/about" className="text-link light">{copy.more}{arrow}</Link></div></div></section>
          <PortfolioSection data={data} locale={locale} copy={copy} activeCategory={activeCategory} setActiveCategory={setActiveCategory} projects={filteredProjects} />
          <InstagramVideoSection videos={data.instagramVideos} locale={locale} copy={copy} />
          <BookingSection locale={locale} copy={copy} services={data.services} onSubmit={handleBooking} isPending={booking.isPending} />
        </>
      ) : (
        <>
          <section className="inner-hero"><div className="container"><p className="kicker">VISION PRODUCTION</p><h1>{heroTitle}</h1><p>{heroText}</p></div></section>
          {slug === "about" ? <AboutSection locale={locale} copy={copy} /> : null}
          {slug === "services" ? <ServicesSection data={data} locale={locale} copy={copy} /> : null}
          {slug === "portfolio" ? <><PortfolioSection data={data} locale={locale} copy={copy} activeCategory={activeCategory} setActiveCategory={setActiveCategory} projects={filteredProjects} standalone /><InstagramVideoSection videos={data.instagramVideos} locale={locale} copy={copy} /></> : null}
          {slug === "achievements" ? <AchievementSection data={data} locale={locale} copy={copy} /> : null}
          {slug === "clients" ? <ClientSection data={data} locale={locale} copy={copy} /> : null}
          {slug === "contact" ? <ContactPage locale={locale} copy={copy} services={data.services} onBooking={handleBooking} onContact={handleContact} bookingPending={booking.isPending} contactPending={contact.isPending} /> : null}
          {!['about', 'services', 'portfolio', 'achievements', 'clients', 'contact'].includes(slug) ? <DynamicPage page={currentPage} locale={locale} copy={copy} /> : null}
        </>
      )}
      <footer className="site-footer"><div className="container footer-grid"><div><img src={logoUrl} alt="VISION Production" className="footer-logo" /><p>{company[`tagline${isAr ? "Ar" : "En"}`] || (isAr ? "نصنع الصورة التي تُروى" : "We Make the Image That Gets Told")}</p></div><div className="footer-links">{navPages.map(page => <Link key={page.slug} href={`/${page.slug}`}>{tField(page, "title", locale)}</Link>)}<a href="https://wa.me/9647760076003" target="_blank" rel="noreferrer">WhatsApp</a></div><p className="copyright">© {new Date().getFullYear()} {isAr ? company.nameAr : company.nameEn}. {copy.allRights}.</p></div></footer>
    </div>
  );
}

function PortfolioSection({ data, locale, copy, activeCategory, setActiveCategory, projects, standalone = false }: any) {
  return <section className={`section ${standalone ? "section-white" : "section-muted"}`}><div className="container"><div className="section-row"><SectionTitle kicker="02 — PORTFOLIO" title={copy.featured} text={standalone ? undefined : (locale === "ar" ? "تفاصيل مرئية، أفكار واضحة، وتنفيذ لا يضيع في الزحام." : "Visual precision, clear ideas, and execution that does not disappear into the noise.")} /><Link href="/portfolio" className="text-link">{copy.work}{locale === "ar" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</Link></div><div className="filter-row"><button className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>{copy.all}</button>{data.categories.map((category: any) => <button key={category.id} className={activeCategory === String(category.id) ? "active" : ""} onClick={() => setActiveCategory(String(category.id))}>{tField(category, "title", locale)}</button>)}</div>{projects.length ? <div className="project-grid">{projects.map((project: any, index: number) => <article className="project-card" key={project.id}><div className="project-media">{project.media?.[0]?.url ? <img src={project.media[0].url} alt={tField(project.media[0], "alt", locale, tField(project, "title", locale))} /> : <><Film className="h-8 w-8" /><span>VISION / {String(index + 1).padStart(2, "0")}</span></>}<div className="project-overlay"><span>{tField(data.categories.find((c: any) => c.id === project.categoryId), "title", locale, "VISION")}</span></div></div><div className="project-meta"><div><h3>{tField(project, "title", locale)}</h3><p>{tField(project, "summary", locale)}</p></div><Link href={`/portfolio/${project.slug}`} className="round-link" aria-label={copy.explore}><ArrowUpLeft className="h-4 w-4" /></Link></div></article>)}</div> : <div className="empty-state"><Film className="h-7 w-7" /><h3>{copy.emptyWork}</h3><p>{copy.emptyWorkText}</p></div>}</div></section>;
}

function InstagramVideoSection({ videos, locale, copy }: any) {
  if (!videos?.length) return null;
  return <section id="instagram-videos" className="section section-ink"><div className="container"><SectionTitle kicker="INSTAGRAM / REELS" title={copy.latestVideos} text={copy.latestVideosText} /><div className="instagram-public-grid">{videos.map((video: any) => <article className="instagram-public-card" key={video.id}><iframe title={video.caption || "Instagram video"} src={`${String(video.permalink).replace(/\/$/, "")}/embed`} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" /><div><p>{video.caption || (locale === "ar" ? "فيديو من الحساب الرسمي لرؤية للإنتاج الفني." : "A video from Ru'ya's official account.")}</p><a href={video.permalink} target="_blank" rel="noreferrer">{copy.watchOnInstagram}<ArrowUpLeft className="h-4 w-4" /></a></div></article>)}</div></div></section>;
}

function ServicesSection({ data, locale, copy }: any) { return <section className="section section-white"><div className="container"><SectionTitle kicker="SERVICES" title={copy.services} text={copy.servicesText} /><div className="services-list">{data.services.map((service: any, index: number) => <article className="service-row" key={service.id}><span>0{index + 1}</span><div className="service-icon"><ServiceIcon name={service.icon} /></div><div><h3>{tField(service, "title", locale)}</h3><p>{tField(service, "description", locale)}</p></div></article>)}</div></div></section>; }

function AboutSection({ locale, copy }: any) { return <><section className="section section-white"><div className="container about-grid dark"><div><p className="kicker">{copy.process}</p><h2>{copy.aboutTitle}</h2></div><div className="about-copy"><p>{copy.aboutText}</p><p>{copy.processText}</p></div></div></section><section className="statement-band"><div className="container"><span>VISION PRODUCTION</span><h2>{locale === "ar" ? "الفكرة لا تُعرض. الفكرة تُصاغ لتُرى." : "An idea is not merely shown. It is shaped to be seen."}</h2></div></section></>; }

function AchievementSection({ data, locale, copy }: any) { return <section className="section section-white"><div className="container"><SectionTitle kicker="MILESTONES" title={copy.achievement} text={copy.achievementText} />{data.achievements.length ? <div className="timeline">{data.achievements.map((item: any) => <article key={item.id}><span>{item.achievementDate || "—"}</span><div><h3>{tField(item, "title", locale)}</h3><p>{tField(item, "description", locale)}</p></div></article>)}</div> : <div className="empty-state"><Check className="h-7 w-7" /><p>{copy.emptyItems}</p></div>}</div></section>; }

function ClientSection({ data, locale, copy }: any) { const items = [...data.clients, ...data.partners]; return <section className="section section-white"><div className="container"><SectionTitle kicker="COLLABORATION" title={copy.clients} text={copy.clientsText} />{items.length ? <div className="client-grid">{items.map((item: any) => <article key={`${item.id}-${item.nameAr}`} className="client-card">{item.logo?.url ? <img src={item.logo.url} alt={tField(item, "name", locale)} /> : <span>{tField(item, "name", locale)}</span>}</article>)}</div> : <div className="empty-state"><Sparkles className="h-7 w-7" /><p>{copy.emptyItems}</p></div>}</div></section>; }

function BookingSection({ locale, copy, services, onSubmit, isPending }: any) { return <section className="booking-section"><div className="container booking-grid"><div><p className="kicker kicker-light">{copy.bookingKicker}</p><h2>{copy.bookingTitle}</h2><p>{copy.bookingText}</p><a href="https://wa.me/9647760076003" target="_blank" rel="noreferrer" className="whatsapp-line"><MessageCircle className="h-5 w-5" />+964 776 007 6003</a></div><form className="booking-form" onSubmit={onSubmit}><div className="form-grid"><label>{copy.name}<input required name="name" /></label><label>{copy.phone}<input required name="phone" inputMode="tel" /></label><label>{copy.company}<input name="company" /></label><label>{copy.services}<select name="serviceId"><option value="">—</option>{services.map((service: any) => <option key={service.id} value={service.id}>{tField(service, "title", locale)}</option>)}</select></label><label>{copy.projectType}<input name="projectType" placeholder={copy.placeholderProject} /></label><label>{copy.date}<input name="requestedDate" type="date" /></label></div><label>{copy.message}<textarea name="message" rows={3} /></label><button className="button button-orange full" disabled={isPending}>{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{copy.sendBooking}</button></form></div></section>; }

function ContactPage({ locale, copy, services, onBooking, onContact, bookingPending, contactPending }: any) { return <><BookingSection locale={locale} copy={copy} services={services} onSubmit={onBooking} isPending={bookingPending} /><section className="section section-white"><div className="container contact-grid"><div><p className="kicker">CONTACT</p><h2>{copy.contactTitle}</h2><p>{copy.contactText}</p></div><form className="contact-form" onSubmit={onContact}><label>{copy.name}<input required name="name" /></label><label>{copy.phone}<input name="phone" inputMode="tel" /></label><label>{copy.email}<input name="email" type="email" /></label><label>{copy.subject}<input name="subject" /></label><label>{copy.message}<textarea required name="message" rows={5} /></label><button className="button button-ink" disabled={contactPending}>{contactPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{copy.sendContact}</button></form></div></section></>; }

function DynamicPage({ page, locale, copy }: any) { return <section className="section section-white"><div className="container narrow-content"><SectionTitle kicker="VISION PRODUCTION" title={tField(page, "title", locale)} /><p className="section-intro">{tField(page, "heroText", locale)}</p><Link href="/contact" className="button button-orange">{copy.contact}{locale === "ar" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</Link></div></section>; }
