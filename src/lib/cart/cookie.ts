// /lib/cart/cookie.ts
import { cookies } from "next/headers";
import type { Cart } from "./types";
import { seedTestCart } from "./test-seed";

const COOKIE_NAME = "cart";
const MAX_AGE_DAYS = 30;

function empty(): Cart {
    return { items: [], updatedAt: Date.now() };
}

export async function readCart(): Promise<Cart> {
    const store = await cookies();                          // 👈 await
    const c = store.get(COOKIE_NAME)?.value;
    if (!c) {
        const emptyCart = empty();
        return await seedTestCart(emptyCart);
    }
    try {
        const parsed = JSON.parse(c) as Cart;
        if (!Array.isArray(parsed.items)) {
            const emptyCart = empty();
            return await seedTestCart(emptyCart);
        }
        return await seedTestCart(parsed);
    } catch {
        const emptyCart = empty();
        return await seedTestCart(emptyCart);
    }
}

export async function writeCart(cart: Cart): Promise<void> {
    const store = await cookies();                          // 👈 await
    store.set({
        name: COOKIE_NAME,
        value: JSON.stringify({ ...cart, updatedAt: Date.now() }),
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * MAX_AGE_DAYS,
    });
}

// small helper that mutates in-place
export function upsertItem(cart: Cart, id: string, delta: number) {
    const existing = cart.items.find((i) => i.id === id);
    if (existing) existing.qty = Math.max(0, existing.qty + delta);
    else if (delta > 0) cart.items.push({ id, qty: delta });
    cart.items = cart.items.filter((i) => i.qty > 0);
}
