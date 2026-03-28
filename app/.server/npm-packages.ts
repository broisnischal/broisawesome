/** npm registry: maintainer search + downloads API for accurate monthly counts. */

const DEFAULT_MAINTAINER = "neeswebservice";
const DOWNLOADS_CHUNK = 40;

export type NpmPackageItem = {
  name: string;
  version: string;
  description: string;
  npmUrl: string;
  homepage: string | null;
  repository: string | null;
  license: string | null;
  /** ISO date from search index */
  date: string | null;
  /** Last ~30 days from `api.npmjs.org/downloads/point/last-month` */
  downloadsMonthly: number;
};

export type NpmPackagesResult = {
  packages: NpmPackageItem[];
  maintainer: string;
  fromApi: boolean;
  error?: string;
  /** Maintainer search match count (before topByDownloads slice) */
  total?: number;
};

type NpmSearchObject = {
  downloads?: { monthly?: number; weekly?: number };
  package: {
    name: string;
    version: string;
    description?: string;
    date?: string;
    license?: string;
    links?: {
      npm?: string;
      homepage?: string;
      repository?: string;
    };
  };
};

function readSearchMonthlyDownloads(o: NpmSearchObject): number {
  const raw = o.downloads as Record<string, unknown> | undefined;
  if (!raw) return 0;
  const m = raw.monthly;
  if (typeof m === "number" && m >= 0) return m;
  return 0;
}

/** `GET .../last-month/a,b,c` → per-package `{ downloads }` */
async function fetchLastMonthDownloadsMap(
  names: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (names.length === 0) return map;

  for (let i = 0; i < names.length; i += DOWNLOADS_CHUNK) {
    const chunk = names.slice(i, i + DOWNLOADS_CHUNK);
    const path = chunk.map((n) => encodeURIComponent(n)).join(",");
    const url = `https://api.npmjs.org/downloads/point/last-month/${path}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "nischal-portfolio-projects" },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as Record<
        string,
        { downloads?: number } | undefined
      >;
      for (const name of chunk) {
        const row = data[name];
        if (row && typeof row.downloads === "number" && row.downloads >= 0) {
          map.set(name, row.downloads);
        }
      }
    } catch {
      /* chunk failed — leave missing keys for merge step */
    }
  }
  return map;
}

export async function fetchNpmPackagesByMaintainer(
  env: Cloudflare.Env | undefined,
  options?: { size?: number; topByDownloads?: number },
): Promise<NpmPackagesResult> {
  const maintainer = (
    env?.NPM_USERNAME?.trim() || DEFAULT_MAINTAINER
  ).replace(/^@/, "");
  const size = Math.min(Math.max(options?.size ?? 250, 1), 250);
  const topByDownloads = options?.topByDownloads;

  const url = new URL("https://registry.npmjs.org/-/v1/search");
  url.searchParams.set("text", `maintainer:${maintainer}`);
  url.searchParams.set("size", String(size));

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "nischal-portfolio-projects",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        packages: [],
        maintainer,
        fromApi: true,
        error: errText.length < 200 ? errText : `npm registry ${res.status}`,
      };
    }

    const body = (await res.json()) as {
      objects?: NpmSearchObject[];
      total?: number;
    };

    const objects = Array.isArray(body.objects) ? body.objects : [];
    let packages: NpmPackageItem[] = objects.map((o) => {
      const p = o.package;
      const links = p.links;
      const fromSearch = readSearchMonthlyDownloads(o);
      return {
        name: p.name,
        version: p.version,
        description: p.description ?? "",
        npmUrl: links?.npm ?? `https://www.npmjs.com/package/${encodeURIComponent(p.name)}`,
        homepage: links?.homepage ?? null,
        repository: links?.repository ?? null,
        license: p.license ?? null,
        date: p.date ?? null,
        downloadsMonthly: fromSearch,
      };
    });

    const names = [...new Set(packages.map((p) => p.name))];
    const downloadsMap = await fetchLastMonthDownloadsMap(names);
    packages = packages.map((p) => ({
      ...p,
      downloadsMonthly: downloadsMap.get(p.name) ?? p.downloadsMonthly,
    }));

    packages.sort((a, b) => b.downloadsMonthly - a.downloadsMonthly);

    const totalListed =
      typeof body.total === "number" ? body.total : packages.length;
    const total = Math.max(totalListed, packages.length);

    if (typeof topByDownloads === "number" && topByDownloads >= 0) {
      packages = packages.slice(0, topByDownloads);
    }

    return {
      packages,
      maintainer,
      fromApi: true,
      total,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { packages: [], maintainer, fromApi: false, error: message };
  }
}
