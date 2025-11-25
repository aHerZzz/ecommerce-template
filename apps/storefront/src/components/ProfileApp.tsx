import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import { CartProvider } from './CartContext';
import { CartSummary } from './CartSummary';
import { AuthPanel } from './AuthPanel';
import { Card } from './ui/Card';

export function ProfileApp() {
  const { user } = useAuth();
  const { items: wishlist } = useWishlist();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <AuthPanel />
      <div className="flex flex-col gap-3">
        <Card title="Favoritos" ariaLabel="Lista de deseos">
          {wishlist.length === 0 && <p className="text-sm text-slate-500">Aún no tienes favoritos.</p>}
          <ul className="flex flex-col gap-2">
            {wishlist.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                {item.image && <img src={item.image} alt={item.name} className="h-10 w-10 rounded object-cover" />}
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={`Carrito ${user ? 'de tu cuenta' : 'invitado'}`} ariaLabel="Carrito guardado">
          <p className="text-sm text-slate-500 dark:text-slate-300 mb-3">
            El carrito se guarda por sesión de invitado y también por usuario autenticado.
          </p>
          <CartProvider userId={user?.id}>
            <CartSummary />
          </CartProvider>
        </Card>
      </div>
    </div>
  );
}
