import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchProduct, fetchProducts } from '../services/products';
import type { Product } from '../types/store';

type ProductsContextValue = {
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({
  children,
  initialProducts = []
}: {
  children: React.ReactNode;
  initialProducts?: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError((err as Error)?.message || 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      refresh: loadProducts
    }),
    [products, loading, error, loadProducts]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts must be used inside ProductsProvider');
  }
  return ctx;
}

export function useProduct(slug: string, initialProduct?: Product) {
  const [product, setProduct] = useState<Product | undefined>(initialProduct);
  const [loading, setLoading] = useState<boolean>(!initialProduct);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchProduct(slug);
        if (active) setProduct(result);
      } catch (err) {
        if (active) setError((err as Error)?.message || 'No se pudo cargar el producto.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [slug]);

  return { product, loading, error };
}
