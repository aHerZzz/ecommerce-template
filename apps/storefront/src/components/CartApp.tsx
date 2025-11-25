import React from 'react';
import { CartProvider } from './CartContext';
import { CartSummary } from './CartSummary';

export function CartApp({ userId }: { userId?: string | null }) {
  return (
    <CartProvider userId={userId}>
      <CartSummary />
    </CartProvider>
  );
}
