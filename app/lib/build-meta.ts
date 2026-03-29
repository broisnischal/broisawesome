/** Public GitHub repo for this site (source of truth for deploy metadata links). */
export const PORTFOLIO_REPO = {
  owner: "broisnischal",
  name: "broisawesome",
} as const;

export const PORTFOLIO_REPO_URL = `https://github.com/${PORTFOLIO_REPO.owner}/${PORTFOLIO_REPO.name}`;

export function getBuildInfo() {
  return {
    version: import.meta.env.VITE_BUILD_VERSION,
    commit: import.meta.env.VITE_BUILD_COMMIT,
    modified: import.meta.env.VITE_BUILD_MODIFIED,
  };
}

export function formatBuildDate(isoOrYmd: string) {
  if (!isoOrYmd) return "—";
  const normalized = isoOrYmd.includes("T")
    ? isoOrYmd
    : `${isoOrYmd}T12:00:00Z`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return isoOrYmd;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d);
}
