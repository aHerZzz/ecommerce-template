import React, { useMemo, useState } from 'react';
import type { Product, ProductVariant } from '../data/products';
import { useCart } from './CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { t } from '../i18n/config';

const locale = t;

type Props = {
  product: Product;
};

export function ProductDetail({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants[0]
  );
  const { addItem } = useCart();
  const { items: wishlist, toggleItem } = useWishlist();
  const inWishlist = useMemo(() => wishlist.some((item) => item.id === product.id), [
    wishlist,
    product.id
  ]);

  const price = selectedVariant?.price ?? product.price;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-80 object-cover rounded-xl shadow"
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{product.category}</p>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
          </div>
          <button
            className={`px-3 py-2 border rounded-lg text-sm ${inWishlist ? 'bg-primary text-white' : ''}`}
            onClick={() => toggleItem({ id: product.id, name: product.name, image: product.image })}
          >
            ♥ {locale('addToWishlist')}
          </button>
        </div>
        <p className="text-slate-700 leading-relaxed">{product.description}</p>
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span key={tag} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-sm">{locale('variants')}</span>
          <div className="flex gap-2 flex-wrap">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  selectedVariant?.id === variant.id ? 'bg-primary text-white' : 'bg-white'
                }`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">€{price.toFixed(2)}</p>
            {selectedVariant && (
              <p className="text-xs text-slate-500">SKU: {selectedVariant.sku}</p>
            )}
          </div>
          <button
            onClick={() =>
              addItem({
                id: `${product.id}-${selectedVariant?.id ?? 'default'}`,
                name: product.name,
                price,
                variant: selectedVariant?.name,
                image: product.image
              })
            }
            className="px-4 py-3 bg-accent text-white rounded-lg text-sm hover:opacity-90"
          >
            {locale('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
