export const projectDisplayLocations = ["grid", "carousel", "both"];

export function normalizeProjectDisplayLocation(value) {
  return projectDisplayLocations.includes(value) ? value : "both";
}

export function isProjectVisibleInLocation(project, location) {
  const selected = normalizeProjectDisplayLocation(project?.display_location);
  return selected === "both" || selected === location;
}

export function projectHash(slug) {
  return `#project/${encodeURIComponent(String(slug || "").trim())}`;
}

export function projectQuery(slug) {
  return `?project=${encodeURIComponent(String(slug || "").trim())}#work`;
}

export function slugFromProjectHash(hash) {
  const match = String(hash || "").match(/^#project\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}
