// app/components/[locale]/HomeUI.tsx
"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useMotionValue,
    useMotionValueEvent,
    useTransform,
} from "framer-motion";
import {
    ArrowRight,
    ChevronDown,
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
    Globe,
} from "lucide-react";
import { FullBleedModelStage, useHasWebGL } from "@/components/3d/Stage";
import { getImageUrl } from "@/lib/media";
import Image from "next/image";

// --- TYPES ---
type Media = { url?: string; sizes?: Record<string, { url?: string }> };
type Feature = {
    title: string;
    description?: string;
    style?: "big" | "icon" | "shape" | "tall" | "wide" | "planet";
    icon?: string;
};
type CTA = { headline?: string; description?: string; ctaLabel?: string; ctaLink?: string };
type Testimonial = { quote: string; name: string; role?: string };
type FAQItem = { q: string; a: string };
type FAQSection = { title?: string; items?: FAQItem[] };
type GalleryItem = { label?: string; image?: Media | string };
type GallerySection = { title?: string; description?: string; items?: GalleryItem[] };

type HomeData = {
    hero?: {
        title?: string;
        subtitle?: string;
        primaryCTA?: string;
        primaryLink?: string;
        secondaryCTA?: string;
        secondaryLink?: string;
        deviceImage?: Media | string;
        badge?: string;
        tag1?: string;
        tag2?: string;
        tag3?: string;
    };
    features?: Feature[];
    gallery?: GallerySection;
    testimonials?: { title?: string; description?: string; items?: Testimonial[] };
    cta?: CTA;
    ticker?: string;
    faq?: FAQSection;
};

type HomeUIProps = { homepage: HomeData | null; locale: string };

// --- THEME & ICONS ---
const THEME = {
    bg: "#07080A",
    text: "#E8EAFF",
    glass: "bg-white/[0.04] backdrop-blur-xl",
    stroke: "border-white/12",
    glowA: "#7C8BFF",
    glowB: "#00E0FF",
    tint: "#554971",
    soft: "#B8BEE7",
    star: "#FFFFFF44",
};

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
    globe: <Globe className="h-5 w-5" />,
};

// --- ENHANCEMENTS ---
/** Starfield background (canvas) */
function Starfield() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { scrollYProgress } = useScroll();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let stars: { x: number; y: number; z: number }[] = [];
        let animationFrameId = 0;

        const setup = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stars = [];
            for (let i = 0; i < 1200; i++) {
                stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, z: Math.random() * canvas.width });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = THEME.star;
            const scrollOffset = scrollYProgress.get() * canvas.height * 0.5;

            for (const star of stars) {
                star.z -= 0.2;
                if (star.z <= 0) star.z = canvas.width;
                const x = (star.x - canvas.width / 2) * (canvas.width / star.z) + canvas.width / 2;
                const y = (star.y - canvas.height / 2) * (canvas.width / star.z) + canvas.height / 2 + scrollOffset;
                const r = Math.max(0.1, (1 - star.z / canvas.width) * 2.5);
                if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        setup();
        draw();

        const handleResize = () => setup();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [scrollYProgress]);

    return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-20 h-full w-full" />;
}

/** Cursor glow follower */
function CursorLight() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springCfg = { damping: 100, stiffness: 400, mass: 0.9 };
    const sx = useSpring(mouseX, springCfg);
    const sy = useSpring(mouseY, springCfg);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            className="pointer-events-none fixed inset-0 -z-10"
            style={{ x: sx, y: sy, background: `radial-gradient(600px at -200px -200px, ${THEME.glowA}22, transparent 80%)` }}
        />
    );
}

/** 3D tilt/hover card */
function InteractiveCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rotateX = useTransform(my, [-150, 150], [10, -10]);
    const rotateY = useTransform(mx, [-150, 150], [-10, 10]);
    const rx = useSpring(rotateX, { stiffness: 300, damping: 20, mass: 0.5 });
    const ry = useSpring(rotateY, { stiffness: 300, damping: 20, mass: 0.5 });

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        mx.set(e.clientX - left - width / 2);
        my.set(e.clientY - top - height / 2);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={() => {
                mx.set(0);
                my.set(0);
            }}
            style={{ transformStyle: "preserve-3d", rotateX: rx, rotateY: ry }}
            className={className}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
            <Surface className="h-full">
                <div style={{ transform: "translateZ(40px)" }}>{children}</div>
            </Surface>
        </motion.div>
    );
}

