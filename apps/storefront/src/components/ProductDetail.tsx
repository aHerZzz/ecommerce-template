import React, { useMemo, useState } from 'react';
import type { Product, ProductVariant } from '../types/store';
import { useCart } from './CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { t } from '../i18n/config';
import { formatPrice, storeSettings } from '../config/store';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const locale = t;

type Props = {
  product: Product;
};

export function ProductDetail({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants[0]);
  const { addItem, loading: cartLoading } = useCart();
  const { items: wishlist, toggleItem } = useWishlist();
  const inWishlist = useMemo(() => wishlist.some((item) => item.id === product.id), [wishlist, product.id]);

  const price = selectedVariant?.price ?? product.price;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {product.image && (
        <img src={product.image} alt={product.name} className="h-80 w-full rounded-xl object-cover shadow" />
      )}
      <Card as="article" ariaLabel={`Detalle de ${product.name}`} className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            {product.category && <p className="text-sm text-slate-500 dark:text-slate-300">{product.category}</p>}
            <h1 className="text-2xl font-semibold text-primary dark:text-text-dark">{product.name}</h1>
          </div>
          <Button
            variant={inWishlist ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={inWishlist}
            aria-label={locale('addToWishlist')}
            onClick={() => toggleItem({ id: product.id, name: product.name, image: product.image ?? '' })}
          >
            ♥ {locale('addToWishlist')}
          </Button>
        </div>
        {product.description && <p className="leading-relaxed text-slate-700 dark:text-slate-200">{product.description}</p>}
        <div className="flex flex-wrap gap-2" aria-label="Etiquetas del producto">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-gray-800 dark:text-slate-200"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-primary dark:text-text-dark">{locale('variants')}</span>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <Button
                key={variant.id}
                size="sm"
                variant={selectedVariant?.id === variant.id ? 'primary' : 'secondary'}
                aria-pressed={selectedVariant?.id === variant.id}
                onClick={() => setSelectedVariant(variant)}
              >
                {variant.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-3xl font-bold">{formatPrice(price)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-300">IVA {storeSettings.tax.ivaPercent}% incluido</p>
            {selectedVariant && <p className="text-xs text-slate-500 dark:text-slate-300">SKU: {selectedVariant.sku}</p>}
          </div>
          <Button
            size="lg"
            onClick={() =>
              selectedVariant &&
              addItem(selectedVariant.id, 1).catch(() => {
                /* surfaced via context */
              })
            }
            disabled={!selectedVariant || cartLoading}
            aria-label={`Añadir ${product.name} al carrito`}
          >
            {locale('addToCart')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
