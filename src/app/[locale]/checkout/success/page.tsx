import Link from "next/link";
import { CheckCircle2, ArrowLeft, Package, CreditCard } from "lucide-react";

interface SuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ transaction_id?: string; member_id?: string }>;
}

function Badge({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85">
      {icon}
      {children}
    </span>
  );
}

export default async function CheckoutSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { locale } = await params;
  const { transaction_id, member_id } = await searchParams;
  const isRTL = locale === "ar";

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="relative mx-auto max-w-4xl px-6 md:px-10 lg:px-16 py-20 text-white"
    >
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 420px at 50% -10%, rgba(134,240,155,0.16), transparent 60%), radial-gradient(900px 380px at 10% 110%, rgba(0,255,128,0.12), transparent 60%)",
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
          <li>
            <Link href={`/${locale}/checkout`} className="hover:text-white transition">
              Checkout
            </Link>
          </li>
          <li className="text-white/30">/</li>
          <li className="text-white/80">Success</li>
        </ul>
      </nav>

      <div className="mb-6 inline-flex items-center gap-2 text-xs text-white/70">
        <Badge icon={<CheckCircle2 className="h-4 w-4" />}>Payment Successful</Badge>
        <Badge icon={<Package className="h-4 w-4" />}>Order Confirmed</Badge>
      </div>

      {/* Success Content */}
      <div className="text-center">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-green-400 via-white to-green-300 bg-clip-text text-transparent">
              Payment Successful!
            </span>
          </h1>

          <p className="text-lg text-white/80 mb-6">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>

          {transaction_id && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-6">
              <div className="text-sm text-white/70 mb-1">Transaction ID</div>
              <div className="font-mono text-white/90 text-sm">{transaction_id}</div>
              {member_id && (
                <>
                  <div className="text-sm text-white/70 mb-1 mt-3">Member ID</div>
                  <div className="font-mono text-white/90 text-sm">{member_id}</div>
                </>
              )}
            </div>
          )}

          <div className="text-sm text-white/60 mb-8">
            You will receive an email confirmation shortly with your order details and tracking information.
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Continue Shopping
            </Link>
            
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/0 px-6 py-3 text-sm text-white/85 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 text-white/70">
              <Package className="h-4 w-4" />
              <span>Orders ship within 24–72 hours</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <CheckCircle2 className="h-4 w-4" />
              <span>Quality guaranteed</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <CreditCard className="h-4 w-4" />
              <span>Secure payment processed</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
