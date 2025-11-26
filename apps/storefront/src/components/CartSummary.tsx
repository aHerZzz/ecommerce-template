import React, { useMemo } from 'react';
import { useCart } from './CartContext';
import { t } from '../i18n/config';
import { formatPrice, storeSettings } from '../config/store';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const locale = t;

export function CartSummary() {
  const { cart, loading, error, updateQuantity, removeItem, refresh } = useCart();

  const totals = useMemo(() => {
    const subtotal = (cart?.subtotal ?? 0) / 100;
    const vat = (cart?.tax_total ?? 0) / 100;
    const shipping = (cart?.shipping_total ?? 0) / 100;
    const total = (cart?.total ?? 0) / 100;
    return { subtotal, vat, shipping, total };
  }, [cart]);

  const renderItems = () => {
    if (loading && !cart) {
      return <p className="text-slate-500 text-sm">Cargando carrito...</p>;
    }

    if (error) {
      return (
        <div className="flex items-center justify-between gap-3 text-sm text-amber-800">
          <span>{error}</span>
          <Button size="sm" onClick={refresh}>
            Reintentar
          </Button>
        </div>
      );
    }

    if (!cart || cart.items.length === 0) {
      return <p className="text-slate-500 text-sm">No hay productos en el carrito.</p>;
    }

    return cart.items.map((item) => (
      <div key={item.id} className="flex items-center gap-3">
        {item.thumbnail && (
          <img src={item.thumbnail} alt={item.title} className="h-16 w-16 rounded object-cover" />
        )}
        <div className="flex-1">
          <p className="font-semibold text-primary dark:text-text-dark">{item.title}</p>
          {item.variant?.title && <p className="text-xs text-slate-500">{item.variant.title}</p>}
          <div className="flex items-center gap-2 text-sm mt-1">
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              className="w-16 rounded border border-gray-200 px-2 py-1 text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
            />
            <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} aria-label="Quitar producto">
              Quitar
            </Button>
          </div>
        </div>
        <p className="font-semibold">{formatPrice(((item.unit_price ?? 0) * item.quantity) / 100)}</p>
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3" ariaLabel="Resumen de carrito">
        {renderItems()}
      </Card>
      <Card ariaLabel="Totales de compra">
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
          <span>{formatPrice(totals.shipping)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>{locale('total')}</span>
          <span>{formatPrice(totals.total)}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">
          Envíos con {storeSettings.shipping.provider} · {storeSettings.shipping.estimatedDelivery}. Métodos:
          {` ${storeSettings.shipping.methods.join(' · ')}`}
        </p>
      </Card>
    </div>
  );
}
