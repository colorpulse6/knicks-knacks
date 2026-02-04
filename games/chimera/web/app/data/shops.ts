// Shop definitions for Chimera

import type { Shop } from "../types/shop";

// Aldric's Provisions in Havenwood
export const ALDRIC_SHOP: Shop = {
  id: "aldric_provisions",
  name: "Aldric's Provisions",
  keeperId: "merchant_aldric",
  keeperPortrait: "/assets/merchant_portrait_male.png",
  backgroundImage: "/assets/shop_interior.png",
  greeting: "Hail, wanderer! Aldric has what you need. Browse freely.",
  farewell: "May fortune favor your journey. Return when you've need of supplies.",
  inventory: [
    // Basic healing items
    { itemId: "sanguine_draught", price: 50 },
    { itemId: "stale_bread", price: 15 },
    { itemId: "dried_meat", price: 40 },
    { itemId: "herb_bundle", price: 20 },

    // Status cure
    { itemId: "mithridate", price: 30 },

    // MP restoration
    { itemId: "aqua_vitae", price: 100 },

    // Premium items (limited stock)
    { itemId: "theriac_electuary", price: 200, stock: 3 },
    { itemId: "hartshorn_salts", price: 500, stock: 1 },
  ],
  buyMultiplier: 1.0,
  sellMultiplier: 0.5,
};

// Shop registry
export const SHOPS: Record<string, Shop> = {
  aldric_provisions: ALDRIC_SHOP,
};

export function getShopById(id: string): Shop | undefined {
  return SHOPS[id];
}
