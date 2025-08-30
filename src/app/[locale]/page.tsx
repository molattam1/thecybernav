// app/[locale]/page.tsx
export const runtime = "nodejs";
export const revalidate = 0;

import HomeUI from "@/components/HomeUI";

/* -------------------- Types -------------------- */
type UploadDoc = {
    url?: string;
    alt?: string;
    sizes?: Record<string, { url?: string }>;
    [key: string]: unknown;
};

interface Homepage {
    hero?: {
        title?: string;
        subtitle?: string;
        primaryCTA?: string;
        primaryLink?: string;
        secondaryCTA?: string;
        secondaryLink?: string;
        deviceImage?: string | UploadDoc;
    };
    gallery?: {
        title?: string;
        description?: string;
        items?: { label?: string; image?: string | UploadDoc }[];
    };
    [key: string]: unknown; // allow CMS flexibility
}

/* -------------------- env + helpers -------------------- */
const IS_DEV = process.env.NODE_ENV !== "production";

async function fetchWithOptionalTimeout(
    url: string,
    init: RequestInit,
    ms: number,
) {
    if (IS_DEV || ms <= 0) return fetch(url, init);
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), ms);
    try {
        return await fetch(url, { ...init, signal: ac.signal });
    } finally {
        clearTimeout(to);
    }
}

function requireCmsUrl(): string {
    const base = process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL;
    if (!base) throw new Error("Missing CMS_URL or NEXT_PUBLIC_CMS_URL");
    try {
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

function pickUrlFromUploadDoc(
    base: string,
    doc: UploadDoc | undefined,
): string | undefined {
    if (!doc) return;
    const sizes = doc.sizes ? Object.values(doc.sizes) : [];
    const sized = sizes.find((s) => s?.url);
    return ensureAbsolute(base, sized?.url || doc.url);
}

async function resolveUploadIdToUrl(
    base: string,
    id: string,
): Promise<string | undefined> {
    try {
        const res = await fetch(`${base}/api/media/${id}?depth=0`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const json = (await res.json()) as UploadDoc;
        return pickUrlFromUploadDoc(base, json);
    } catch {
        return;
    }
}

/** Normalize any "upload-ish" value (ID | doc | URL) into an absolute URL string. */
async function toAbsoluteUploadUrl(
    base: string,
    value: string | UploadDoc | undefined,
): Promise<string | undefined> {
    if (!value) return;

    if (typeof value === "string") {
        const maybe = ensureAbsolute(base, value);
        if (maybe) return maybe;
        return await resolveUploadIdToUrl(base, value);
    }

    return pickUrlFromUploadDoc(base, value);
}

/* -------------------- CMS fetch -------------------- */
async function getHomepageContent(locale: string): Promise<Homepage> {
    const CMS_BASE = requireCmsUrl();
    const u = new URL("/api/globals/homepage", CMS_BASE);
    u.searchParams.set("locale", locale || "en");
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

        // Normalize hero deviceImage
        if (homepage.hero) {
            homepage.hero.deviceImage = await toAbsoluteUploadUrl(
                CMS_BASE,
                homepage.hero.deviceImage as string | UploadDoc | undefined,
            );
        }

        // Normalize gallery
        if (homepage.gallery?.items && Array.isArray(homepage.gallery.items)) {
            homepage.gallery.items = await Promise.all(
                homepage.gallery.items.map(async (g) => ({
                    ...g,
                    image: await toAbsoluteUploadUrl(CMS_BASE, g.image),
                })),
            );
        }

        return homepage;
    } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") {
            // retry once without timeout
            const retry = new URL("/api/globals/homepage", requireCmsUrl());
            retry.searchParams.set("locale", locale || "en");
            retry.searchParams.set("depth", "2");
            const res2 = await fetch(retry.toString(), init);
            if (!res2.ok) {
                const text = await res2.text().catch(() => "");
                throw new Error(
                    `Failed (after retry): ${res2.status} ${res2.statusText} - ${text}`,
                );
            }
            const homepage = (await res2.json()) as Homepage;

            if (homepage.hero) {
                homepage.hero.deviceImage = await toAbsoluteUploadUrl(
                    CMS_BASE,
                    homepage.hero.deviceImage as string | UploadDoc | undefined,
                );
            }
            if (homepage.gallery?.items && Array.isArray(homepage.gallery.items)) {
                homepage.gallery.items = await Promise.all(
                    homepage.gallery.items.map(async (g) => ({
                        ...g,
                        image: await toAbsoluteUploadUrl(CMS_BASE, g.image),
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
    } catch (err: unknown) {
        console.error("[homepage] final error:", err);
    }

    return <HomeUI homepage={homepage} locale={resolvedLocale} />;
}
