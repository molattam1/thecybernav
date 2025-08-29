// /app/api/cart/count/route.ts
import { NextResponse } from "next/server";
import { readCart } from "@/lib/cart/cookie";

export async function GET() {
    const cart = await readCart();                          // 👈 await
    const count = cart.items.reduce((n, i) => n + i.qty, 0);
    return NextResponse.json({ count, updatedAt: cart.updatedAt });
}
