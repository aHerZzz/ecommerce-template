import React from 'react';
import { CartProvider } from './CartContext';
import { ProductGrid } from './ProductGrid';
import { ProductsProvider } from '../hooks/useProducts';
import type { Product } from '../types/store';

export function StorefrontApp({ products = [] }: { products?: Product[] }) {
  return (
    <CartProvider>
      <ProductsProvider initialProducts={products}>
        <ProductGrid />
      </ProductsProvider>
    </CartProvider>
  );
}
