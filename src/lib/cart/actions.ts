// /lib/cart/actions.ts
"use server";

import { readCart, writeCart, upsertItem } from "./cookie";
import { revalidatePath } from "next/cache";

async function productExists(productId: string) {
    const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL!;
    const res = await fetch(`${CMS_URL}/api/products/${productId}`, { cache: "no-store" });
    return res.ok;
}

export async function addToCart(productId: string, qty = 1, redirectPath?: string) {
    if (!(await productExists(productId))) throw new Error("Product not found");
    const cart = await readCart();                          // 👈 await
    upsertItem(cart, productId, qty);
    await writeCart(cart);                                  // 👈 await
    if (redirectPath) revalidatePath(redirectPath);
}

export async function setQty(productId: string, qty: number, redirectPath?: string) {
    if (qty < 0) qty = 0;
    const cart = await readCart();                          // 👈 await
    const before = cart.items.find(i => i.id === productId)?.qty ?? 0;
    upsertItem(cart, productId, qty - before);
    await writeCart(cart);                                  // 👈 await
    if (redirectPath) revalidatePath(redirectPath);
}

export async function removeFromCart(productId: string, redirectPath?: string) {
    const cart = await readCart();                          // 👈 await
    cart.items = cart.items.filter((i) => i.id !== productId);
    await writeCart(cart);                                  // 👈 await
    if (redirectPath) revalidatePath(redirectPath);
}

export async function clearCart(redirectPath?: string) {
    await writeCart({ items: [], updatedAt: Date.now() });  // 👈 await
    if (redirectPath) revalidatePath(redirectPath);
}
