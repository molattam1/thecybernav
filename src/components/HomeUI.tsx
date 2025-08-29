// app/components/[locale]/HomeUI.tsx
"use client";

import { motion } from "framer-motion";
import {
    ArrowRight,
    CheckCircle2,
    Cpu,
    Layers,
    Gauge,
    Sparkles,
    TerminalSquare,
    Zap,
    Quote,
    Monitor,
    Cpu as CpuIcon,
    Keyboard,
    Settings2,
    SlidersHorizontal,
} from "lucide-react";
import { useMemo } from "react";

/* ---------- Types aligned to your Payload Global ---------- */

type Media = {
    url?: string;
    sizes?: Record<string, { url?: string }>;
};

type Feature = {
    title: string;
    description?: string;
    style?: "big" | "icon" | "shape" | "tall" | "wide";
    icon?: string;
};

type GalleryItem = {
    label?: string;
    image?: Media | string;
};

type Testimonial = {
    quote: string;
    name: string;
    role?: string;
};

type CTA = {
    headline?: string;
    description?: string;
    ctaLabel?: string;
    ctaLink?: string;
};

type HomeData = {
    hero?: {
        title?: string;
        subtitle?: string;
        primaryCTA?: string;
        primaryLink?: string;
        secondaryCTA?: string;
        secondaryLink?: string;
        deviceImage?: Media | string;
    };
    features?: Feature[];
    gallery?: GalleryItem[];
    testimonials?: Testimonial[];
    cta?: CTA;
    ticker?: string;
};

type HomeUIProps = {
    homepage: HomeData | null;
    locale: string;
};

/* ---------- Helpers ---------- */

const ICONS: Record<string, React.ReactNode> = {
    cpu: <Cpu className="h-5 w-5" />,
    layers: <Layers className="h-5 w-5" />,
    gauge: <Gauge className="h-5 w-5" />,
    sparkles: <Sparkles className="h-5 w-5" />,
    terminal: <TerminalSquare className="h-5 w-5" />,
    zap: <Zap className="h-5 w-5" />,
    monitor: <Monitor className="h-5 w-5" />,
    keyboard: <Keyboard className="h-5 w-5" />,
    sliders: <SlidersHorizontal className="h-5 w-5" />,
    settings: <Settings2 className="h-5 w-5" />,
    stm32: <CpuIcon className="h-5 w-5" />,
};

function getImageUrl(img?: Media | string): string | undefined {
    if (!img) return;
    if (typeof img === "string") return img;
    // prefer a resized variant if available
    const sized = img.sizes && Object.values(img.sizes).find((s) => s?.url);
    return sized?.url || img.url;
}

/* ---------- UI primitives ---------- */

