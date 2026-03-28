/**
 * Persists newsletter signups to Workers KV (`NEWSLETTER_KV`).
 * Key is `sub:` + normalized email; value is JSON metadata.
 */
export async function saveNewsletterEmail(
  kv: KVNamespace | undefined,
  email: string,
): Promise<{ ok: true } | { ok: false }> {
  const normalized = email.trim().toLowerCase();
  if (!kv) {
    if (import.meta.env.DEV) {
      console.warn("[newsletter] NEWSLETTER_KV not bound; skipping KV write");
    }
    return { ok: true };
  }

  try {
    await kv.put(
      `sub:${normalized}`,
      JSON.stringify({
        email: normalized,
        subscribedAt: new Date().toISOString(),
      }),
    );
    return { ok: true };
  } catch (e) {
    console.error("[newsletter] KV put failed", e);
    return { ok: false };
  }
}
