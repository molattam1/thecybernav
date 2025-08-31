// /lib/cart/test-seed.ts
import { writeCart, upsertItem } from "./cookie";
import type { Cart } from "./types";

const TEST_PRODUCT_ID = "test-product-1"; // You can change this to any valid product ID
const TEST_QUANTITY = 1;

/**
 * Seeds the cart with a test product for development/testing purposes
 * Only runs when ENABLE_TEST_CART environment variable is set to 'true'
 */
export async function seedTestCart(currentCart: Cart): Promise<Cart> {
  // Only seed in test mode
  if (process.env.ENABLE_TEST_CART !== 'true') {
    return currentCart;
  }

  // If cart is empty, add test product
  if (currentCart.items.length === 0) {
    const testCart: Cart = { ...currentCart };
    upsertItem(testCart, TEST_PRODUCT_ID, TEST_QUANTITY);
    await writeCart(testCart);
    console.log(`[TEST MODE] Seeded cart with test product: ${TEST_PRODUCT_ID}`);
    return testCart;
  }

  return currentCart;
}

/**
 * Force adds a test product to the cart regardless of current state
 * Useful for ensuring there's always something to test checkout with
 */
export async function forceAddTestProduct(): Promise<void> {
  if (process.env.ENABLE_TEST_CART !== 'true') {
    console.warn('Test cart seeding is disabled. Set ENABLE_TEST_CART=true to enable.');
    return;
  }

  const cart: Cart = { items: [], updatedAt: Date.now() };
  upsertItem(cart, TEST_PRODUCT_ID, TEST_QUANTITY);
  await writeCart(cart);
  console.log(`[TEST MODE] Force added test product to cart: ${TEST_PRODUCT_ID}`);
}
