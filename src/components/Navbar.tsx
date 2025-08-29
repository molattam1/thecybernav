"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown, ShoppingCart } from "lucide-react";

/* ---------- Config ---------- */

type NavLink = { label: string; href: (locale: string) => string };

const SUPPORTED_LOCALES = ["en", "ar", "de", "ru"] as const;

const NAV_LINKS: NavLink[] = [
    { label: "Home", href: (l) => `/${l}` },
    { label: "MacroPad", href: (l) => `/${l}/products/macropad` },
    // "Support" becomes a dropdown — we’ll inject it manually in render
];

/* ---------- Utils ---------- */

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function replaceLocale(pathname: string, newLocale: string) {
    const segs = pathname.split("/");
    if (segs.length < 2 || segs[1] === "") segs[1] = newLocale;
    else segs[1] = newLocale;
    return segs.join("/") || `/${newLocale}`;
}

/* ---------- Support Menu (Desktop) ---------- */

function SupportDesktop({
                            locale,
                            isRTL,
                            labels = {
                                support: "Support",
                                about: "About us",
                                contact: "Contact us",
                                docs: "Documentation",
                            },
                        }: {
    locale: string;
    isRTL?: boolean;
    labels?: { support: string; about: string; contact: string; docs: string };
}) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const popRef = useRef<HTMLDivElement | null>(null);

    // close on click outside
    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!open) return;
            const t = e.target as Node;
            if (btnRef.current?.contains(t)) return;
            if (popRef.current?.contains(t)) return;
            setOpen(false);
        }
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="menu"
                className={cn(
                    "relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition",
                    "text-white/70 hover:text-white rounded-xl"
                )}
            >
                {labels.support}
                <motion.span
                    aria-hidden
                    initial={false}
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.16 }}
                    className="inline-flex"
                >
                    <ChevronDown size={16} />
                </motion.span>
                {open && (
                    <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-xl bg-white/10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* click-away */}
                        <motion.div
                            className="fixed inset-0 z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            ref={popRef}
                            role="menu"
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.12 }}
                            className={cn(
                                "absolute z-20 mt-2 min-w-48 rounded-xl border border-white/10 bg-[#0D0F14]/95",
                                "backdrop-blur p-1 shadow-[0_20px_80px_rgba(0,0,0,0.4)]"
                            )}
                            style={{ [isRTL ? "right" : "left"]: 0 } as React.CSSProperties}
                        >
                            <Link
                                href={`/${locale}/about`}
                                className="block w-full rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                            >
                                {labels.about}
                            </Link>
                            <Link
                                href={`/${locale}/contact`}
                                className="block w-full rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                            >
                                {labels.contact}
                            </Link>
                            <Link
                                href={`/${locale}/docs`}
                                className="block w-full rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                            >
                                {labels.docs}
                            </Link>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ---------- Component ---------- */

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [langOpenMobile, setLangOpenMobile] = useState(false);
    const [elevated, setElevated] = useState(false);

    const params = useParams();
    const pathname = usePathname() || "/";
    const searchParams = useSearchParams();
    const locale = (params?.locale as string) || "en";
    const isRTL = useMemo(() => locale === "ar", [locale]);

    // Close menus on route change
    const prevPath = useRef(pathname);
    useEffect(() => {
        if (prevPath.current !== pathname) {
            setOpen(false);
            setLangOpen(false);
            setLangOpenMobile(false);
            prevPath.current = pathname;
        }
    }, [pathname]);

    // Elevation on scroll
    useEffect(() => {
        const onScroll = () => setElevated(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const query = searchParams?.toString();
    const withQuery = (p: string) => (query ? `${p}?${query}` : p);

    const navLinks = NAV_LINKS.map((l) => ({
        label: l.label,
        href: l.href(locale),
    }));

    const isActive = (href: string) =>
        pathname === href || (href !== `/${locale}` && pathname.startsWith(href));

    return (
        <header
            className={cn(
                "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-[86%] lg:w-[78%] transition-all"
            )}
            dir={isRTL ? "rtl" : "ltr"}
        >
            <nav
                className={cn(
                    "relative flex items-center justify-between rounded-2xl border px-4 sm:px-6 py-3",
                    "backdrop-blur-xl bg-white/[0.06] border-white/10",
                    "shadow-[0_10px_40px_rgba(120,120,255,0.12)]",
                    elevated && "bg-white/[0.08] border-white/15"
                )}
            >
                {/* Left: Brand */}
                <Link
                    href={`/${locale}`}
                    className="font-semibold tracking-tight text-white text-base sm:text-lg"
                    aria-label="CyberNav Home"
                >
          <span className="bg-gradient-to-r from-[#B8BEE7] via-white to-[#8EA0FF] bg-clip-text text-transparent">
            thecybernav
          </span>
                </Link>

                {/* Center: Nav links (desktop) */}
                <ul className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={withQuery(link.href)}
                                className={cn(
                                    "relative px-3 py-2 text-sm font-medium transition",
                                    "text-white/70 hover:text-white"
                                )}
                            >
                                {link.label}
                                {isActive(link.href) && (
                                    <motion.span
                                        layoutId="nav-active"
                                        className="absolute inset-0 -z-10 rounded-xl bg-white/10"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </Link>
                        </li>
                    ))}

                    {/* Inject Support dropdown (desktop) */}
                    <li>
                        <SupportDesktop locale={locale} isRTL={isRTL} />
                    </li>
                </ul>

                {/* Right: Cart + Language (desktop) */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href={`/${locale}/cart`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition"
                        aria-label="Cart"
                    >
                        <ShoppingCart size={18} />
                    </Link>

                    {/* lang wrapper */}
                    <div className="relative">
                        <button
                            onClick={() => setLangOpen((v) => !v)}
                            aria-expanded={langOpen}
                            aria-haspopup="listbox"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition"
                        >
                            <Globe size={16} />
                            <span className="tabular-nums">{locale.toUpperCase()}</span>
                            <ChevronDown
                                size={16}
                                className={cn("transition", langOpen && "rotate-180")}
                            />
                        </button>

                        <AnimatePresence>
                            {langOpen && (
                                <motion.ul
                                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    transition={{ duration: 0.12 }}
                                    role="listbox"
                                    className={cn(
                                        "absolute top-full right-0 mt-2 z-50 min-w-36 overflow-hidden rounded-xl border border-white/10",
                                        "bg-[#0B0D12]/95 backdrop-blur-xl shadow-2xl"
                                    )}
                                >
                                    {SUPPORTED_LOCALES.map((loc) => {
                                        const href = withQuery(replaceLocale(pathname, loc));
                                        return (
                                            <li key={loc}>
                                                <Link
                                                    href={href}
                                                    className={cn(
                                                        "block px-3.5 py-2 text-sm transition",
                                                        "hover:bg-white/10 text-white/80 hover:text-white",
                                                        loc === locale && "bg-white/10 text-white"
                                                    )}
                                                    onClick={() => setLangOpen(false)}
                                                    role="option"
                                                    aria-selected={loc === locale}
                                                >
                                                    {loc.toUpperCase()}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="md:hidden ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    aria-controls="mobile-drawer"
                >
                    {open ? <X size={18} /> : <Menu size={18} />}
                </button>
            </nav>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        id="mobile-drawer"
                        initial={{ y: -8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -8, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        className={cn(
                            "md:hidden mt-2 overflow-hidden rounded-2xl border border-white/10",
                            "bg-[#0B0D12]/95 backdrop-blur-xl shadow-[0_20px_80px_rgba(80,80,255,0.18)]"
                        )}
                    >
                        <ul className="flex flex-col">
                            {navLinks.map((link) => (
                                <li key={link.href} className="border-b border-white/5 last:border-none">
                                    <Link
                                        href={withQuery(link.href)}
                                        className={cn(
                                            "block px-5 py-4 text-base font-medium transition",
                                            "text-white/85 hover:text-white",
                                            isActive(link.href) && "bg-white/10"
                                        )}
                                        onClick={() => setOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}

                            {/* Support collapsible (mobile) */}
                            <MobileCollapsible
                                title="Support"
                                items={[
                                    { label: "About us", href: `/${locale}/about` },
                                    { label: "Contact us", href: `/${locale}/contact` },
                                    { label: "Documentation", href: `/${locale}/docs` },
                                ]}
                                onNavigate={() => setOpen(false)}
                            />

                            {/* Cart link in mobile */}
                            <li className="border-b border-white/5">
                                <Link
                                    href={`/${locale}/cart`}
                                    className="flex items-center gap-3 px-5 py-4 text-base font-medium text-white/85 hover:text-white hover:bg-white/10 transition"
                                    onClick={() => setOpen(false)}
                                >
                                    <ShoppingCart size={18} />
                                    Cart
                                </Link>
                            </li>

                            {/* Languages collapsible */}
                            <li className="border-t border-white/10">
                                <button
                                    onClick={() => setLangOpenMobile((v) => !v)}
                                    aria-expanded={langOpenMobile}
                                    aria-controls="mobile-lang"
                                    className="w-full flex items-center justify-between gap-2 px-5 py-4 text-base font-medium text-white/85 hover:text-white"
                                >
                  <span className="inline-flex items-center gap-2">
                    <Globe size={18} />
                    Languages
                  </span>
                                    <ChevronDown
                                        size={18}
                                        className={cn("transition", langOpenMobile && "rotate-180")}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {langOpenMobile && (
                                        <motion.ul
                                            id="mobile-lang"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.16 }}
                                            className="overflow-hidden"
                                        >
                                            {SUPPORTED_LOCALES.map((loc) => {
                                                const href = withQuery(replaceLocale(pathname, loc));
                                                return (
                                                    <li key={loc} className="border-t border-white/5">
                                                        <Link
                                                            href={href}
                                                            className={cn(
                                                                "block px-6 py-3 text-sm transition",
                                                                "text-white/80 hover:text-white hover:bg-white/10",
                                                                loc === locale && "bg-white/10 text-white"
                                                            )}
                                                            onClick={() => {
                                                                setOpen(false);
                                                                setLangOpenMobile(false);
                                                            }}
                                                        >
                                                            {loc.toUpperCase()}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

/* ---------- Mobile Collapsible helper ---------- */
function MobileCollapsible({
                               title,
                               items,
                               onNavigate,
                           }: {
    title: string;
    items: { label: string; href: string }[];
    onNavigate?: () => void;
}) {
    const [open, setOpen] = useState(false);
    return (
        <li className="border-b border-white/5">
            <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-2 px-5 py-4 text-base font-medium text-white/85 hover:text-white"
            >
                <span>{title}</span>
                <motion.span
                    initial={false}
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.16 }}
                    className="inline-flex"
                >
                    <ChevronDown size={18} />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        className="overflow-hidden"
                    >
                        {items.map((it) => (
                            <li key={it.href} className="border-t border-white/5">
                                <Link
                                    href={it.href}
                                    className="block px-6 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition"
                                    onClick={onNavigate}
                                >
                                    {it.label}
                                </Link>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </li>
    );
}
