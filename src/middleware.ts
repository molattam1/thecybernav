import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["en", "ar", "de", "fr", "es", "it"];
const DEFAULT_LOCALE = "en";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore Next.js internals & static files
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("/api/") ||
    pathname.includes("/static")
  ) {
    return;
  }

  // If root, redirect to default locale (or detect)
  if (pathname === "/") {
    const acceptLang = req.headers.get("accept-language")?.toLowerCase();
    let detectedLocale = DEFAULT_LOCALE;

    if (acceptLang) {
      detectedLocale =
        SUPPORTED_LOCALES.find((loc) => acceptLang.startsWith(loc)) ||
        DEFAULT_LOCALE;
    }

    return NextResponse.redirect(new URL(`/${detectedLocale}`, req.url));
  }

  // Already localized → continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
