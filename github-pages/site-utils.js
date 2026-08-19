export function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[char]);
}

export function buildWhatsAppUrl(phone, { name, projectType }) {
  const cleanPhone = String(phone).replace(/\D/g, '');
  const text = `مرحباً رؤية، أنا ${name} وأرغب في الاستفسار عن ${projectType || 'مشروع جديد'}.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
