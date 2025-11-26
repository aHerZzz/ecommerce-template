import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/api-client';
import type { ApiCart, ApiOrder } from '../types/store';

type CartContextValue = {
  cart: ApiCart | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  clear: () => void;
  updateDetails: (payload: CartDetailsInput) => Promise<void>;
  complete: () => Promise<ApiOrder | null>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'storefront_cart_id';

type CartDetailsInput = {
  email: string;
  shipping_address: {
    first_name?: string;
    last_name?: string;
    address_1: string;
    city: string;
    postal_code: string;
    country_code: string;
  };
  billing_address?: CartDetailsInput['shipping_address'];
};

type CartResponse = {
  cart: ApiCart;
};

type CompleteResponse = {
  type: string;
  data?: ApiOrder;
  order?: ApiOrder;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartId, setCartId] = useState<string | null>(null);
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistCartId = (id: string | null) => {
    setCartId(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleError = (err: unknown, fallback: string) => {
    setError((err as Error)?.message || fallback);
  };

  const fetchCart = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<CartResponse>(`/store/carts/${id}`);
        setCart(response.cart);
        persistCartId(response.cart.id);
      } catch (err) {
        handleError(err, 'No se pudo recuperar el carrito.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<CartResponse>('/store/carts', {});
      setCart(response.cart);
      persistCartId(response.cart.id);
      return response.cart.id;
    } catch (err) {
      handleError(err, 'No se pudo crear el carrito.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureCart = useCallback(async () => {
    if (cartId) return cartId;
    return createCart();
  }, [cartId, createCart]);

  const refresh = useCallback(async () => {
    if (!cartId) {
      await createCart();
      return;
    }
    await fetchCart(cartId);
  }, [cartId, createCart, fetchCart]);

  const addItem: CartContextValue['addItem'] = useCallback(
    async (variantId, quantity = 1) => {
      setLoading(true);
      setError(null);
      try {
        const id = await ensureCart();
        if (!id) return;
        const response = await apiClient.post<CartResponse>(`/store/carts/${id}/line-items`, {
          variant_id: variantId,
          quantity
        });
        setCart(response.cart);
        persistCartId(response.cart.id);
      } catch (err) {
        handleError(err, 'No se pudo añadir el producto al carrito.');
      } finally {
        setLoading(false);
      }
    },
    [ensureCart]
  );

  const updateQuantity: CartContextValue['updateQuantity'] = useCallback(
    async (lineItemId, quantity) => {
      setLoading(true);
      setError(null);
      try {
        const id = await ensureCart();
        if (!id) return;
        const response = await apiClient.post<CartResponse>(`/store/carts/${id}/line-items/${lineItemId}`, {
          quantity
        });
        setCart(response.cart);
      } catch (err) {
        handleError(err, 'No se pudo actualizar la cantidad.');
      } finally {
        setLoading(false);
      }
    },
    [ensureCart]
  );

  const removeItem: CartContextValue['removeItem'] = useCallback(
    async (lineItemId) => {
      setLoading(true);
      setError(null);
      try {
        const id = await ensureCart();
        if (!id) return;
        const response = await apiClient.delete<CartResponse>(`/store/carts/${id}/line-items/${lineItemId}`);
        setCart(response.cart);
      } catch (err) {
        handleError(err, 'No se pudo eliminar el producto.');
      } finally {
        setLoading(false);
      }
    },
    [ensureCart]
  );

  const updateDetails = useCallback(
    async (payload: CartDetailsInput) => {
      setLoading(true);
      setError(null);
      try {
        const id = await ensureCart();
        if (!id) return;
        const response = await apiClient.post<CartResponse>(`/store/carts/${id}`, payload);
        setCart(response.cart);
      } catch (err) {
        handleError(err, 'No se pudo actualizar el carrito.');
      } finally {
        setLoading(false);
      }
    },
    [ensureCart]
  );

  const complete = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const id = await ensureCart();
      if (!id) return null;
      const response = await apiClient.post<CompleteResponse>(`/store/carts/${id}/complete`);
      const order = response.data || response.order || null;
      if (order) {
        setCart(null);
        persistCartId(null);
      }
      return order;
    } catch (err) {
      handleError(err, 'No se pudo completar el pedido.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [ensureCart]);

  const clear = useCallback(() => {
    setCart(null);
    persistCartId(null);
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      fetchCart(storedId);
    } else {
      createCart();
    }
  }, [fetchCart, createCart]);

  const value = useMemo(
    () => ({ cart, loading, error, addItem, updateQuantity, removeItem, refresh, clear, updateDetails, complete }),
    [cart, loading, error, addItem, updateQuantity, removeItem, refresh, clear, updateDetails, complete]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
