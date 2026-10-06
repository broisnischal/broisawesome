import type { Route } from "./+types/post-text";

/** Raw MDX source of every post, loaded lazily (one chunk per post). */
const SOURCES = import.meta.glob("../../contents/**/*.mdx", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

/**
 * GET /resources/post-text?slug=… → the post body as plain markdown, for the
 * "copy for LLM" button on cards that aren't on the post page.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    throw new Response("Bad slug", { status: 400 });
  }
  const key = Object.keys(SOURCES).find(
    (k) =>
      k.endsWith(`/contents/${slug}/route.mdx`) ||
      k.endsWith(`/contents/${slug}.mdx`),
  );
  if (!key) throw new Response("Not found", { status: 404 });

  const raw = await SOURCES[key]();
  const body = raw.replace(/^---[\s\S]*?---\s*/, "").trim();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
