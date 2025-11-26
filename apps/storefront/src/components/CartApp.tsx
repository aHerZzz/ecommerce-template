import React from 'react';
import { CartProvider } from './CartContext';
import { CartSummary } from './CartSummary';

export function CartApp() {
  return (
    <CartProvider>
      <CartSummary />
    </CartProvider>
  );
}
