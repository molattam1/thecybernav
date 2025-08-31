import { readCart } from "@/lib/cart/cookie";
import { ArrowLeft, CreditCard, Shield, CheckCircle2, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CheckoutForm from "./CheckoutForm";

/* ---------- Types ---------- */
type Media = { url?: string };
type CMSProduct = { id: string; name: string; price: number; image?: Media };
type CartItem = { id: string; qty: number; product?: CMSProduct & { imageUrl?: string } };

/* ---------- Utils ---------- */
function resolveImageUrl(base: string | undefined, maybePath?: string) {
    if (!maybePath) return undefined;
    if (/^https?:\/\//i.test(maybePath)) return maybePath;
    if (!base) return maybePath;
    return `${base}${maybePath.startsWith("/") ? "" : "/"}${maybePath}`;
}

function fmtEGP(value: number, locale: string) {
    try {
        return new Intl.NumberFormat(locale || "en", {
            style: "currency",
            currency: "EGP",
            maximumFractionDigits: 0,
        }).format(value);
    } catch {
        return `${value} EGP`;
    }
}

/* ---------- Data ---------- */
async function fetchProducts(ids: string[], locale: string) {
    if (ids.length === 0) return [] as CMSProduct[];
    const CMS_URL = process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL!;
    const query = ids.map((id) => `where[id][in]=${id}`).join("&");
    const res = await fetch(`${CMS_URL}/api/products?${query}&locale=${locale}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
    });
    const data = await res.json();
    const docs = (data?.docs ?? []) as CMSProduct[];
    return docs.map((p) => ({
        ...p,
        image: { url: resolveImageUrl(CMS_URL, p.image?.url) },
    }));
}

function Badge({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85">
            {icon}
            {children}
        </span>
    );
}

function Divider() {
    return <div className="my-6 h-px w-full bg-white/10" />;
}

export default async function CheckOutPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const isRTL = locale === "ar";

    const cart = await readCart();
    const ids = cart.items.map((i) => i.id);
    const products = await fetchProducts(ids, locale);

    const items: CartItem[] = cart.items
        .map((i) => ({
            ...i,
            product: products.find((p) => p.id === i.id),
        }))
        .filter((i) => i.product) as CartItem[];

    const subtotal = items.reduce((sum, i) => sum + (i.product!.price * i.qty), 0);

    // Redirect to cart if empty
    if (items.length === 0) {
        return (
            <main
                dir={isRTL ? "rtl" : "ltr"}
                className="relative mx-auto max-w-4xl px-6 md:px-10 lg:px-16 py-20 text-white"
            >
                <div className="text-center">
                    <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
                    <Link
                        href={`/${locale}/products`}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Continue shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main
            dir={isRTL ? "rtl" : "ltr"}
            className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-20 text-white"
        >
            {/* Ambient background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(1200px 420px at 50% -10%, rgba(134,140,255,0.16), transparent 60%), radial-gradient(900px 380px at 10% 110%, rgba(0,208,255,0.12), transparent 60%)",
                }}
            />
            <div className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-[1.5px]" />

            {/* Header / Breadcrumb */}
            <nav className="mb-6 text-xs text-white/60">
                <ul className="flex items-center gap-2">
                    <li>
                        <Link href={`/${locale}`} className="hover:text-white transition">
                            Home
                        </Link>
                    </li>
                    <li className="text-white/30">/</li>
                    <li>
                        <Link href={`/${locale}/cart`} className="hover:text-white transition">
                            Cart
                        </Link>
                    </li>
                    <li className="text-white/30">/</li>
                    <li className="text-white/80">Checkout</li>
                </ul>
            </nav>

            <div className="mb-6 inline-flex items-center gap-2 text-xs text-white/70">
                <Badge icon={<Shield className="h-4 w-4" />}>Secure Payment</Badge>
                <Badge icon={<CreditCard className="h-4 w-4" />}>XPay Gateway</Badge>
                <Badge icon={<CheckCircle2 className="h-4 w-4" />}>SSL Protected</Badge>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                {/* Checkout Form */}
                <section className="lg:col-span-8">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
                            <span className="bg-gradient-to-r from-[#B8BEE7] via-white to-[#8EA0FF] bg-clip-text text-transparent">
                                Checkout
                            </span>
                        </h1>
                        
                        <CheckoutForm locale={locale} subtotal={subtotal} />
                    </div>
                </section>

                {/* Order Summary */}
                <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-20 space-y-4">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                            <h2 className="text-lg font-semibold text-white/90 mb-4">Order Summary</h2>
                            
                            {/* Order Items */}
                            <div className="space-y-3 mb-4">
                                {items.map(({ id, qty, product }) => {
                                    const img = product?.image?.url;
                                    const price = product!.price;
                                    const line = price * qty;

                                    return (
                                        <div key={id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                                            <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-[#0E1116]">
                                                {img ? (
                                                    <Image
                                                        src={img}
                                                        alt={product!.name}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="grid h-full w-full place-items-center text-[8px] font-mono text-white/50">
                                                        [ no image ]
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-white/90 truncate">
                                                    {product!.name}
                                                </h3>
                                                <p className="text-xs text-white/60">
                                                    {qty} × {fmtEGP(price, locale)}
                                                </p>
                                            </div>
                                            <div className="text-sm font-semibold text-white/90">
                                                {fmtEGP(line, locale)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Divider />
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/70">Subtotal</span>
                                    <span className="font-medium">{fmtEGP(subtotal, locale)}</span>
                                </div>
                                <div className="text-xs text-white/50">
                                    Payment processing fees will be calculated during checkout.
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex items-center gap-3 text-sm text-white/70">
                                <Truck className="h-4 w-4" />
                                <span>Orders typically ship within 24–72 hours.</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
