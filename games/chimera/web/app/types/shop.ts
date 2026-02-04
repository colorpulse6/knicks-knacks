// Shop system types

export interface ShopItem {
  itemId: string;
  price: number; // Buy price (sell price is typically 50% of this)
  stock?: number; // Unlimited if not specified
  requiredFlags?: string[]; // Story flags needed to unlock this item
}

export interface Shop {
  id: string;
  name: string;
  keeperId: string; // NPC ID of the shopkeeper
  keeperPortrait?: string; // Portrait image path
  backgroundImage: string; // Shop interior background
  greeting: string; // What the shopkeeper says when you enter
  farewell: string; // What they say when you leave
  inventory: ShopItem[];
  buyMultiplier?: number; // Default 1.0 - how much to multiply base prices
  sellMultiplier?: number; // Default 0.5 - what fraction of buy price you get when selling
}

export interface ShopState {
  currentShop: Shop | null;
  selectedCategory: "buy" | "sell";
  selectedIndex: number;
  quantity: number;
}

export type ShopCategory = "buy" | "sell";
