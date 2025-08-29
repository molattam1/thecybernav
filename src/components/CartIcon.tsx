// /components/CartIcon.tsx (client)
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartCount } from "@/hooks/useCartCount";

export default function CartIcon() {
    const count = useCartCount();
    return (
        <Link href="/cart" className="relative inline-flex items-center">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full text-[10px] px-1.5 py-0.5 bg-white text-black">
          {count}
        </span>
            )}
        </Link>
    );
}
