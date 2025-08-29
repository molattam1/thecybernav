"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import {
    Facebook,
    InstagramIcon,
    Linkedin,
    Mail,
    Globe,
} from "lucide-react";

/* ------------ config ------------ */

const SOCIALS = [
    { icon: Facebook, href: "https://facebook.com/thecybernav", label: "Facebook" },
    { icon: InstagramIcon, href: "https://instagram.com/thecybernav", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/thecybernav", label: "LinkedIn" },
];

const SUPPORTED_LOCALES = ["en", "ar", "de", "ru"] as const;

function replaceLocale(pathname: string, newLocale: string) {
    const segs = pathname.split("/");
    if (segs.length < 2 || segs[1] === "") segs[1] = newLocale;
    else segs[1] = newLocale;
    return segs.join("/") || `/${newLocale}`;
}

function withQuery(path: string, query: string | null) {
    return query ? `${path}?${query}` : path;
}

/* ------------ component ------------ */

export default function Footer() {
    const params = useParams();
    const pathname = usePathname() || "/";
    const searchParams = useSearchParams();
    const query = searchParams?.toString() ?? null;

    const locale = (params?.locale as string) || "en";
    const isRTL = useMemo(() => locale === "ar", [locale]);

    const L = (t: Record<string, string>) => t[locale] ?? t.en;

    const COLS = [
        {
            title: L({ en: "Product", ar: "المنتج", de: "Produkt", fr: "Produit", es: "Producto", ru: "Продукт" }),
            links: [
                { label: L({ en: "Overview", ar: "نظرة عامة", de: "Überblick", fr: "Aperçu", es: "Resumen", ru: "Обзор" }), href: `/${locale}` },
                { label: L({ en: "Products", ar: "المنتجات", de: "Produkte", fr: "Produits", es: "Productos", ru: "Продукты" }), href: `/${locale}/products` },
                { label: L({ en: "Support", ar: "الدعم", de: "Support", fr: "Support", es: "Soporte", ru: "Поддержка" }), href: `/${locale}/support` },
            ],
        },
        {
            title: L({ en: "Company", ar: "الشركة", de: "Unternehmen", fr: "Entreprise", es: "Empresa", ru: "Компания" }),
            links: [
                { label: L({ en: "About", ar: "من نحن", de: "Über uns", fr: "À propos", es: "Acerca de", ru: "О нас" }), href: `/${locale}/about` },
                { label: L({ en: "Careers", ar: "الوظائف", de: "Karriere", fr: "Carrières", es: "Empleo", ru: "Карьера" }), href: `/${locale}/careers` },
                { label: L({ en: "Contact", ar: "اتصل بنا", de: "Kontakt", fr: "Contact", es: "Contacto", ru: "Контакты" }), href: `/${locale}/contact` },
            ],
        },
        {
            title: L({ en: "Resources", ar: "الموارد", de: "Ressourcen", fr: "Ressources", es: "Recursos", ru: "Ресурсы" }),
            links: [
                { label: L({ en: "Docs", ar: "الوثائق", de: "Dokumente", fr: "Docs", es: "Docs", ru: "Документация" }), href: `/${locale}/docs` },
                { label: L({ en: "Blog", ar: "المدونة", de: "Blog", fr: "Blog", es: "Blog", ru: "Блог" }), href: `/${locale}/blog` },
                { label: L({ en: "Community", ar: "المجتمع", de: "Community", fr: "Communauté", es: "Comunidad", ru: "Сообщество" }), href: `/${locale}/community` },
            ],
        },
        {
            title: L({ en: "Legal", ar: "قانوني", de: "Rechtliches", fr: "Légal", es: "Legal", ru: "Правовое" }),
            links: [
                { label: L({ en: "Privacy", ar: "الخصوصية", de: "Datenschutz", fr: "Confidentialité", es: "Privacidad", ru: "Конфиденциальность" }), href: `/${locale}/privacy` },
                { label: L({ en: "Terms", ar: "الشروط", de: "AGB", fr: "Conditions", es: "Términos", ru: "Условия" }), href: `/${locale}/terms` },
                { label: L({ en: "Warranty", ar: "الضمان", de: "Garantie", fr: "Garantie", es: "Garantía", ru: "Гарантия" }), href: `/${locale}/warranty` },
            ],
        },
    ];

    return (
        <footer
            dir={isRTL ? "rtl" : "ltr"}
            className="relative mt-20 text-white"
        >
            {/* Ambient glows */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(900px 300px at 10% 120%, rgba(160,160,255,0.12), transparent 60%), radial-gradient(900px 300px at 90% 120%, rgba(0,200,255,0.10), transparent 60%)",
                }}
            />

            <div className="relative mx-auto w-[92%] sm:w-[86%] lg:w-[78%]">
                {/* Top card */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_100px_rgba(120,120,255,0.15)]">
                    {/* Upper: brand + CTA + socials */}
                    <div className="px-6 sm:px-8 lg:px-12 pt-10 pb-6">
                        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                            {/* Brand */}
                            <div>
                                <Link href={`/${locale}`} className="inline-block">
                  <span className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#B8BEE7] via-white to-[#8EA0FF] bg-clip-text text-transparent">
                    thecybernav
                  </span>
                                </Link>
                                <p className="mt-2 text-sm text-white/70">
                                    {L({
                                        en: "Minimalist tools built for modern workflows.",
                                        ar: "أدوات بسيطة مصممة لتدفقات عمل عصرية.",
                                        de: "Minimalistische Tools für moderne Workflows.",
                                        fr: "Des outils minimalistes pour des workflows modernes.",
                                        es: "Herramientas minimalistas para flujos modernos.",
                                        ru: "Минималистичные инструменты для современных процессов.",
                                    })}
                                </p>
                            </div>

                            {/* Compact newsletter / contact */}
                            <div className="w-full md:w-auto">
                                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                                    <Mail size={18} className="text-white/70" />
                                    <a
                                        href="mailto:hello@thecybernav.com"
                                        className="text-sm text-white/90 hover:text-white transition"
                                    >
                                        hello@thecybernav.com
                                    </a>
                                    <span className="mx-2 hidden sm:block text-white/20">•</span>
                                    <Link
                                        href={withQuery(`/${locale}/support`, query)}
                                        className="ml-auto rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-200 transition"
                                    >
                                        {L({ en: "Get Support", ar: "الدعم", de: "Support", fr: "Support", es: "Soporte", ru: "Поддержка" })}
                                    </Link>
                                </div>
                            </div>

                            {/* Socials */}
                            <div className="flex items-center gap-2">
                                {SOCIALS.map(({ icon: Icon, href, label }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        aria-label={label}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                                    >
                                        <Icon className="h-5 w-5 text-white/70 transition group-hover:text-white" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-6 sm:mx-8 lg:mx-12 border-t border-white/10" />

                    {/* Middle: sitemap */}
                    <div className="px-6 sm:px-8 lg:px-12 py-10">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                            {COLS.map((col) => (
                                <div key={col.title}>
                                    <h3 className="text-sm font-semibold text-white/90">{col.title}</h3>
                                    <ul className="mt-4 space-y-2.5">
                                        {col.links.map((l) => (
                                            <li key={l.href}>
                                                <Link
                                                    href={withQuery(l.href, query)}
                                                    className="text-sm text-white/70 hover:text-white transition"
                                                >
                                                    {l.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* Languages */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                                    <Globe size={16} /> {L({ en: "Languages", ar: "اللغات", de: "Sprachen", fr: "Langues", es: "Idiomas", ru: "Языки" })}
                                </h3>
                                <ul className="mt-4 flex flex-wrap gap-2">
                                    {SUPPORTED_LOCALES.map((loc) => (
                                        <li key={loc}>
                                            <Link
                                                href={withQuery(replaceLocale(pathname, loc), query)}
                                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition"
                                            >
                                                {loc.toUpperCase()}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-6 sm:mx-8 lg:mx-12 border-t border-white/10" />

                    {/* Bottom: legal + made in Cairo */}
                    <div className="px-6 sm:px-8 lg:px-12 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs text-white/60">
                            © {new Date().getFullYear()} CyberNav. {L({ en: "All rights reserved.", ar: "جميع الحقوق محفوظة.", de: "Alle Rechte vorbehalten.", fr: "Tous droits réservés.", es: "Todos los derechos reservados.", ru: "Все права защищены." })}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                {L({ en: "Made in Cairo", ar: "صُنع في القاهرة", de: "Hergestellt in Kairo", fr: "Fabriqué au Caire", es: "Hecho en El Cairo", ru: "Сделано в Каире" })}
              </span>
                            <span className="text-white/30">•</span>
                            <span className="text-white/60">
                {L({ en: "USB-C • VIA • Dual Encoders", ar: "USB-C • VIA • مشفّران", de: "USB-C • VIA • Doppel-Encoder", fr: "USB-C • VIA • Double encodeurs", es: "USB-C • VIA • Doble codificadores", ru: "USB-C • VIA • Два энкодера" })}
              </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
