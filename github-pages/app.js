import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { siteConfig } from './config.js';
import { buildWhatsAppUrl, escapeHtml } from './site-utils.js';

const supabase = createClient(siteConfig.supabaseUrl, siteConfig.supabasePublishableKey);

function renderEmpty(element, message) {
  element.innerHTML = `<p class="empty-state">${escapeHtml(message)}</p>`;
}

async function loadServices() {
  const element = document.querySelector('#services-grid');
  const { data, error } = await supabase.from('services').select('id, title_ar, summary_ar, icon').order('sort_order');
  if (error) return renderEmpty(element, 'تعذر تحميل الخدمات حالياً.');
  if (!data?.length) return renderEmpty(element, 'ستظهر الخدمات المنشورة هنا قريباً.');
  element.innerHTML = data.map((service, index) => `
    <article class="service-card">
      <span class="card-index">0${index + 1}</span>
      <span class="service-icon">${escapeHtml(service.icon || '✦')}</span>
      <h3>${escapeHtml(service.title_ar)}</h3>
      <p>${escapeHtml(service.summary_ar || 'خدمة إبداعية مصممة وفق متطلبات المشروع.')}</p>
    </article>
  `).join('');
}

async function loadProjects() {
  const element = document.querySelector('#projects-grid');
  const { data, error } = await supabase.from('projects').select('id, title_ar, summary_ar, client_name, project_date, media_assets(public_url, kind, alt_ar)').order('published_at', { ascending: false });
  if (error) return renderEmpty(element, 'تعذر تحميل الأعمال حالياً.');
  if (!data?.length) return renderEmpty(element, 'ستظهر الأعمال المعتمدة من لوحة الإدارة هنا.');
  element.innerHTML = data.map((project, index) => {
    const media = project.media_assets;
    const mediaMarkup = media?.public_url
      ? media.kind === 'video'
        ? `<video muted playsinline preload="metadata" aria-label="${escapeHtml(media.alt_ar || project.title_ar)}"><source src="${escapeHtml(media.public_url)}" /></video>`
        : `<img src="${escapeHtml(media.public_url)}" alt="${escapeHtml(media.alt_ar || project.title_ar)}" loading="lazy" />`
      : `<span class="project-placeholder">VISION / ${String(index + 1).padStart(2, '0')}</span>`;
    return `<article class="project-card"><div class="project-visual">${mediaMarkup}</div><div class="project-meta"><span>${escapeHtml(project.client_name || 'VISION PRODUCTION')}</span><span>${escapeHtml(project.project_date || '2026')}</span></div><h3>${escapeHtml(project.title_ar)}</h3><p>${escapeHtml(project.summary_ar || '')}</p></article>`;
  }).join('');
}

async function loadClients() {
  const element = document.querySelector('#clients-grid');
  const { data, error } = await supabase.from('clients').select('id, name_ar, name_en, media_assets(public_url, alt_ar)').order('sort_order');
  if (error) return renderEmpty(element, 'تعذر تحميل الشعارات حالياً.');
  if (!data?.length) return renderEmpty(element, 'ستظهر شعارات العملاء المعتمدة هنا.');
  element.innerHTML = data.map((client, index) => {
    const logo = client.media_assets?.public_url;
    return `<article class="client-card">${logo ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(client.media_assets.alt_ar || client.name_ar)}" loading="lazy" />` : `<span>${escapeHtml(client.name_ar || client.name_en || `CLIENT ${index + 1}`)}</span>`}</article>`;
  }).join('');
}

function setStatus(id, message, isError = false) {
  const element = document.querySelector(id);
  element.textContent = message;
  element.classList.toggle('is-error', isError);
}

document.querySelector('#booking-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  setStatus('#booking-status', 'جارٍ حفظ الطلب…');
  const { error } = await supabase.from('bookings').insert({
    name: form.get('name')?.trim(),
    phone: form.get('phone')?.trim(),
    project_type: form.get('project_type')?.trim() || null,
    message: form.get('message')?.trim() || null,
    preferred_language: 'ar',
  });
  button.disabled = false;
  if (error) return setStatus('#booking-status', 'تعذر حفظ الطلب. تحقق من الحقول ثم حاول مجدداً.', true);
  setStatus('#booking-status', 'تم حفظ طلبك. سنفتح WhatsApp الآن.');
  const url = buildWhatsAppUrl(siteConfig.whatsappPhone, {
    name: form.get('name'),
    projectType: form.get('project_type'),
  });
  window.open(url, '_blank', 'noopener');
  event.currentTarget.reset();
});

document.querySelector('#contact-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  setStatus('#contact-status', 'جارٍ إرسال رسالتك…');
  const { error } = await supabase.from('contact_requests').insert({
    name: form.get('name')?.trim(),
    email: form.get('email')?.trim() || null,
    message: form.get('message')?.trim(),
    preferred_language: 'ar',
  });
  button.disabled = false;
  if (error) return setStatus('#contact-status', 'تعذر إرسال الرسالة. حاول مجدداً.', true);
  setStatus('#contact-status', 'وصلت رسالتك بنجاح. شكراً لتواصلك.');
  event.currentTarget.reset();
});

document.querySelector('#year').textContent = new Date().getFullYear();
await Promise.all([loadServices(), loadProjects(), loadClients()]);
