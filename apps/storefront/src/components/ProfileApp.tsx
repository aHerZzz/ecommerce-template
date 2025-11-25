import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import { CartProvider } from './CartContext';
import { CartSummary } from './CartSummary';
import { AuthPanel } from './AuthPanel';

export function ProfileApp() {
  const { user } = useAuth();
  const { items: wishlist } = useWishlist();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <AuthPanel />
      <div className="flex flex-col gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-2">Favoritos</h2>
          {wishlist.length === 0 && <p className="text-sm text-slate-500">Aún no tienes favoritos.</p>}
          <ul className="flex flex-col gap-2">
            {wishlist.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded" />}
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-2">Carrito {user ? 'de tu cuenta' : 'invitado'}</h2>
          <p className="text-sm text-slate-500 mb-3">
            El carrito se guarda por sesión de invitado y también por usuario autenticado.
          </p>
          <CartProvider userId={user?.id}>
            <CartSummary />
          </CartProvider>
        </div>
      </div>
    </div>
  );
}
