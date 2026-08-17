export const OPENING_DURATION_MS = 2300;

export function shouldPresentOpening({
  isHome,
  previouslySeen,
  reducedMotion,
}: {
  isHome: boolean;
  previouslySeen: boolean;
  reducedMotion: boolean;
}) {
  return isHome && !previouslySeen && !reducedMotion;
}
