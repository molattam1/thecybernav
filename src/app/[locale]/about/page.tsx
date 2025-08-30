// app/[locale]/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Cpu, Compass, Users, ShieldCheck, Rocket } from "lucide-react";

/* -------------------- Types -------------------- */
type UploadDoc = {
    url?: string;
    alt?: string | null;
    [key: string]: unknown;
};

type RichTextLeaf = { text?: string };
type RichTextNode = {
    type?: string;
    children?: Array<RichTextLeaf>;
};
type RichText = Array<RichTextNode>;

type CTA = { label?: string | null; href?: string | null };

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
        primaryCTA?: CTA | null;
        secondaryCTA?: CTA | null;
    };
    mission?: {
        title?: string | null;
        body?: RichText; // richText JSON
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
        cta?: CTA | null;
    };
};

/* -------------------- Icons (actually used) -------------------- */
const ICONS: Record<
    string,
    React.ComponentType<{ className?: string; size?: number }>
> = { Cpu, Compass, Users, ShieldCheck, Rocket };

/* -------------------- Helpers -------------------- */
function requireCmsUrl(): string {
    const base = process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL;
    if (!base) throw new Error("Missing CMS_URL or NEXT_PUBLIC_CMS_URL");
    try {
        return new URL(base).toString().replace(/\/$/, "");
    } catch {
        throw new Error(`Invalid CMS_URL "${base}" (must include http/https).`);
    }
}

function toAbsolute(base: string, u?: string | null): string | undefined {
    if (!u) return;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/")) return `${base}${u}`;
    return undefined;
}

function absoluteFromUploadish(
    base: string,
    val?: string | UploadDoc | null,
): string | undefined {
    if (!val) return;
    if (typeof val === "string") return toAbsolute(base, val);
    return toAbsolute(base, val.url);
}

async function getAbout(locale: string): Promise<AboutGlobal> {
    const CMS = requireCmsUrl();
    const url = new URL("/api/globals/about", CMS);
    url.searchParams.set("locale", locale);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to fetch About global: ${res.status} ${res.statusText} – ${txt}`);
    }
    return res.json();
}

/* -------------------- Metadata -------------------- */
export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const data = await getAbout(locale);
    const CMS = requireCmsUrl();

    const ogUrl = absoluteFromUploadish(CMS, data.seo?.ogImage);

    return {
        title: data.seo?.metaTitle ?? "About",
        description: data.seo?.metaDescription ?? "",
        openGraph: {
            title: data.seo?.metaTitle ?? undefined,
            description: data.seo?.metaDescription ?? undefined,
            images: ogUrl ? [{ url: ogUrl }] : undefined,
        },
    };
}

/* -------------------- Page -------------------- */
export default async function AboutPage({
                                            params,
                                        }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const isRTL = locale === "ar";
    const data = await getAbout(locale);
    const CMS = requireCmsUrl();

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

                    {/* Minimal rich-text render (no `any`) */}
                    {Array.isArray(data.mission?.body) && (
                        <div className="mt-3 text-sm text-white/75 space-y-3">
                            {data.mission.body.map((n, i) => {
                                const text =
                                    Array.isArray(n.children)
                                        ? n.children
                                            .map((c) => (typeof c.text === "string" ? c.text : ""))
                                            .join("")
                                        : "";
                                return <p key={i}>{text}</p>;
                            })}
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

            {/* Values (now rendering icons to avoid unused-const warning) */}
            {Array.isArray(data.values) && data.values.length > 0 && (
                <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {data.values.map((v, i) => {
                            const Icon = v.icon && ICONS[v.icon] ? ICONS[v.icon] : undefined;
                            return (
                                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex items-center gap-3">
                                        {Icon ? (
                                            <span className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/10">
                        <Icon className="size-4" />
                      </span>
                                        ) : null}
                                        {v.title && <h3 className="text-sm font-semibold">{v.title}</h3>}
                                    </div>
                                    {v.description && (
                                        <p className="mt-2 text-xs text-white/70">{v.description}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Team */}
            <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
                <div className="flex items-center justify-between gap-4">
                    {data.team?.title && <h2 className="text-lg font-semibold">{data.team.title}</h2>}
                </div>

                {data.team?.blurb && <p className="mt-3 text-sm text-white/75">{data.team.blurb}</p>}

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(data.team?.members ?? []).map((m, i) => {
                        const avatarUrl =
                            typeof m.avatar === "string"
                                ? toAbsolute(CMS, m.avatar)
                                : absoluteFromUploadish(CMS, m.avatar);

                        return (
                            <div
                                key={i}
                                className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4"
                            >
                                <div className="size-10 rounded-lg bg-white/10 border border-white/10 overflow-hidden relative">
                                    {avatarUrl ? (
                                        <Image
                                            src={avatarUrl}
                                            alt={m.name ?? ""}
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                        />
                                    ) : null}
                                </div>
                                <div>
                                    {m.name && <div className="text-sm font-medium">{m.name}</div>}
                                    {m.role && <div className="text-xs text-white/70">{m.role}</div>}
                                </div>
                            </div>
                        );
                    })}
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
