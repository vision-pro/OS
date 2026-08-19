const MANUS_PUBLIC_HOST = "visionportf-gwxs956w.manus.space";
const GITHUB_PAGES_URL = "https://vision-pro.github.io/OS/";

export function getPublicSiteRedirectTarget(location: Pick<Location, "hostname" | "pathname" | "search" | "hash">) {
  if (location.hostname !== MANUS_PUBLIC_HOST) return null;
  if (location.pathname.startsWith("/admin")) return null;
  if (new URLSearchParams(location.search).get("stay") === "1") return null;

  return `${GITHUB_PAGES_URL}${location.search}${location.hash}`;
}
