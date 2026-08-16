export function getCarouselIndex(current: number, total: number, visible: number, direction: 1 | -1) {
  const maxStart = Math.max(0, total - Math.max(1, visible));
  if (maxStart === 0) return 0;
  if (direction === 1) return current >= maxStart ? 0 : current + 1;
  return current <= 0 ? maxStart : current - 1;
}
