import React from 'react';
import type { Product } from '../data/products';
import { CartProvider } from './CartContext';
import { ProductDetail } from './ProductDetail';

export function ProductDetailApp({ product }: { product: Product }) {
  return (
    <CartProvider>
      <ProductDetail product={product} />
    </CartProvider>
  );
}
