export const revalidate = 0

import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Shield, Truck, ArrowLeft } from 'lucide-react'
import { addToCart } from '@/lib/cart/actions'
import type { Metadata } from 'next'

type Media = {
    id: string
    url: string
    filename: string
    mimeType: string
    sizes?: { thumbnail?: { url: string }; card?: { url: string } }
}

type Reassurance = { label: string; iconKey?: 'truck' | 'shield' | 'check-circle-2' }
type DetailItem = { title: string; body: string }

type UIStrings = {
    homeLabel: string
    productsLabel: string
    backToProductsLabel: string
    addToCartLabel: string
    buyNowLabel: string
    productDetailsHeading: string
}

type Product = {
    id: string
    slug: string
    name: string
    price: number
    currency: string
    description?: string
    image?: Media | string
    specChips?: { label: string }[]
    reassurance?: Reassurance[]
    details?: DetailItem[]
    shippingNote?: string
    ui?: UIStrings
}

type ProductWithImageUrl = Product & { imageUrl?: string }

function resolveImageUrl(base: string, maybePath?: string) {
    if (!maybePath) return undefined
    if (/^https?:\/\//i.test(maybePath)) return maybePath
    return `${base}${maybePath.startsWith('/') ? '' : '/'}${maybePath}`
}

function formatPrice(value: number, locale: string, currency: string) {
    try {
        return new Intl.NumberFormat(locale || 'en', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 0,
        }).format(value)
    } catch {
        return `${currency || 'USD'} ${value}`
    }
}

async function getProductBySlug(slug: string, locale: string): Promise<ProductWithImageUrl | null> {
    const CMS_URL = process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL
    if (!CMS_URL) throw new Error('Missing CMS_URL or NEXT_PUBLIC_CMS_URL')

    const url = new URL('/api/products', CMS_URL)
    url.searchParams.set('where[slug][equals]', slug)
    url.searchParams.set('locale', locale || 'en')
    url.searchParams.set('depth', '2')

    const res = await fetch(url.toString(), { cache: 'no-store', headers: { Accept: 'application/json' } })
    if (!res.ok) return null

    const data = await res.json()
    const p: Product | undefined = data?.docs?.[0]
    if (!p) return null

    const raw =
        typeof p.image === 'object' && p.image
            ? p.image.sizes?.card?.url || p.image.url
            : typeof p.image === 'string'
                ? p.image
                : undefined

    const imageUrl = resolveImageUrl(CMS_URL, raw)
    return { ...p, imageUrl }
}

/* ---------- Dynamic Metadata from CMS ---------- */
export async function generateMetadata(
    { params }: { params: Promise<{ locale: string; slug: string }> }
): Promise<Metadata> {
    const { locale, slug } = await params
    const product = await getProductBySlug(slug, locale)

    const siteName = 'thecybernav'
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    const canonicalPath = `/${locale || 'en'}/products/${slug}`
    const canonical = baseUrl ? `${baseUrl}${canonicalPath}` : undefined

    if (!product) {
        return {
            title: `Product not found – ${siteName}`,
            description: 'The product you are looking for does not exist.',
            robots: { index: false, follow: false },
        }
    }

    const title = `${product.name} – ${siteName}`
    const description = product.description?.slice(0, 180) || `Explore ${product.name} from ${siteName}.`

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName,
            type: 'website',
            images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
            locale,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: product.imageUrl ? [product.imageUrl] : undefined,
        },
    }
}

/* ---------- Small UI helpers ---------- */
function IconFromKey({ k, className }: { k?: Reassurance['iconKey']; className?: string }) {
    if (k === 'shield') return <Shield className={className} />
    if (k === 'check-circle-2') return <CheckCircle2 className={className} />
    return <Truck className={className} />
}

function Badge({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85">
      {icon}
            {children}
    </span>
    )
}

