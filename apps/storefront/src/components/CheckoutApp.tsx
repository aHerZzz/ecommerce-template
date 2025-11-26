import React from 'react';
import { CartProvider } from './CartContext';
import { CheckoutForm } from './CheckoutForm';
import { CartSummary } from './CartSummary';

export function CheckoutApp() {
  return (
    <CartProvider>
      <div className="grid gap-6 lg:grid-cols-2">
        <CheckoutForm />
        <CartSummary />
      </div>
    </CartProvider>
  );
}
