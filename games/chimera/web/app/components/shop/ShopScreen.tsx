"use client";

import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import { getItemById } from "../../data/items";
import { getEffectDescription } from "../../types/item";

export default function ShopScreen() {
  const {
    shop,
    inventory,
    exitShop,
    setShopCategory,
    setShopSelectedIndex,
    setShopQuantity,
    buyItem,
    sellItem,
  } = useGameStore();

  const [message, setMessage] = useState<string | null>(null);

  const { currentShop, selectedCategory, selectedIndex, quantity } = shop;

  // Get items to display based on category
  const displayItems = selectedCategory === "buy"
    ? currentShop?.inventory.map((shopItem) => {
        const item = getItemById(shopItem.itemId);
        return item ? { item, price: shopItem.price, stock: shopItem.stock } : null;
      }).filter(Boolean) ?? []
    : inventory.items.filter((slot) => slot.item.type !== "key").map((slot) => ({
        item: slot.item,
        price: Math.floor(slot.item.value * (currentShop?.sellMultiplier ?? 0.5)),
        stock: slot.quantity,
      }));

  // Get max quantity for current selection
  const getMaxQuantity = useCallback(() => {
    if (!currentShop || displayItems.length === 0) return 1;

    const selectedItem = displayItems[selectedIndex];
    if (!selectedItem) return 1;

    if (selectedCategory === "buy") {
      const maxAffordable = Math.floor(inventory.gold / selectedItem.price);
      const maxStock = selectedItem.stock ?? 99;
      return Math.max(1, Math.min(maxAffordable, maxStock));
    } else {
      return selectedItem.stock ?? 1;
    }
  }, [currentShop, displayItems, selectedIndex, selectedCategory, inventory.gold]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentShop) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
          setShopSelectedIndex(Math.max(0, selectedIndex - 1));
          break;
        case "ArrowDown":
        case "s":
          setShopSelectedIndex(Math.min(displayItems.length - 1, selectedIndex + 1));
          break;
        case "ArrowLeft":
        case "a":
          setShopQuantity(Math.max(1, quantity - 1));
          break;
        case "ArrowRight":
        case "d":
          setShopQuantity(Math.min(getMaxQuantity(), quantity + 1));
          break;
        case "Tab":
          e.preventDefault();
          setShopCategory(selectedCategory === "buy" ? "sell" : "buy");
          break;
        case "Enter":
        case " ":
          handleTransaction();
          break;
        case "Escape":
          exitShop();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentShop, selectedIndex, quantity, selectedCategory, displayItems.length, getMaxQuantity, setShopSelectedIndex, setShopQuantity, setShopCategory, exitShop]);

  const handleTransaction = useCallback(() => {
    if (displayItems.length === 0) return;

    const selectedItem = displayItems[selectedIndex];
    if (!selectedItem) return;

    let result;
    if (selectedCategory === "buy") {
      result = buyItem(selectedItem.item.id, quantity);
    } else {
      result = sellItem(selectedItem.item.id, quantity);
    }

    setMessage(result.message);
    setTimeout(() => setMessage(null), 2000);
  }, [displayItems, selectedIndex, selectedCategory, quantity, buyItem, sellItem]);

  if (!currentShop) {
    return null;
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Shop Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage: `url(${currentShop.backgroundImage})`,
          backgroundColor: "#2a1f1a",
        }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Shop Content */}
      <div className="relative z-10 flex flex-col h-full p-8">
        {/* Header */}
        <div className="flex items-center gap-6 mb-6">
          {/* Shopkeeper Portrait */}
          <div
            className="w-24 h-24 rounded-lg border-2 border-yellow-600 bg-gray-800"
            style={{
              backgroundImage: currentShop.keeperPortrait ? `url(${currentShop.keeperPortrait})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Shop Name and Greeting */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-yellow-400">{currentShop.name}</h1>
            <p className="text-gray-300 mt-1">&quot;{currentShop.greeting}&quot;</p>
          </div>

          {/* Player Gold */}
          <div className="bg-black/60 px-6 py-3 rounded-lg border border-yellow-600">
            <span className="text-yellow-400 font-bold text-xl">{inventory.gold} G</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShopCategory("buy")}
            className={`px-6 py-2 rounded-t-lg font-bold transition-colors ${
              selectedCategory === "buy"
                ? "bg-yellow-600 text-black"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setShopCategory("sell")}
            className={`px-6 py-2 rounded-t-lg font-bold transition-colors ${
              selectedCategory === "sell"
                ? "bg-yellow-600 text-black"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Sell
          </button>
          <div className="flex-1" />
          <span className="text-gray-500 text-sm self-end">[Tab] Switch | [Esc] Exit</span>
        </div>

        {/* Items List */}
        <div className="flex-1 bg-black/60 rounded-lg border border-gray-700 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {displayItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                {selectedCategory === "buy" ? "No items available" : "No items to sell"}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-900/80 sticky top-0">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 w-24 text-right">Price</th>
                    <th className="px-4 py-3 w-24 text-right">
                      {selectedCategory === "buy" ? "Stock" : "Owned"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((entry, index) => (
                    <tr
                      key={entry!.item.id}
                      onClick={() => setShopSelectedIndex(index)}
                      className={`cursor-pointer transition-colors ${
                        index === selectedIndex
                          ? "bg-yellow-600/30 text-yellow-100"
                          : "hover:bg-gray-800/50 text-gray-300"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium">{entry!.item.name}</span>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {entry!.item.description}
                          </p>
                          {getEffectDescription(entry!.item) && (
                            <p className="text-xs text-cyan-400 mt-0.5">
                              {getEffectDescription(entry!.item)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-yellow-400">
                        {entry!.price} G
                      </td>
                      <td className="px-4 py-3 text-right">
                        {entry!.stock ?? "---"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Transaction Panel */}
        {displayItems.length > 0 && displayItems[selectedIndex] && (
          <div className="mt-4 bg-black/60 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center gap-6">
              {/* Selected Item Info */}
              <div className="flex-1">
                <h3 className="font-bold text-yellow-400">
                  {displayItems[selectedIndex]!.item.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {displayItems[selectedIndex]!.item.description}
                </p>
                {getEffectDescription(displayItems[selectedIndex]!.item) && (
                  <p className="text-sm text-cyan-400 mt-1 font-medium">
                    {getEffectDescription(displayItems[selectedIndex]!.item)}
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-gray-400">Qty:</span>
                <button
                  onClick={() => setShopQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold"
                >
                  -
                </button>
                <span className="w-12 text-center text-xl font-bold text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setShopQuantity(Math.min(getMaxQuantity(), quantity + 1))}
                  className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold"
                >
                  +
                </button>
              </div>

              {/* Total and Confirm */}
              <div className="text-right">
                <div className="text-sm text-gray-400">Total</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {displayItems[selectedIndex]!.price * quantity} G
                </div>
              </div>

              <button
                onClick={handleTransaction}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors"
              >
                {selectedCategory === "buy" ? "Buy" : "Sell"}
              </button>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 px-8 py-4 rounded-lg border-2 border-yellow-500 text-center">
            <p className="text-yellow-300 font-bold text-lg">{message}</p>
          </div>
        )}

        {/* Exit Button */}
        <button
          onClick={exitShop}
          className="absolute bottom-4 right-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 transition-colors"
        >
          Leave Shop
        </button>
      </div>
    </div>
  );
}