function Chip({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
      {children}
    </span>
    )
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20 hover:bg-white/[0.05]">
            <h3 className="text-sm font-semibold text-white/90">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{children}</p>
        </div>
    )
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await params
    const isRTL = locale === 'ar'

    const product = await getProductBySlug(slug, locale)
    if (!product) notFound()

    const priceLabel = formatPrice(product.price, locale, product.currency)

    const uiDefaults: UIStrings = {
        homeLabel: 'Home',
        productsLabel: 'Products',
        backToProductsLabel: 'Back to products',
        addToCartLabel: 'Add to cart',
        buyNowLabel: 'Buy now',
        productDetailsHeading: 'Details',
    }
    const ui = { ...uiDefaults, ...(product.ui || {}) }

    return (
        <main
            dir={isRTL ? 'rtl' : 'ltr'}
            className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-24 text-white"
        >
            {/* Ambient background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(1200px 420px at 50% -10%, rgba(134,140,255,0.16), transparent 60%), radial-gradient(900px 380px at 10% 110%, rgba(0,208,255,0.12), transparent 60%)',
                }}
            />
            <div className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-[1.5px]" />

            {/* Breadcrumbs */}
            <nav className="mb-8 text-xs text-white/60">
                <ul className="flex items-center gap-2">
                    <li>
                        <Link href={`/${locale}`} className="hover:text-white transition">
                            {ui.homeLabel}
                        </Link>
                    </li>
                    <li className="text-white/30">/</li>
                    <li>
                        <Link href={`/${locale}/products`} className="hover:text-white transition">
                            {ui.productsLabel}
                        </Link>
                    </li>
                    <li className="text-white/30">/</li>
                    <li className="text-white/80">{product.name}</li>
                </ul>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                {/* Media */}
                <section className="lg:col-span-7">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_20px_100px_rgba(120,120,255,0.15)]">
                        {/* subtle edge glow */}
                        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
                        <div className="aspect-[4/3] w-full bg-[#0E1116]">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 58vw"
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="grid h-full w-full place-items-center text-xs font-mono text-white/50">
                                    [ no image ]
                                </div>
                            )}
                        </div>
                        <div className="absolute top-4 end-4 rounded-full bg-black/60 border border-white/10 px-3 py-1.5 text-xs backdrop-blur">
                            {priceLabel}
                        </div>
                    </div>

                    {/* Reassurance */}
                    {product.reassurance?.length ? (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {product.reassurance.map((r, i) => (
                                <Badge key={i} icon={<IconFromKey k={r.iconKey} className="h-4 w-4" />}>
                                    {r.label}
                                </Badge>
                            ))}
                        </div>
                    ) : null}
                </section>

                {/* Info / Sticky CTA */}
                <section className="lg:col-span-5">
                    <div className="lg:sticky lg:top-20">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 md:p-8">
                            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-[#B8BEE7] via-white to-[#8EA0FF] bg-clip-text text-transparent">
                  {product.name}
                </span>
                            </h1>

                            <p className="mt-3 text-2xl font-medium text-white/85">{priceLabel}</p>

                            {product.description ? (
                                <div className="mt-5 text-white/80 leading-relaxed">
                                    {product.description}
                                </div>
                            ) : null}

                            {product.specChips?.length ? (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {product.specChips.map((c, i) => (
                                        <Chip key={i}>{c.label}</Chip>
                                    ))}
                                </div>
                            ) : null}

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form
                                    action={async (formData) => {
                                        'use server'
                                        const qty = Number(formData.get('qty') ?? 1) || 1
                                        await addToCart(product.id, qty, `/${locale}/products/${slug}`)
                                    }}
                                    className="flex items-center gap-3"
                                >
                                    <label htmlFor="qty" className="sr-only">
                                        Quantity
                                    </label>
                                    <input
                                        id="qty"
                                        name="qty"
                                        type="number"
                                        min={1}
                                        defaultValue={1}
                                        className="w-24 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-white/30"
                                    />
                                    <Button
                                        type="submit"
                                        className="rounded-xl bg-white px-6 py-6 text-base font-semibold text-black transition hover:bg-gray-200"
                                    >
                                        {ui.addToCartLabel}
                                    </Button>
                                </form>

                                <Button
                                    variant="outline"
                                    className="rounded-xl border-white/25 bg-white/0 px-6 py-6 text-base text-white transition hover:bg-white/10"
                                    asChild
                                >
                                    <Link href={`/${locale}/checkout`}>{ui.buyNowLabel}</Link>
                                </Button>
                            </div>

                            {product.shippingNote ? (
                                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <p className="text-sm text-white/75">{product.shippingNote}</p>
                                </div>
                            ) : null}

                            <div className="mt-8">
                                <Link
                                    className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
                                    href={`/${locale}/products`}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {ui.backToProductsLabel}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Details */}
            {product.details?.length ? (
                <section className="mt-20">
                    <h2 className="text-xl md:text-2xl font-semibold">{ui.productDetailsHeading}</h2>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {product.details.map((d, i) => (
                            <DetailCard key={i} title={d.title}>
                                {d.body}
                            </DetailCard>
                        ))}
                    </div>
                </section>
            ) : null}
        </main>
    )
}
