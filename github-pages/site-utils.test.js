import { describe, expect, it } from 'vitest';
import { buildWhatsAppUrl, escapeHtml } from './site-utils.js';

describe('GitHub Pages utility helpers', () => {
  it('escapes client text before rendering it in a content card', () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('builds an international WhatsApp URL with encoded Arabic project details', () => {
    const url = buildWhatsAppUrl('+964 776 007 6003', { name: 'علي', projectType: 'فيلم تعريفي' });
    expect(url).toContain('https://wa.me/9647760076003?text=');
    expect(url).toContain(encodeURIComponent('علي'));
    expect(url).toContain(encodeURIComponent('فيلم تعريفي'));
  });
});