/** Concentric orbital rings behind hero */
function OrbitalGlow() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative h-[600px] w-[600px]">
                <motion.div className="absolute inset-0 rounded-full border border-white/5" animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute inset-12 rounded-full border border-white/5" animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute inset-28 rounded-full border border-white/10" />
            </div>
        </div>
    );
}

// --- CORE PRIMITIVES ---
function GradientRing() {
    return (
        <span
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-2xl"
            style={{
                background: `linear-gradient(135deg, ${THEME.glowA}33, transparent 40%), linear-gradient(315deg, ${THEME.glowB}33, transparent 40%)`,
                WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                padding: 1,
            }}
        />
    );
}

function Surface({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl border ${THEME.stroke} ${THEME.glass} ${className}`}>
            <GradientRing />
            {children}
        </div>
    );
}


function Badge({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] md:text-xs text-white/90">{icon} {children}</span>
    );
}

function KButton({ href, children, primary, rtl = false }: { href?: string; children: React.ReactNode; primary?: boolean; rtl?: boolean }) {
    const base = primary ? "bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10" : "border border-white/15 bg-white/5 text-white hover:bg-white/10";
    const isDisabled = !href;
    return (
        <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={href || "#"} aria-disabled={isDisabled} className={`group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm md:text-base font-medium transition ${base} ${isDisabled ? "pointer-events-none opacity-60" : ""}`}>
            {children}
            <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${rtl ? "rotate-180" : ""}`} />
        </motion.a>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <Surface className="p-4 md:p-5 text-center">
            <div className="text-lg md:text-2xl font-semibold tracking-tight">{value}</div>
            <div className="mt-1 text-[11px] md:text-sm text-white/70">{label}</div>
        </Surface>
    );
}

function ShowcaseCard({ children, imageUrl, alt }: { children?: React.ReactNode; imageUrl?: string; alt?: string }) {
    const hasSrc = !!imageUrl;
    return (
        <InteractiveCard className="h-56 sm:h-64 md:h-80">
            <div className="h-full grid place-items-center overflow-hidden p-6 md:p-8">
                {hasSrc ? (
                    <div className="relative h-full w-full">
                        <Image
                            src={imageUrl!}
                            alt={alt || ""}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                            className="object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                ) : (
                    <span className="font-mono text-sm text-white/60">{children}</span>
                )}
            </div>
        </InteractiveCard>
    );
}

function FAQ({ q, a }: { q: string; a: string }) {
    return (
        <Surface className="p-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:bg-white/7">
            <details className="group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
                    <span className="text-sm md:text-base font-medium">{q}</span>
                    <span className="inline-grid place-items-center rounded-full h-7 w-7 border border-white/15 bg-white/10 text-white/70 transition-transform duration-300 group-open:rotate-180">
            <ChevronDown className="h-4 w-4" />
          </span>
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr] border-t border-white/10">
                    <div className="overflow-hidden">
                        <p className="px-5 py-4 text-sm text-white/70">{a}</p>
                    </div>
                </div>
            </details>
        </Surface>
    );
}

function NeonTicker({ text, rtl }: { text?: string; rtl: boolean }) {
    if (!text) return null;
    const chunks = text.split("—").map((c) => c.trim()).filter(Boolean);
    const line = chunks.join("   •   ");
    return (
        <div className="relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(90deg, ${THEME.bg} 0%, transparent 15%, transparent 85%, ${THEME.bg} 100%)` }} />
            <motion.div role="marquee" aria-label={line} className="whitespace-nowrap py-3 text-xs md:text-sm text-white/80 [text-shadow:0_0_10px_rgba(160,200,255,.25)]" animate={{ x: rtl ? ["0%", "100%"] : ["0%", "-100%"] }} transition={{ duration: 22, ease: "linear", repeat: Infinity }}>
                <span className="mx-6">{line}</span>
                <span className="mx-6">{line}</span>
                <span className="mx-6">{line}</span>
            </motion.div>
        </div>
    );
}

