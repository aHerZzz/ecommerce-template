import React from 'react';
import type { Product } from '../data/products';
import { CartProvider } from './CartContext';
import { ProductGrid } from './ProductGrid';

export function StorefrontApp({ products }: { products: Product[] }) {
  return (
    <CartProvider>
      <ProductGrid products={products} />
    </CartProvider>
  );
}
