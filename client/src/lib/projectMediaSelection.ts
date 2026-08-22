export function normalizeMediaIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(item => Number(item)).filter(id => Number.isInteger(id) && id > 0)));
}

export function toggleProjectMediaId(current: number[], id: number): number[] {
  return current.includes(id) ? current.filter(item => item !== id) : [...current, id];
}