// --- MAIN ---
export default function HomeUI({ homepage, locale }: HomeUIProps) {
    const isRTL = useMemo(() => locale === "ar", [locale]);
    const { title, subtitle, primaryCTA, primaryLink, secondaryCTA, secondaryLink, deviceImage, badge, tag1, tag2, tag3 } = homepage?.hero || {};
    const deviceImageUrl = getImageUrl(deviceImage);
    const tickerText = homepage?.ticker || "";

    const heroRef = useRef<HTMLElement | null>(null);
    const hasWebGL = useHasWebGL();
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start end", "end start"] });
    const spring = useSpring(scrollYProgress, { stiffness: 120, damping: 50, mass: 0.4 });
    const [progress, setProgress] = useState(0);
    const invalidateKey = useMotionValue(0);

    useMotionValueEvent(spring, "change", (v) => {
        setProgress(v);
        invalidateKey.set(invalidateKey.get() + 1);
    });

    const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    return (
        <main dir={isRTL ? "rtl" : "ltr"} className="relative overflow-hidden" style={{ backgroundColor: THEME.bg, color: THEME.text }}>
            {/* Atmospheric layers */}
            <Starfield />
            <CursorLight />

            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0" style={{ background: `radial-gradient(1200px 700px at 12% -10%, ${THEME.glowA}26, transparent 60%), radial-gradient(1000px 600px at 88% 8%, ${THEME.glowB}1f, transparent 55%)`, maskImage: "radial-gradient(1200px_700px_at_50%_-20%, black 60%, transparent 100%)" }} />
                <div className="absolute inset-0" style={{ background: `radial-gradient(900px 500px at 50% 110%, ${THEME.tint}59, transparent 60%)` }} />
            </div>

            {/* HERO */}
            <section ref={heroRef} className="relative">
                <div className="pointer-events-none absolute inset-0 z-0">
                    <div className="sticky top-0 h-[90vh] md:h-[100vh]">
                        <OrbitalGlow />
                        <div className="absolute inset-0 [mask-image:radial-gradient(1400px_800px_at_60%_30%,black_68%,transparent_100%)]">
                            {hasWebGL ? (
                                <FullBleedModelStage progress={progress} invalidateKey={invalidateKey.get()} reducedMotion={!!reducedMotion} />
                            ) : deviceImageUrl ? (
                                <div className="relative h-full w-full">
                                    <Image src={deviceImageUrl} alt="CyberNav device" fill priority sizes="100vw" className="object-contain opacity-90" decoding="async" />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 md:px-12 lg:px-16">
                    <div className="pt-24 sm:pt-28 md:pt-40 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-center">
                        <motion.div initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.65, ease: "easeOut" }} className="lg:col-span-7">
                            {badge && <Badge icon={<Sparkles className="h-3.5 w-3.5" />}>{badge}</Badge>}
                            <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.07] tracking-tight">
                                <span className="bg-gradient-to-r from-[#A1A8D2] via-[#B8BEE7] to-[#554971] bg-clip-text text-transparent">{title}</span>
                            </h1>
                            {subtitle && <p className="mt-4 sm:mt-6 max-w-2xl text-base md:text-lg text-indigo-200/90">{subtitle}</p>}
                            <div className={`mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4 ${isRTL ? "justify-start" : ""}`}>
                                {primaryCTA && (
                                    <KButton href={primaryLink} primary rtl={isRTL}>
                                        {primaryCTA}
                                    </KButton>
                                )}
                                {secondaryCTA && (
                                    <KButton href={secondaryLink} rtl={isRTL}>
                                        {secondaryCTA}
                                    </KButton>
                                )}
                            </div>
                            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/80">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>{tag1}</span>
                </span>
                                <span className="opacity-40">•</span>
                                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>{tag2}</span>
                </span>
                                <span className="opacity-40">•</span>
                                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>{tag3}</span>
                </span>
                            </div>
                        </motion.div>
                        <div className="lg:col-span-5" />
                    </div>
                    <NeonTicker text={tickerText} rtl={isRTL} />
                </div>
            </section>

            {/* QUICK STATS */}
            <section>
                <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-12 lg:px-16 py-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <Stat value="≤ 2 ms" label="Firmware jitter" />
                    <Stat value="50 units" label="Batch #1" />
                    <Stat value="2 encoders" label="Push + detent" />
                    <Stat value="USB-C" label="Modern I/O" />
                </div>
            </section>

            {/* FEATURES */}
            {(homepage?.features?.length ?? 0) > 0 && (
                <section className="relative">
                    <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-12 lg:px-16 py-20 md:py-28">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8 [perspective:2000px]">
                            {(homepage?.features ?? []).map((f, idx) => {
                                const iconNode = f.icon ? ICONS[f.icon.toLowerCase()] : undefined;
                                const style = f.style || "icon";

                                // planet style
                                if (style === "planet") {
                                    return (
                                        <InteractiveCard key={`feature-planet-${idx}`} className="lg:col-span-5">
                                            <div className="p-6 md:p-8 flex flex-col justify-between h-full">
                                                <div>
                                                    <h3 className="text-2xl md:text-3xl font-semibold">{f.title}</h3>
                                                    {f.description ? <p className="mt-3 text-white/70">{f.description}</p> : null}
                                                </div>
                                                <div className="relative h-32 w-32 self-center mt-6">
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/40 to-violet-500/40 rounded-full blur-xl" />
                                                    <div className="absolute inset-2 bg-[#0d0f11] rounded-full grid place-items-center">
                                                        <Globe className="h-10 w-10 text-white/40" />
                                                    </div>
                                                </div>
                                            </div>
                                        </InteractiveCard>
                                    );
                                }

                                if (style === "big") {
                                    return (
                                        <InteractiveCard key={`feature-big-${idx}`} className="lg:col-span-5">
                                            <div className="p-6 md:p-8 flex flex-col justify-end">
                                                <h3 className="text-2xl md:text-3xl font-semibold">{f.title}</h3>
                                                {f.description ? <p className="mt-3 text-white/70">{f.description}</p> : null}
                                                <div className="mt-6 flex flex-wrap gap-3">
                                                    <Badge icon={<Cpu className="h-3.5 w-3.5" />}>STM32</Badge>
                                                    <Badge icon={<Gauge className="h-3.5 w-3.5" />}>Low Latency</Badge>
                                                    <Badge icon={<TerminalSquare className="h-3.5 w-3.5" />}>VIA</Badge>
                                                </div>
                                            </div>
                                        </InteractiveCard>
                                    );
                                }

                                if (style === "shape") {
                                    return (
                                        <InteractiveCard key={`feature-shape-${idx}`} className="lg:col-span-7">
                                            <div className="relative h-36 sm:h-40 md:h-48 rounded-xl border border-white/10 bg-[#101214] overflow-hidden flex items-center justify-center">
                                                <div className="absolute w-56 h-56 bg-gradient-to-tr from-teal-500/20 to-violet-500/20 rounded-full blur-2xl" />
                                                <span className="text-white/60 font-mono relative z-10">{f.title}</span>
                                            </div>
                                            {f.description ? <p className="mt-4 text-white/70">{f.description}</p> : null}
                                        </InteractiveCard>
                                    );
                                }

                                if (style === "tall") {
                                    return (
                                        <InteractiveCard key={`feature-tall-${idx}`} className="lg:row-span-2 lg:col-span-5">
                                            <div className="p-6 md:p-8">
                                                <h4 className="text-lg font-semibold">{f.title}</h4>
                                                {f.description ? <p className="mt-2 text-white/70">{f.description}</p> : null}
                                                <div className="mt-6 h-36 sm:h-40 md:h-48 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-white/50">[Render]</div>
                                            </div>
                                        </InteractiveCard>
                                    );
                                }

                                if (style === "wide") {
                                    return (
                                        <InteractiveCard key={`feature-wide-${idx}`} className="lg:col-span-12">
                                            <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                <div>
                                                    <h4 className="text-xl font-semibold">{f.title}</h4>
                                                    {f.description ? <p className="mt-2 text-white/70 max-w-2xl">{f.description}</p> : null}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge icon={<Sparkles className="h-3.5 w-3.5" />}>Studio finish</Badge>
                                                    <Badge icon={<Layers className="h-3.5 w-3.5" />}>Modular</Badge>
                                                </div>
                                            </div>
                                        </InteractiveCard>
                                    );
                                }

                                return (
                                    <InteractiveCard key={`feature-icon-${idx}`} className="lg:col-span-7">
                                        <div className="p-6 md:p-8 sm:flex sm:items-start sm:gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">{iconNode || <Sparkles className="h-5 w-5" />}</div>
                                            <div className="mt-4 sm:mt-0">
                                                <h4 className="text-lg font-semibold">{f.title}</h4>
                                                {f.description ? <p className="mt-2 text-white/70">{f.description}</p> : null}
                                            </div>
                                        </div>
                                    </InteractiveCard>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* GALLERY */}
            {(homepage?.gallery?.items?.length ?? 0) > 0 ? (
                <section>
                    <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-12 lg:px-16 py-20 md:py-28">
                        {homepage?.gallery?.title ? (
                            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-3xl md:text-5xl font-semibold text-center">
                                {homepage.gallery.title}
                            </motion.h2>
                        ) : null}
                        {homepage?.gallery?.description ? <p className="mt-4 text-center text-white/70 max-w-2xl mx-auto">{homepage.gallery.description}</p> : null}
                        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 [perspective:2000px]">
                            {(homepage?.gallery?.items ?? []).slice(0, 2).map((g, i) => (
                                <ShowcaseCard key={`g-top-${i}`} imageUrl={getImageUrl(g.image)} alt={g.label}>
                                    {g.label || "[ render ]"}
                                </ShowcaseCard>
                            ))}
                        </div>
                        <div className="mt-5 md:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 [perspective:2000px]">
                            {(homepage?.gallery?.items ?? []).slice(2, 5).map((g, i) => (
                                <ShowcaseCard key={`g-bot-${i}`} imageUrl={getImageUrl(g.image)} alt={g.label}>
                                    {g.label || "[ detail shot ]"}
                                </ShowcaseCard>
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            {/* TESTIMONIALS */}
            {(homepage?.testimonials?.items?.length ?? 0) > 0 ? (
                <section className="relative">
                    <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-12 lg:px-16 py-20 md:py-28">
                        {homepage?.testimonials?.title ? (
                            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-3xl md:text-5xl font-semibold text-center">
                                {homepage.testimonials.title}
                            </motion.h2>
                        ) : null}
                        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 [perspective:2000px]">
                            {(homepage?.testimonials?.items ?? []).map((t, i) => (
                                <InteractiveCard key={`t-${i}`}>
                                    <div className="p-6 md:p-8">
                                        <Quote className="h-5 w-5 text-white/50" />
                                        <p className="mt-4 text-sm leading-relaxed text-white/85">“{t.quote}”</p>
                                        <div className="mt-6">
                                            <p className="text-white font-medium">{t.name}</p>
                                            {t.role && <p className="text-white/60 text-xs">{t.role}</p>}
                                        </div>
                                    </div>
                                </InteractiveCard>
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            {/* FAQ */}
            {(homepage?.faq?.items?.length ?? 0) > 0 ? (
                <section>
                    <div className="mx-auto max-w-5xl px-5 sm:px-6 md:px-12 lg:px-16 py-16 md:py-20">
                        {homepage?.faq?.title ? (
                            <motion.h3 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-2xl md:text-3xl font-semibold">
                                {homepage.faq.title}
                            </motion.h3>
                        ) : null}
                        <div className="mt-6 md:mt-8 grid grid-cols-1 gap-4">
                            {(homepage?.faq?.items ?? []).map((item, i) => (
                                <FAQ key={`faq-${i}`} q={item.q} a={item.a} />
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            {/* CTA */}
            <section>
                <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-12 lg:px-16 py-20 md:py-28">
                    <InteractiveCard>
                        <div className="relative z-10 text-center p-8 sm:p-10 md:p-16">
                            {homepage?.cta?.headline && (
                                <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-3xl md:text-5xl font-semibold tracking-tight">
                                    {homepage.cta.headline}
                                </motion.h2>
                            )}
                            {homepage?.cta?.description && <p className="mx-auto mt-4 max-w-2xl text-white/80">{homepage.cta.description}</p>}
                            <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
                                {primaryCTA && (
                                    <KButton href={primaryLink} primary rtl={isRTL}>
                                        {primaryCTA}
                                    </KButton>
                                )}
                                {secondaryCTA && (
                                    <KButton href={secondaryLink} rtl={isRTL}>
                                        {secondaryCTA}
                                    </KButton>
                                )}
                            </div>
                        </div>
                    </InteractiveCard>
                </div>
            </section>
        </main>
    );
}
