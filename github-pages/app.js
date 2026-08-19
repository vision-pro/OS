import { siteConfig } from './config.js';
import { getCarouselScrollAmount, getClientLogoFallback, getServiceIconMarkup } from './presentation-utils.js';
import { buildWhatsAppUrl, escapeHtml } from './site-utils.js';

const apiHeaders = {
  apikey: siteConfig.supabasePublishableKey,
  Authorization: `Bearer ${siteConfig.supabasePublishableKey}`,
  'Content-Type': 'application/json',
};

async function readPublicTable(table, select, order) {
  const params = new URLSearchParams({ select, order });
  const response = await fetch(`${siteConfig.supabaseUrl}/rest/v1/${table}?${params}`, { headers: apiHeaders });
  if (!response.ok) throw new Error(`Unable to read ${table}`);
  return response.json();
}

async function insertPublicRecord(table, values) {
  const response = await fetch(`${siteConfig.supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...apiHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify(values),
  });
  if (!response.ok) throw new Error(`Unable to add ${table}`);
}

function renderEmpty(element, message) {
  element.innerHTML = `<p class="empty-state">${escapeHtml(message)}</p>`;
}

function serviceOptionMarkup(service) {
  return `<option value="${escapeHtml(service.id)}">${escapeHtml(service.title_ar)}</option>`;
}

async function loadServices() {
  const element = document.querySelector('#services-grid');
  const select = document.querySelector('#booking-service');
  let data;
  try {
    data = await readPublicTable('services', 'id,title_ar,summary_ar,icon', 'sort_order.asc');
  } catch {
    renderEmpty(element, 'تعذر تحميل الخدمات حالياً.');
    return;
  }
  if (select) select.insertAdjacentHTML('beforeend', (data || []).map(serviceOptionMarkup).join(''));
  if (!data?.length) return renderEmpty(element, 'ستظهر الخدمات المنشورة هنا قريباً.');
  element.innerHTML = data.map((service, index) => `
    <article class="service-card">
      <div class="service-icon">${getServiceIconMarkup(service.icon)}</div>
      <span class="card-index">${String(index + 1).padStart(2, '0')}</span>
      <h3>${escapeHtml(service.title_ar)}</h3>
      <p>${escapeHtml(service.summary_ar || 'خدمة إبداعية مصممة وفق متطلبات المشروع.')}</p>
      <a class="card-link" href="#booking">ابدأ مشروعك <span>↖</span></a>
    </article>
  `).join('');
}

async function loadProjects() {
  const element = document.querySelector('#projects-grid');
  let data;
  try {
    data = await readPublicTable('projects', 'id,title_ar,summary_ar,client_name,project_date,media_assets(public_url,kind,alt_ar)', 'published_at.desc');
  } catch {
    return renderEmpty(element, 'تعذر تحميل الأعمال حالياً.');
  }
  if (!data?.length) return renderEmpty(element, 'لا توجد مشاريع منشورة حالياً. أضف مشاريعك من لوحة الإدارة لتظهر هنا تلقائياً.');
  element.innerHTML = data.map((project, index) => {
    const media = project.media_assets;
    const mediaMarkup = media?.public_url
      ? media.kind === 'video'
        ? `<video muted playsinline preload="metadata" aria-label="${escapeHtml(media.alt_ar || project.title_ar)}"><source src="${escapeHtml(media.public_url)}" /></video>`
        : `<img src="${escapeHtml(media.public_url)}" alt="${escapeHtml(media.alt_ar || project.title_ar)}" loading="lazy" />`
      : `<span class="project-placeholder">VISION / ${String(index + 1).padStart(2, '0')}</span>`;
    return `<article class="project-card"><div class="project-visual">${mediaMarkup}<span class="project-label">VISION</span></div><div class="project-meta"><span>${escapeHtml(project.client_name || 'VISION PRODUCTION')}</span><span>${escapeHtml(project.project_date || '2026')}</span></div><h3>${escapeHtml(project.title_ar)}</h3><p>${escapeHtml(project.summary_ar || '')}</p></article>`;
  }).join('');
}

async function loadClients() {
  const element = document.querySelector('#clients-grid');
  let data;
  try {
    data = await readPublicTable('clients', 'id,name_ar,name_en,media_assets(public_url,alt_ar)', 'sort_order.asc');
  } catch {
    return renderEmpty(element, 'تعذر تحميل الشعارات حالياً.');
  }
  if (!data?.length) return renderEmpty(element, 'ستظهر شعارات العملاء المعتمدة هنا.');
  element.innerHTML = data.map((client, index) => {
    const logo = client.media_assets?.public_url || getClientLogoFallback(index, siteConfig.assetBaseUrl);
    const alt = client.media_assets?.alt_ar || client.name_ar || client.name_en || `CLIENT ${index + 1}`;
    return `<article class="client-card">${logo ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(alt)}" loading="lazy" />` : `<span>${escapeHtml(alt)}</span>`}</article>`;
  }).join('');
}

function setStatus(id, message, isError = false) {
  const element = document.querySelector(id);
  element.textContent = message;
  element.classList.toggle('is-error', isError);
}

function initializeClientCarousel() {
  const track = document.querySelector('#clients-grid');
  document.querySelectorAll('[data-client-scroll]').forEach(button => {
    button.addEventListener('click', () => {
      track.scrollBy({ left: getCarouselScrollAmount(track.clientWidth, Number(button.dataset.clientScroll)), behavior: 'smooth' });
    });
  });
}

document.querySelector('#booking-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  setStatus('#booking-status', 'جارٍ حفظ الطلب…');
  let error = false;
  try {
    await insertPublicRecord('bookings', {
      name: form.get('name')?.trim(), phone: form.get('phone')?.trim(), company: form.get('company')?.trim() || null,
      service_id: form.get('service_id') || null, project_type: form.get('project_type')?.trim() || null,
      requested_date: form.get('requested_date') || null, message: form.get('message')?.trim() || null, preferred_language: 'ar',
    });
  } catch { error = true; }
  button.disabled = false;
  if (error) return setStatus('#booking-status', 'تعذر حفظ الطلب. تحقق من الحقول ثم حاول مجدداً.', true);
  setStatus('#booking-status', 'تم حفظ طلبك. سنفتح WhatsApp الآن.');
  window.open(buildWhatsAppUrl(siteConfig.whatsappPhone, { name: form.get('name'), projectType: form.get('project_type') }), '_blank', 'noopener');
  event.currentTarget.reset();
});

document.querySelector('#contact-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  setStatus('#contact-status', 'جارٍ إرسال رسالتك…');
  let error = false;
  try {
    await insertPublicRecord('contact_requests', {
      name: form.get('name')?.trim(), email: form.get('email')?.trim() || null,
      message: form.get('message')?.trim(), preferred_language: 'ar',
    });
  } catch { error = true; }
  button.disabled = false;
  if (error) return setStatus('#contact-status', 'تعذر حفظ الرسالة. حاول مجدداً.', true);
  setStatus('#contact-status', 'وصلت رسالتك بنجاح. شكراً لتواصلك.');
  event.currentTarget.reset();
});

document.querySelector('#year').textContent = new Date().getFullYear();
initializeClientCarousel();
await Promise.all([loadServices(), loadProjects(), loadClients()]);
