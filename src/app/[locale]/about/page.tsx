// app/[locale]/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Util: safe icon map (optional)
import {
    Cpu, Compass, Users, ShieldCheck, Rocket,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Cpu,
    Compass,
    Users,
    ShieldCheck,
    Rocket,
};

type AboutGlobal = {
    seo?: {
        metaTitle?: string | null;
        metaDescription?: string | null;
        ogImage?: { url?: string } | string | null;
    };
    hero?: {
        kicker?: string | null;
        title?: string | null;
        subtitle?: string | null;
        primaryCTA?: { label?: string | null; href?: string | null } | null;
        secondaryCTA?: { label?: string | null; href?: string | null } | null;
    };
    mission?: {
        title?: string | null;
        body?: any; // richText JSON
    };
    values?: Array<{
        title?: string | null;
        icon?: string | null;
        description?: string | null;
    }>;
    stats?: {
        title?: string | null;
        items?: Array<{ value?: string | null; label?: string | null }>;
        disclaimer?: string | null;
    };
    team?: {
        title?: string | null;
        blurb?: string | null;
        members?: Array<{
            name?: string | null;
            role?: string | null;
            avatar?: { url?: string } | string | null;
        }>;
    };
    timeline?: {
        title?: string | null;
        items?: Array<{ badge?: string | null; text?: string | null }>;
    };
    footer?: {
        pitch?: string | null;
        cta?: { label?: string | null; href?: string | null } | null;
    };
};

async function getAbout(locale: string): Promise<AboutGlobal> {
    const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;
    if (!CMS_URL) throw new Error("Missing NEXT_PUBLIC_CMS_URL");
    const res = await fetch(`${CMS_URL}/api/globals/about?locale=${locale}`, {
        // revalidate often during dev; adjust as needed
        next: { revalidate: 60 },
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to fetch About global: ${res.status} ${res.statusText} – ${txt}`);
    }
    return res.json();
}

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const data = await getAbout(locale);

    return {
        title: data.seo?.metaTitle ?? "About",
        description: data.seo?.metaDescription ?? "",
        openGraph: {
            title: data.seo?.metaTitle ?? undefined,
            description: data.seo?.metaDescription ?? undefined,
            images: typeof data.seo?.ogImage === "object" && data.seo?.ogImage?.url
                ? [{ url: data.seo.ogImage.url }]
                : undefined,
        },
    };
}

export default async function AboutPage({
                                            params,
                                        }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const isRTL = locale === "ar";
    const data = await getAbout(locale);

    const pLink = (href?: string | null) =>
        href ? `/${locale}${href.startsWith("/") ? href : `/${href}`}` : undefined;

    return (
        <main
            dir={isRTL ? "rtl" : "ltr"}
            className="relative mx-auto w-[92%] sm:w-[86%] lg:w-[78%] pt-28 pb-24 text-white"
        >
            {/* Glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-3/4 rounded-full blur-3xl"
                style={{
                    background:
                        "radial-gradient(closest-side, rgba(142,160,255,0.25), rgba(11,13,18,0))",
                }}
            />

            {/* Hero */}
            <section className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-10 shadow-[0_10px_40px_rgba(120,120,255,0.12)]">
                {data.hero?.kicker && (
                    <p className="text-xs tracking-widest text-white/60">{data.hero.kicker}</p>
                )}
                {data.hero?.title && (
                    <h1 className="mt-2 text-2xl sm:text-4xl font-semibold leading-tight">
            <span className="bg-gradient-to-r from-[#B8BEE7] via-white to-[#8EA0FF] bg-clip-text text-transparent">
              {data.hero.title}
            </span>
                    </h1>
                )}
                {data.hero?.subtitle && (
                    <p className="mt-4 text-white/75 max-w-3xl">{data.hero.subtitle}</p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                    {data.hero?.primaryCTA?.label && data.hero?.primaryCTA?.href && (
                        <Link
                            href={pLink(data.hero.primaryCTA.href) ?? "#"}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm hover:bg-white/15 transition"
                        >
                            <Rocket className="size-4" />
                            {data.hero.primaryCTA.label}
                        </Link>
                    )}

                    {data.hero?.secondaryCTA?.label && data.hero?.secondaryCTA?.href && (
                        <Link
                            href={pLink(data.hero.secondaryCTA.href) ?? "#"}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                        >
                            <ShieldCheck className="size-4" />
                            {data.hero.secondaryCTA.label}
                        </Link>
                    )}
                </div>
            </section>

            {/* Mission + Values */}
            <section className="mt-8 grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
                    {data.mission?.title && (
                        <h2 className="text-lg font-semibold">{data.mission.title}</h2>
                    )}

                    {/* RichText: keep it simple — Payload returns Slate-like JSON.
              Render minimally or swap with your RT renderer. */}
                    {Array.isArray(data.mission?.body) && (
                        <div className="mt-3 text-sm text-white/75 space-y-3">
                            {data.mission!.body!.map((n: any, i: number) => (
                                <p key={i}>{n?.children?.map((c: any) => c?.text).join("")}</p>
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
                    {data.stats?.title && (
                        <h2 className="text-lg font-semibold">{data.stats.title}</h2>
                    )}

                    <div className="mt-4 grid grid-cols-3 gap-4">
                        {(data.stats?.items ?? []).map((s, idx) => (
                            <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                {s.value && <div className="text-xl font-semibold">{s.value}</div>}
                                {s.label && <div className="mt-1 text-xs text-white/70">{s.label}</div>}
                            </div>
                        ))}
                    </div>

                    {data.stats?.disclaimer && (
                        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                            <p>{data.stats.disclaimer}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Team */}
            <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
                <div className="flex items-center justify-between gap-4">
                    {data.team?.title && <h2 className="text-lg font-semibold">{data.team.title}</h2>}
                    {/* Optional support link moved to CMS if needed */}
                </div>

                {data.team?.blurb && <p className="mt-3 text-sm text-white/75">{data.team.blurb}</p>}

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(data.team?.members ?? []).map((m, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4"
                        >
                            <div className="size-10 rounded-lg bg-white/10 border border-white/10 overflow-hidden">
                                {/* Show avatar if present */}
                                {typeof m.avatar === "object" && m.avatar?.url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.avatar.url} alt={m.name ?? ""} className="h-full w-full object-cover" />
                                ) : null}
                            </div>
                            <div>
                                {m.name && <div className="text-sm font-medium">{m.name}</div>}
                                {m.role && <div className="text-xs text-white/70">{m.role}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Timeline */}
            <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
                {data.timeline?.title && (
                    <h2 className="text-lg font-semibold">{data.timeline.title}</h2>
                )}
                <ol className="mt-4 space-y-4">
                    {(data.timeline?.items ?? []).map((i, idx) => (
                        <li
                            key={idx}
                            className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3"
                        >
                            {i.badge && (
                                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-xs font-medium">
                  {i.badge}
                </span>
                            )}
                            {i.text && <span className="text-sm text-white/80">{i.text}</span>}
                        </li>
                    ))}
                </ol>
            </section>

            {/* CTA */}
            {(data.footer?.pitch || data.footer?.cta?.label) && (
                <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 text-center">
                    {data.footer?.pitch && (
                        <p className="text-sm text-white/80">{data.footer.pitch}</p>
                    )}
                    {data.footer?.cta?.label && data.footer?.cta?.href && (
                        <div className="mt-4">
                            <Link
                                href={pLink(data.footer.cta.href) ?? "#"}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm hover:bg-white/15 transition"
                            >
                                <ArrowRight className="size-4 rtl:rotate-180" />
                                {data.footer.cta.label}
                            </Link>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}
