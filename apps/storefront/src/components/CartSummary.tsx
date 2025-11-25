import React, { useMemo, useState } from 'react';
import { useCart } from './CartContext';
import { createCheckoutSession } from '../services/stripe';
import { t } from '../i18n/config';

const locale = t;

const SHIPPING = 4.99;
const VAT_RATE = 0.21;

export function CartSummary() {
  const { items, updateQuantity, removeItem } = useCart();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat + (items.length > 0 ? SHIPPING : 0);
    return { subtotal, vat, total };
  }, [items]);

  const handleCheckout = async () => {
    const session = await createCheckoutSession(
      items.map((item) => ({ priceId: item.id, quantity: item.quantity }))
    );
    setCheckoutUrl(session.url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 bg-white rounded-xl p-4 shadow-sm">
        {items.length === 0 && <p className="text-slate-500 text-sm">No hay productos en el carrito.</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded" />}
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              {item.variant && <p className="text-xs text-slate-500">{item.variant}</p>}
              <div className="flex items-center gap-2 text-sm mt-1">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                  className="w-16 border rounded px-2 py-1"
                />
                <button onClick={() => removeItem(item.id)} className="text-red-500 text-xs">
                  Quitar
                </button>
              </div>
            </div>
            <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between text-sm mb-1">
          <span>{locale('subtotal')}</span>
          <span>€{totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>{locale('vat')} (21%)</span>
          <span>€{totals.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>{locale('shipping')}</span>
          <span>€{items.length > 0 ? SHIPPING.toFixed(2) : '0.00'}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>{locale('total')}</span>
          <span>€{totals.total.toFixed(2)}</span>
        </div>
        <button
          className="mt-4 w-full bg-primary text-white py-3 rounded-lg disabled:opacity-50"
          onClick={handleCheckout}
          disabled={items.length === 0}
        >
          {locale('checkout')}
        </button>
        {checkoutUrl && (
          <p className="text-xs text-slate-500 mt-2 break-all">Sesión: {checkoutUrl}</p>
        )}
      </div>
    </div>
  );
}
