import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useCart } from './CartContext';

export function CheckoutForm() {
  const { updateDetails, complete, cart, loading, error } = useCart();
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const rgpdText =
    'Los datos se utilizarán para gestionar el pedido, facturación y envío. Puedes ejercer tus derechos de acceso, rectificación y supresión contactando con soporte.';

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const form = new FormData(event.currentTarget);
    const fullName = (form.get('fullName') as string) || '';
    const [firstName, ...rest] = fullName.split(' ');
    const email = (form.get('email') as string) || '';
    const address = (form.get('address') as string) || '';
    const city = (form.get('city') as string) || '';
    const zip = (form.get('zip') as string) || '';
    const notes = (form.get('notes') as string) || '';

    try {
      await updateDetails({
        email,
        shipping_address: {
          first_name: firstName,
          last_name: rest.join(' '),
          address_1: address,
          city,
          postal_code: zip,
          country_code: 'es'
        },
        billing_address: {
          first_name: firstName,
          last_name: rest.join(' '),
          address_1: address,
          city,
          postal_code: zip,
          country_code: 'es'
        }
      });

      if (notes) {
        console.info('Notas de pedido', notes);
      }

      const order = await complete();
      if (order) {
        setStatus(`Pedido creado (${order.id}). Revisa tu correo para los siguientes pasos.`);
        event.currentTarget.reset();
        setAccepted(false);
      }
    } catch (submitError) {
      setStatus((submitError as Error)?.message || 'No se pudo completar el pedido.');
    }
  };

  return (
    <Card title="Datos de envío" as="section" ariaLabel="Formulario de checkout">
      <form className="grid gap-3 md:grid-cols-2" aria-describedby="checkout-rgpd" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1 text-sm" htmlFor="checkout-name">
          Nombre completo
          <input
            id="checkout-name"
            required
            name="fullName"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="checkout-email">
          Correo electrónico
          <input
            id="checkout-email"
            type="email"
            required
            name="email"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="checkout-address">
          Dirección
          <input
            id="checkout-address"
            required
            name="address"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="checkout-city">
          Ciudad
          <input
            id="checkout-city"
            required
            name="city"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="checkout-zip">
          Código postal
          <input
            id="checkout-zip"
            required
            name="zip"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="checkout-notes">
          Notas de pedido
          <textarea
            id="checkout-notes"
            name="notes"
            className="min-h-[80px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
          />
        </label>
        <div className="md:col-span-2 flex flex-col gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-gray-800 dark:text-slate-200">
          <label className="flex items-start gap-2" htmlFor="checkout-rgpd">
            <input
              id="checkout-rgpd"
              type="checkbox"
              required
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus-visible:outline-none focus-visible:ring"
              aria-describedby="checkout-rgpd-text"
            />
            <span id="checkout-rgpd-text">{rgpdText}</span>
          </label>
          {error && <p className="text-amber-800">{error}</p>}
          {status && <p className="text-green-700">{status}</p>}
          {cart && cart.items.length === 0 && (
            <p className="text-amber-800">Añade productos al carrito antes de finalizar.</p>
          )}
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={!accepted || loading || !cart || cart.items.length === 0} aria-disabled={!accepted || loading} className="w-full">
            {loading ? 'Procesando...' : 'Confirmar datos y pagar'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
