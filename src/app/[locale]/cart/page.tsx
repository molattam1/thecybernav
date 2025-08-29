// /app/[locale]/cart/page.tsx
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import { readCart } from "@/lib/cart/cookie";
import { removeFromCart, setQty, clearCart } from "@/lib/cart/actions";
import { ArrowLeft, Truck, Shield, CheckCircle2 } from "lucide-react";

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
    // normalize image URLs
    return docs.map((p) => ({
        ...p,
        image: { url: resolveImageUrl(CMS_URL, p.image?.url) },
    }));
}

/* ---------- UI Bits ---------- */
function Badge({
                   icon,
                   children,
               }: {
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
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

/* ---------- Page ---------- */
export default async function CartPage({
                                           params,
                                       }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const isRTL = locale === "ar";

    const cart = await readCart(); // server cookie util (awaited)
    const ids = cart.items.map((i) => i.id);
    const products = await fetchProducts(ids, locale);

    const items: CartItem[] = cart.items
        .map((i) => ({
            ...i,
            product: products.find((p) => p.id === i.id),
        }))
        .filter((i) => i.product) as CartItem[];

    const subtotal = items.reduce((sum, i) => sum + (i.product!.price * i.qty), 0);

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
                        <Link
                            href={`/${locale}/products`}
                            className="hover:text-white transition"
                        >
                            Products
                        </Link>
                    </li>
                    <li className="text-white/30">/</li>
                    <li className="text-white/80">Cart</li>
                </ul>
            </nav>

            <div className="mb-6 inline-flex items-center gap-2 text-xs text-white/70">
                <Badge icon={<Truck className="h-4 w-4" />}>Fast dispatch</Badge>
                <Badge icon={<Shield className="h-4 w-4" />}>Secure checkout</Badge>
                <Badge icon={<CheckCircle2 className="h-4 w-4" />}>Quality guaranteed</Badge>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                {/* Items */}
                <section className="lg:col-span-8">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-[#B8BEE7] via-white to-[#8EA0FF] bg-clip-text text-transparent">
                  Your Cart
                </span>
                            </h1>

                            {items.length > 0 && (
                                <form
                                    action={async () => {
                                        "use server";
                                        await clearCart(`/${locale}/cart`);
                                    }}
                                >
                                    <button
                                        className="rounded-xl border border-white/15 bg-white/0 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
                                        type="submit"
                                    >
                                        Clear cart
                                    </button>
                                </form>
                            )}
                        </div>

                        <Divider />

                        {items.length === 0 ? (
                            <div className="grid place-items-center py-16">
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
                                    <p className="text-white/80">Your cart is empty.</p>
                                    <div className="mt-6">
                                        <Link
                                            href={`/${locale}/products`}
                                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Continue shopping
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {items.map(({ id, qty, product }) => {
                                    const img = product?.image?.url;
                                    const price = product!.price;
                                    const line = price * qty;

                                    return (
                                        <li
                                            key={id}
                                            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                <div className="relative h-24 w-full sm:w-28 overflow-hidden rounded-xl border border-white/10 bg-[#0E1116]">
                                                    {img ? (
                                                        <Image
                                                            src={img}
                                                            alt={product!.name}
                                                            fill
                                                            sizes="112px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="grid h-full w-full place-items-center text-[10px] font-mono text-white/50">
                                                            [ no image ]
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="truncate">
                                                            <h3 className="truncate text-base font-medium text-white/90">
                                                                {product!.name}
                                                            </h3>
                                                            <p className="mt-1 text-sm text-white/60">
                                                                {fmtEGP(price, locale)} each
                                                            </p>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-sm text-white/60">Line</p>
                                                            <p className="text-base font-semibold">
                                                                {fmtEGP(line, locale)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                                        <form
                                                            action={async (fd) => {
                                                                "use server";
                                                                const nextQty = Math.max(
                                                                    0,
                                                                    Number(fd.get("qty") ?? qty) || qty
                                                                );
                                                                await setQty(id, nextQty, `/${locale}/cart`);
                                                            }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <input
                                                                name="qty"
                                                                type="number"
                                                                min={0}
                                                                defaultValue={qty}
                                                                className="w-24 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-white/30"
                                                                aria-label="Quantity"
                                                            />
                                                            <button
                                                                type="submit"
                                                                className="rounded-xl border border-white/15 bg-white/0 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
                                                            >
                                                                Update
                                                            </button>
                                                        </form>

                                                        <form
                                                            action={async () => {
                                                                "use server";
                                                                await removeFromCart(id, `/${locale}/cart`);
                                                            }}
                                                        >
                                                            <button
                                                                className="rounded-xl border border-white/15 bg-white/0 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
                                                                type="submit"
                                                            >
                                                                Remove
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </section>

                {/* Summary */}
                <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-20 space-y-4">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                            <h2 className="text-lg font-semibold text-white/90">Order Summary</h2>
                            <Divider />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/70">Subtotal</span>
                                <span className="font-medium">{fmtEGP(subtotal, locale)}</span>
                            </div>
                            <div className="mt-2 text-xs text-white/50">
                                Taxes and shipping calculated at checkout.
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-3">
                                <Link
                                    href={`/${locale}/checkout`}
                                    className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-gray-200"
                                >
                                    Proceed to Checkout
                                </Link>

                                <Link
                                    href={`/${locale}/products`}
                                    className="rounded-xl border border-white/15 bg-white/0 px-5 py-3 text-center text-sm text-white/85 transition hover:bg-white/10"
                                >
                                    Continue shopping
                                </Link>
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
