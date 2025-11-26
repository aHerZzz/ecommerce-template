import React from 'react';
import { CartProvider } from './CartContext';
import { ProductDetail } from './ProductDetail';
import { useProduct } from '../hooks/useProducts';
import type { Product } from '../types/store';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export function ProductDetailApp({ slug, initialProduct }: { slug: string; initialProduct?: Product }) {
  const { product, loading, error } = useProduct(slug, initialProduct);

  return (
    <CartProvider>
      {loading && <Card ariaLabel="Cargando producto">Cargando producto...</Card>}
      {error && !loading && (
        <Card className="bg-amber-50 text-amber-800" ariaLabel="Error de producto">
          <div className="flex items-center justify-between gap-3">
            <p>{error}</p>
            <Button size="sm" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </Card>
      )}
      {!loading && !error && product && <ProductDetail product={product} />}
      {!loading && !error && !product && (
        <Card ariaLabel="Producto no encontrado">
          <p>Producto no encontrado.</p>
        </Card>
      )}
    </CartProvider>
  );
}
