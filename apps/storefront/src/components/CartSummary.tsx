import React, { useMemo, useState } from 'react';
import { useCart } from './CartContext';
import { createCheckoutSession } from '../services/stripe';
import { t } from '../i18n/config';
import { formatPrice, storeSettings, vatRateDecimal } from '../config/store';

const locale = t;

export function CartSummary() {
  const { items, updateQuantity, removeItem } = useCart();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const vat = subtotal * vatRateDecimal;
    const shippingBase = storeSettings.shipping.baseCost;
    const hasItems = items.length > 0;
    const isFreeShipping = hasItems && subtotal >= storeSettings.shipping.freeShippingFrom;
    const shipping = hasItems ? (isFreeShipping ? 0 : shippingBase) : 0;
    const total = subtotal + vat + shipping;
    return { subtotal, vat, total, shipping, isFreeShipping };
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
            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between text-sm mb-1">
          <span>{locale('subtotal')}</span>
          <span>{formatPrice(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>
            {locale('vat')} ({storeSettings.tax.ivaPercent}%)
          </span>
          <span>{formatPrice(totals.vat)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>{locale('shipping')}</span>
          <span>
            {totals.isFreeShipping
              ? `${formatPrice(0)} (gratis desde ${formatPrice(storeSettings.shipping.freeShippingFrom)})`
              : `${formatPrice(totals.shipping)} · Gratis desde ${formatPrice(storeSettings.shipping.freeShippingFrom)}`}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>{locale('total')}</span>
          <span>{formatPrice(totals.total)}</span>
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
        <p className="text-xs text-slate-500 mt-2">
          Envíos con {storeSettings.shipping.provider} · {storeSettings.shipping.estimatedDelivery}. Métodos:
          {` ${storeSettings.shipping.methods.join(' · ')}`}
        </p>
      </div>
    </div>
  );
}
