import { useEffect, useState } from 'react';

const STORAGE_KEY = 'storefront_wishlist';

type WishlistItem = {
  id: string;
  name: string;
  image: string;
};

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggleItem = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  return { items, toggleItem };
}