function Card({
                  children,
                  className = "",
              }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 ${className}`}
        >
            {children}
        </div>
    );
}

function Badge({
                   children,
                   icon,
               }: {
    children: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/90">
      {icon}
            {children}
    </span>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-xl md:text-2xl font-semibold">{value}</div>
            <div className="mt-1 text-xs md:text-sm text-white/70">{label}</div>
        </div>
    );
}

function ShowcaseCard({children, imageUrl, alt}: {children?: React.ReactNode; imageUrl?: string;alt?: string;}) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/10 bg-white/5 h-72 md:h-80 grid place-items-center overflow-hidden"
        >
            {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={alt || ""} className="h-full w-full object-cover" />
            ) : (
                <span className="font-mono text-sm text-white/60">{children}</span>
            )}
        </motion.div>
    );
}

function FAQ({ q, a }: { q: string; a: string }) {
    return (
        <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-sm md:text-base font-medium">{q}</span>
                <span className="ml-4 h-6 w-6 grid place-items-center rounded-full border border-white/15 bg-white/10 text-white/70 transition group-open:rotate-45">
          +
        </span>
            </summary>
            <p className="mt-3 text-sm text-white/70">{a}</p>
        </details>
    );
}

/* ---------- Main ---------- */

export default function HomeUI({ homepage, locale }: HomeUIProps) {
    const isRTL = useMemo(() => locale === "ar", [locale]);

    // HERO (with sensible fallbacks)
    const title = homepage?.hero?.title;
    const subtitle =  homepage?.hero?.subtitle;
    const primaryCTA = homepage?.hero?.primaryCTA;
    const secondaryCTA = homepage?.hero?.secondaryCTA ;
    const primaryLink = homepage?.hero?.primaryLink;
    const secondaryLink = homepage?.hero?.secondaryLink;
    const deviceImageUrl = getImageUrl(homepage?.hero?.deviceImage);
    const tickerText = homepage?.ticker;

    return (
        <div dir={isRTL ? "rtl" : "ltr"} className="relative overflow-hidden bg-[#07080A] text-white">
            {/* BG LAYERS */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(1100px 600px at 10% -10%, rgba(120, 100, 255,0.15), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(0, 200, 255,0.10), transparent 55%)",
                    maskImage:
                        "radial-gradient(1200px 700px at 50% -20%, black 60%, transparent 100%)",
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(900px 500px at 50% 110%, rgba(85,73,113,0.35), transparent 60%)",
                }}
            />

            {/* HERO */}
            <section className="relative">
                <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
                    <div className="pt-28 md:pt-40 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* Copy */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, ease: "easeOut" }}
                            className="lg:col-span-7"
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
                                <Sparkles className="h-4 w-4 text-indigo-300" />
                                <span className="text-xs md:text-sm text-indigo-200">
                  Batch #1 — limited 50 units
                </span>
                            </div>

                            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight">
                <span className="bg-gradient-to-r from-[#A1A8D2] via-[#B8BEE7] to-[#554971] bg-clip-text text-transparent">
                  {title}
                </span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-base md:text-lg text-indigo-200/90">
                                {subtitle}
                            </p>

                            <div className={`mt-10 flex flex-wrap items-center gap-4 ${isRTL ? "justify-start" : ""}`}>
                                <a
                                    href={primaryLink}
                                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-black shadow-lg shadow-white/10 transition hover:bg-gray-200"
                                >
                                    {primaryCTA}
                                    <ArrowRight
                                        className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${isRTL ? "rotate-180" : ""}`}
                                    />
                                </a>
                                <a
                                    href={secondaryLink}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
                                >
                                    {secondaryCTA}
                                </a>
                            </div>

                            {/* Trust strip */}
                            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/70">
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                <span>Low-latency firmware</span>
                                <span className="mx-2 opacity-40">•</span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                <span>USB-C. VIA-ready</span>
                                <span className="mx-2 opacity-40">•</span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                <span>Designed in Cairo</span>
                            </div>
                        </motion.div>

                        {/* Visual */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
                            className="lg:col-span-5"
                        >
                            <div className="relative mx-auto max-w-md">
                                {/* soft glow */}
                                <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20 blur-2xl" />
                                {/* frame */}
                                <div className="relative w-full rounded-2xl border border-white/10 bg-gradient-to-br from-[#1A1323] via-[#0D1118] to-[#201A2C] p-3 shadow-[0_0_80px_rgba(120,120,255,0.15)] overflow-hidden">
                                    {/* keep a stable aspect to prevent overflow */}
                                    <div className="relative aspect-[4/3] md:aspect-[5/3] w-full rounded-xl bg-[#0F1116] grid place-items-center overflow-hidden">
                                        {deviceImageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={deviceImageUrl}
                                                alt="CyberNav device"
                                                className="max-h-full max-w-full object-contain select-none pointer-events-none"
                                                loading="eager"
                                                decoding="async"
                                            />
                                        ) : (
                                            <span className="text-sm text-white/50 font-mono">[ Device Render ]</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>

                    {/* Ticker */}
                    {tickerText ? (
                        <motion.div
                            animate={{ x: ["0%", isRTL ? "100%" : "-100%"] }}
                            transition={{ duration: 18, ease: "linear", repeat: Infinity }}
                            className="whitespace-nowrap py-3 text-xs md:text-sm text-white/70"
                        >
                            {tickerText.split("—").map((chunk, i, arr) => (
                                <span key={i} className="mx-6">
                                    {chunk.trim()}
                                    {i < arr.length - 1 ? " —" : ""}
                                    </span>
                            ))}
                        </motion.div>
                    ) : null}

                </div>
            </section>

            {/* FEATURE GRID (driven by CMS) */}
            {(homepage?.features?.length ?? 0) > 0 && (
                <section className="relative">
                    <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-24 md:py-28">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {homepage!.features!.map((f, idx) => {
                                const iconNode = f.icon ? ICONS[f.icon.toLowerCase()] : undefined;
                                const style = f.style || "icon";

                                if (style === "big") {
                                    return (
                                        <Card
                                            key={idx}
                                            className="lg:col-span-5 flex flex-col justify-end overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                            <h3 className="text-2xl md:text-3xl font-semibold">{f.title}</h3>
                                            {f.description && (
                                                <p className="mt-3 text-white/70">{f.description}</p>
                                            )}
                                            <div className="mt-6 flex gap-3">
                                                <Badge icon={<Cpu className="h-3.5 w-3.5" />}>STM32</Badge>
                                                <Badge icon={<Gauge className="h-3.5 w-3.5" />}>Low Latency</Badge>
                                                <Badge icon={<TerminalSquare className="h-3.5 w-3.5" />}>VIA</Badge>
                                            </div>
                                        </Card>
                                    );
                                }

                                if (style === "shape") {
                                    return (
                                        <Card key={idx} className="lg:col-span-7">
                                            <div className="relative h-40 md:h-48 rounded-xl border border-white/10 bg-[#101214] overflow-hidden flex items-center justify-center">
                                                <div className="absolute w-56 h-56 bg-gradient-to-tr from-teal-500/20 to-violet-500/20 rounded-full blur-2xl" />
                                                <span className="text-white/60 font-mono relative z-10">
                          {f.title}
                        </span>
                                            </div>
                                            {f.description && (
                                                <p className="mt-4 text-white/70">{f.description}</p>
                                            )}
                                        </Card>
                                    );
                                }

                                // tall / wide share similar layout tweaks
                                if (style === "tall") {
                                    return (
                                        <Card key={idx} className="lg:row-span-2 lg:col-span-5">
                                            <h4 className="text-lg font-semibold">{f.title}</h4>
                                            {f.description && (
                                                <p className="mt-2 text-white/70">{f.description}</p>
                                            )}
                                            <div className="mt-6 h-40 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-white/50">
                                                [ schematic / encoder sketch ]
                                            </div>
                                        </Card>
                                    );
                                }

                                if (style === "wide") {
                                    return (
                                        <Card key={idx} className="lg:col-span-12">
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                <div>
                                                    <h4 className="text-xl font-semibold">{f.title}</h4>
                                                    {f.description && (
                                                        <p className="mt-2 text-white/70 max-w-2xl">{f.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge icon={<Sparkles className="h-3.5 w-3.5" />}>
                                                        Studio finish
                                                    </Badge>
                                                    <Badge icon={<Layers className="h-3.5 w-3.5" />}>Modular</Badge>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                }

                                // default: "icon"
                                return (
                                    <Card key={idx} className="lg:col-span-7 sm:flex sm:items-start sm:gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                            {iconNode || <Sparkles className="h-5 w-5" />}
                                        </div>
                                        <div className="mt-4 sm:mt-0">
                                            <h4 className="text-lg font-semibold">{f.title}</h4>
                                            {f.description && (
                                                <p className="mt-2 text-white/70">{f.description}</p>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* STATS (tasteful defaults; keep or remove) */}
            <section className="border-y border-white/10 bg-white/5">
                <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <Stat value="≤ 2 ms" label="Firmware jitter" />
                    <Stat value="50 units" label="Batch #1" />
                    <Stat value="2 encoders" label="Push + detent" />
                    <Stat value="USB-C" label="Modern I/O" />
                </div>
            </section>

            {/* SHOWCASE / GALLERY (driven by CMS) */}
            {(homepage?.gallery?.length ?? 0) > 0 && (
                <section>
                    <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-24 md:py-28">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl md:text-5xl font-semibold text-center"
                        >
                            A tool. A statement. A companion.
                        </motion.h2>

                        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {homepage!.gallery!.slice(0, 2).map((g, i) => (
                                <ShowcaseCard
                                    key={`g-top-${i}`}
                                    imageUrl={getImageUrl(g.image)}
                                    alt={g.label}
                                >
                                    {g.label || "[ render ]"}
                                </ShowcaseCard>
                            ))}
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {homepage!.gallery!.slice(2, 5).map((g, i) => (
                                <ShowcaseCard
                                    key={`g-bot-${i}`}
                                    imageUrl={getImageUrl(g.image)}
                                    alt={g.label}
                                >
                                    {g.label || "[ detail shot ]"}
                                </ShowcaseCard>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* TESTIMONIALS (driven by CMS with fallback) */}
            <section className="relative">
                <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-24 md:py-28">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-5xl font-semibold text-center"
                    >
                        {locale === "ar" ? "موثوق من قبل صانعي المحتوى الأوائل" : "Trusted by early creators"}
                    </motion.h2>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(homepage?.testimonials?.length ? homepage.testimonials : TESTIMONIALS).map(
                            (t, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -4 }}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl"
                                >
                                    <Quote className="h-5 w-5 text-white/50" />
                                    <p className="mt-4 text-sm leading-relaxed text-white/80">“{t.quote}”</p>
                                    <div className="mt-6">
                                        <p className="text-white font-medium">{t.name}</p>
                                        {t.role && <p className="text-white/60 text-xs">{t.role}</p>}
                                    </div>
                                </motion.div>
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* FAQ (static sample; swap to CMS later if needed) */}
            <section className="border-t border-white/10">
                <div className="mx-auto max-w-5xl px-6 md:px-12 lg:px-16 py-20">
                    <motion.h3
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl md:text-3xl font-semibold"
                    >
                        {locale === "ar" ? "الأسئلة الشائعة" : "Frequently asked"}
                    </motion.h3>

                    <div className="mt-8 space-y-3">
                        <FAQ
                            q={locale === "ar" ? "متى يتم شحن الدفعة الأولى؟" : "When does Batch #1 ship?"}
                            a={
                                locale === "ar"
                                    ? "قريباً. نقوم بإنهاء خطوات التصنيع الأخيرة؛ الحجز المسبق يضمن مكانك ضمن أول 50 وحدة."
                                    : "Soon. We’re validating the last mile of assembly; pre-orders secure your place in the first 50 units."
                            }
                        />
                        <FAQ
                            q={locale === "ar" ? "هل يدعم VIA؟" : "Is it VIA compatible?"}
                            a={locale === "ar" ? "نعم، يدعم الخرائط والطبقات بسهولة." : "Yes. You can remap and create layered macros with ease."}
                        />
                        <FAQ
                            q={locale === "ar" ? "هل الشحن عالمي؟" : "Worldwide shipping?"}
                            a={
                                locale === "ar"
                                    ? "نعم. تختلف الرسوم والضرائب بحسب البلد وتُحسب عند الدفع."
                                    : "Yes. Duties/taxes vary by country and are calculated at checkout."
                            }
                        />
                    </div>
                </div>
            </section>

            {/* FINAL CTA (driven by CMS with fallback) */}
            <section>
                <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-28">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent p-10 md:p-16">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-1 rounded-3xl"
                            style={{
                                background:
                                    "radial-gradient(800px 280px at 20% 10%, rgba(160,160,255,0.15), transparent 60%)",
                            }}
                        />
                        <div className="relative z-10 text-center">
                            <motion.h2
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-3xl md:text-5xl font-semibold tracking-tight"
                            >
                                {homepage?.cta?.headline ?? (locale === "ar" ? "مستقبل الإدخال بين يديك" : "The future of input, in your hands")}
                            </motion.h2>
                            <p className="mx-auto mt-4 max-w-2xl text-white/75">
                                {homepage?.cta?.description ??
                                    (locale === "ar"
                                        ? "الدفعة الأولى محدودة. احجز وحدتك وانضم إلى أوائل المبدعين الذين يشكلون CyberNav."
                                        : "Batch #1 is limited. Reserve your unit and join the earliest wave of creators shaping CyberNav.")}
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <a
                                    href={homepage?.cta?.ctaLink ?? primaryLink}
                                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-black shadow-lg shadow-white/10 transition hover:bg-gray-200"
                                >
                                    {homepage?.cta?.ctaLabel ?? primaryCTA}
                                    <ArrowRight
                                        className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${isRTL ? "rotate-180" : ""}`}
                                    />
                                </a>
                                <a
                                    href={secondaryLink}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
                                >
                                    {secondaryCTA}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ---------- Fallback testimonials ---------- */

const TESTIMONIALS: Testimonial[] = [
    {
        quote:
            "The CyberNav became my daily driver in minutes — simple, precise, and absolutely gorgeous.",
        name: "Aly H.",
        role: "Designer, Cairo",
    },
    {
        quote:
            "Finally, a macro pad that doesn’t look like a toy. It belongs on a premium desk setup.",
        name: "Nour M.",
        role: "Productivity YouTuber",
    },
    {
        quote:
            "I can’t imagine editing without it. The knobs feel premium; every click feels intentional.",
        name: "Omar K.",
        role: "Video Editor",
    },
];
