"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product, DeliveryType } from "@/types/store";
import { PICKUP_STORE_INFO, LOCAL_DELIVERY_ZONES } from "@/data/delivery-zones";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  selectedZoneId: string;
  setSelectedZoneId: (zoneId: string) => void;
  deliveryFee: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeProductModal: Product | null;
  setActiveProductModal: (prod: Product | null) => void;
  freeShippingProgress: {
    missingAmount: number;
    percentage: number;
    threshold: number;
  };
}

// v2: carrinhos antigos guardavam ids de produtos mock, que não existem no banco.
const CART_KEY = "lobus_cart_v2";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("MOTOBOY");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("zone-1");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);

  // Carregar do localStorage se disponível no browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (product: Product, size: string, quantity = 1) => {
    const variant = product.variants.find((v) => v.size === size);
    if (!variant || variant.stockQuantity < 1) return;
    const variantId = variant.id;

    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: Math.min(item.quantity + quantity, variant.stockQuantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          variantId,
          product,
          selectedSize: size,
          quantity,
          unitPrice: product.price,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  const selectedZone =
    LOCAL_DELIVERY_ZONES.find((z) => z.id === selectedZoneId) ||
    LOCAL_DELIVERY_ZONES[0];

  const freeShippingThreshold = selectedZone.freeAbove;
  const deliveryFee =
    deliveryType === "PICKUP"
      ? 0
      : subtotal >= freeShippingThreshold
      ? 0
      : selectedZone.fee;

  const grandTotal = subtotal + deliveryFee;

  const missingAmount = Math.max(0, freeShippingThreshold - subtotal);
  const percentage = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryType,
        setDeliveryType,
        selectedZoneId,
        setSelectedZoneId,
        deliveryFee,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        activeProductModal,
        setActiveProductModal,
        freeShippingProgress: {
          missingAmount,
          percentage,
          threshold: freeShippingThreshold,
        },
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
