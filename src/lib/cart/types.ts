// /lib/cart/types.ts
export type CartItem = { id: string; qty: number };           // product id, quantity
export type Cart = { items: CartItem[]; updatedAt: number };  // epoch ms
