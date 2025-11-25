import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  variant?: string;
  quantity: number;
  image?: string;
};

type CartState = {
  items: CartItem[];
};

type CartContextValue = CartState & {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  updateQuantity: (id: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const getStorageKey = (userId?: string | null) =>
  userId ? `storefront_cart_${userId}` : 'storefront_cart_guest';

export const CartProvider = ({
  userId,
  children
}: {
  userId?: string | null;
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<CartState>({ items: [] });
  const storageKey = useMemo(() => getStorageKey(userId), [userId]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setState(JSON.parse(stored));
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const addItem: CartContextValue['addItem'] = (item) => {
    setState((prev) => {
      const existing = prev.items.find((i) => i.id === item.id && i.variant === item.variant);
      if (existing) {
        return {
          items: prev.items.map((i) =>
            i.id === item.id && i.variant === item.variant
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i
          )
        };
      }
      return { items: [...prev.items, { ...item, quantity: item.quantity ?? 1 }] };
    });
  };

  const removeItem = (id: string) => {
    setState((prev) => ({ items: prev.items.filter((item) => item.id !== id) }));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setState((prev) => ({
      items: prev.items.map((item) => (item.id === id ? { ...item, quantity } : item))
    }));
  };

  const clear = () => setState({ items: [] });

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
