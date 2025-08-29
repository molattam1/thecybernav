// app/[locale]/[[...catchAll]]/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/* ---------- Types ---------- */
type Media = {
    id: string;
    url: string;
    sizes?: { card?: { url: string } };
};

type NotFoundContent = {
    title?: string;
    subtitle?: string;
    ctaLabel?: string;
    ctaLink?: string;
    image?: Media | string;
};

/* ---------- Data ---------- */
async function getNotFoundContent(locale: string): Promise<NotFoundContent> {
    const CMS_URL = process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL;
    if (!CMS_URL) throw new Error("Missing CMS_URL or NEXT_PUBLIC_CMS_URL");

    const url = new URL("/api/globals/not-found", CMS_URL);
    url.searchParams.set("locale", locale);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch 404 content: ${res.status}`);

    return res.json();
}

/* ---------- Page ---------- */
export default async function NotFoundPage({
                                               params,
                                           }: {
    params: Promise<{ locale: string; catchAll?: string[] }>;
}) {
    const { locale } = await params;           // ✅ get the actual locale string
    const safeLocale = locale || "en";         // fallback if ever missing

    let content: NotFoundContent | null = null;
    try {
        content = await getNotFoundContent(safeLocale);
    } catch (e) {
        console.error("[404] failed to fetch content:", e);
    }

    const title = content?.title ?? "Page not found";
    const subtitle =
        content?.subtitle ??
        "The page you’re looking for has wandered into the void.";
    const ctaLabel = content?.ctaLabel ?? "Back to home";
    const ctaLink =
        content?.ctaLink && content.ctaLink.startsWith("/")
            ? `/${safeLocale}${content.ctaLink}` // ensure it’s locale-scoped
            : `/${safeLocale}`;                  // default home for that locale

    return (
        <main className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 text-center text-white">
            {/* Glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(600px 400px at 50% 20%, rgba(160,160,255,0.2), transparent 70%)",
                }}
            />

            {/* Copy */}
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4 bg-gradient-to-r from-[#B8BEE7] via-white to-[#8EA0FF] bg-clip-text text-transparent">
                {title}
            </h1>
            <p className="text-white/70 max-w-xl mb-10">{subtitle}</p>

            {/* CTA */}
            <Link
                href={ctaLink}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-6 py-3 text-base font-semibold shadow-lg hover:bg-gray-200 transition"
            >
                <ArrowLeft className="h-4 w-4" />
                {ctaLabel}
            </Link>
        </main>
    );
}
