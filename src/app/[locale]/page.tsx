// app/[locale]/page.tsx
export const runtime = "nodejs";
export const revalidate = 0;

import HomeUI from "@/components/HomeUI";

type AnyObj = Record<string, any>;
type Homepage = AnyObj;

const IS_DEV = process.env.NODE_ENV !== "production";

/* -------------------- tiny fetch helper -------------------- */
async function fetchWithOptionalTimeout(url: string, init: RequestInit, ms: number) {
    if (IS_DEV || ms <= 0) return fetch(url, init);
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), ms);
    try {
        return await fetch(url, { ...init, signal: ac.signal });
    } finally {
        clearTimeout(to);
    }
}

/* -------------------- URL + upload resolvers -------------------- */
function requireCmsUrl(): string {
    const base = process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL;
    if (!base) throw new Error("Missing CMS_URL or NEXT_PUBLIC_CMS_URL");
    try {
        // also ensures it includes protocol
        return new URL(base).toString().replace(/\/$/, "");
    } catch {
        throw new Error(`Invalid CMS_URL "${base}" (must include http/https).`);
    }
}

function ensureAbsolute(base: string, u?: string): string | undefined {
    if (!u) return;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/")) return `${base}${u}`;
    return undefined;
}

function pickUrlFromUploadDoc(base: string, doc: AnyObj | undefined): string | undefined {
    if (!doc) return;
    // prefer a sized variant if present
    const sizes = doc.sizes && typeof doc.sizes === "object" ? Object.values(doc.sizes) : [];
    const sized = (sizes as AnyObj[]).find((s) => s?.url);
    return ensureAbsolute(base, sized?.url || doc.url);
}

async function resolveUploadIdToUrl(base: string, id: string): Promise<string | undefined> {
    // Payload REST: GET /api/media/:id
    try {
        const res = await fetch(`${base}/api/media/${id}?depth=0`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const json = (await res.json()) as AnyObj;
        return pickUrlFromUploadDoc(base, json);
    } catch {
        return;
    }
}

/** Normalize any "upload-ish" value (ID | doc | URL) into an absolute URL string. */
async function toAbsoluteUploadUrl(
    base: string,
    value: string | AnyObj | undefined,
): Promise<string | undefined> {
    if (!value) return;

    if (typeof value === "string") {
        // already a URL or app-relative path?
        const maybe = ensureAbsolute(base, value);
        if (maybe) return maybe;

        // probably an ID → fetch upload doc and pick url
        return await resolveUploadIdToUrl(base, value);
    }

    // object with { url, sizes }
    return pickUrlFromUploadDoc(base, value);
}

/* -------------------- CMS fetch -------------------- */
async function getHomepageContent(locale: string): Promise<Homepage> {
    const CMS_BASE = requireCmsUrl();
    const u = new URL("/api/globals/homepage", CMS_BASE);
    u.searchParams.set("locale", locale || "en");
    // depth=2 ensures upload relations come hydrated when possible
    u.searchParams.set("depth", "2");

    const init: RequestInit = {
        cache: "no-store",
        headers: { Accept: "application/json" },
    };

    try {
        const res = await fetchWithOptionalTimeout(u.toString(), init, 8000);
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Failed: ${res.status} ${res.statusText} - ${text}`);
        }
        const homepage = (await res.json()) as Homepage;

        // --- ONE-TIME FIX: force hero.deviceImage to be an absolute URL string ---
        // (works whether deviceImage is an ID, an object, or a relative url)
        const hero = homepage?.hero as AnyObj | undefined;
        if (hero) {
            hero.deviceImage = await toAbsoluteUploadUrl(CMS_BASE, hero.deviceImage);
        }

        // (Optional but nice) also normalize gallery images if present
        if (Array.isArray(homepage?.gallery)) {
            homepage.gallery = await Promise.all(
                homepage.gallery.map(async (g: AnyObj) => ({
                    ...g,
                    image: await toAbsoluteUploadUrl(CMS_BASE, g?.image),
                })),
            );
        }

        return homepage;
    } catch (e: any) {
        if (e?.name === "AbortError") {
            // retry once without timeout (cold start/HMR)
            const CMS_BASE = requireCmsUrl();
            const retry = new URL("/api/globals/homepage", CMS_BASE);
            retry.searchParams.set("locale", locale || "en");
            retry.searchParams.set("depth", "2");
            const res2 = await fetch(retry.toString(), { cache: "no-store", headers: { Accept: "application/json" } });
            if (!res2.ok) {
                const text = await res2.text().catch(() => "");
                throw new Error(`Failed (after retry): ${res2.status} ${res2.statusText} - ${text}`);
            }
            const homepage = (await res2.json()) as Homepage;

            const hero = homepage?.hero as AnyObj | undefined;
            if (hero) {
                hero.deviceImage = await toAbsoluteUploadUrl(CMS_BASE, hero.deviceImage);
            }
            if (Array.isArray(homepage?.gallery)) {
                homepage.gallery = await Promise.all(
                    homepage.gallery.map(async (g: AnyObj) => ({
                        ...g,
                        image: await toAbsoluteUploadUrl(CMS_BASE, g?.image),
                    })),
                );
            }

            return homepage;
        }
        console.error("[homepage] fetch error:", e);
        throw e;
    }
}

/* -------------------- RSC entry -------------------- */
export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale = locale || "en";

    let homepage: Homepage | null = null;
    try {
        homepage = await getHomepageContent(resolvedLocale);
    } catch (err) {
        console.error("[homepage] final error:", err);
    }

    // HomeUI now receives hero.deviceImage as a guaranteed absolute URL string.
    return <HomeUI homepage={homepage as any} locale={resolvedLocale} />;
}
