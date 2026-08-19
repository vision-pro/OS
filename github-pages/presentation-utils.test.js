import { describe, expect, it } from 'vitest';
import { getCarouselScrollAmount, getClientLogoFallback, getServiceIconMarkup } from './presentation-utils.js';

describe('GitHub Pages presentation utilities', () => {
  it('renders a safe SVG for known and unknown service icons', () => {
    expect(getServiceIconMarkup('Palette')).toContain('<svg');
    expect(getServiceIconMarkup('unknown-icon')).toContain('M4 9h16');
  });

  it('builds stable fallback logo URLs from the approved asset host', () => {
    expect(getClientLogoFallback(0, 'https://assets.example')).toBe('https://assets.example/manus-storage/zulal-logo_cf5571f9.svg');
    expect(getClientLogoFallback(4, 'https://assets.example')).toBeNull();
  });

  it('produces a minimum accessible carousel scroll distance in either direction', () => {
    expect(getCarouselScrollAmount(200, 1)).toBe(280);
    expect(getCarouselScrollAmount(500, -1)).toBe(-390);
  });
});
