import React, { useMemo, useState } from 'react';
import { useCart } from './CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { useProducts } from '../hooks/useProducts';
import { t } from '../i18n/config';
import { formatPrice, storeSettings } from '../config/store';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const locale = t;

export function ProductGrid() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const { addItem, loading: cartLoading } = useCart();
  const { items: wishlist, toggleItem } = useWishlist();
  const { products, loading, error, refresh } = useProducts();

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))), [products]);
  const tags = useMemo(() => Array.from(new Set(products.flatMap((p) => p.tags))), [products]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !category || p.category === category;
        const matchesTag = !tag || p.tags.includes(tag);
        return matchesSearch && matchesCategory && matchesTag;
      }),
    [products, search, category, tag]
  );

  const renderContent = () => {
    if (loading) {
      return <p className="text-sm text-slate-500">Cargando catálogo...</p>;
    }

    if (error) {
      return (
        <Card className="bg-amber-50 text-amber-800" ariaLabel="Error cargando productos">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">No se pudieron cargar los productos.</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button size="sm" onClick={refresh}>
              Reintentar
            </Button>
          </div>
        </Card>
      );
    }

    if (filtered.length === 0) {
      return <p className="text-sm text-slate-500">No hay productos que coincidan con los filtros.</p>;
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => {
          const [firstVariant] = product.variants;
          const inWishlist = wishlist.some((item) => item.id === product.id);
          return (
            <Card key={product.id} as="article" ariaLabel={`Producto ${product.name}`} className="flex flex-col gap-3">
              <a href={`/product/${product.slug}`} className="block overflow-hidden rounded-lg">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-48 w-full object-cover transition-transform duration-150 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-slate-500">Sin imagen</div>
                )}
              </a>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-primary dark:text-text-dark">{product.name}</h3>
                  {product.category && <span className="text-sm text-slate-500 dark:text-slate-300">{product.category}</span>}
                </div>
                {product.description && (
                  <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-200">{product.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tagValue) => (
                    <span
                      key={tagValue}
                      className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-gray-800 dark:text-slate-200"
                    >
                      #{tagValue}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{formatPrice(firstVariant?.price ?? product.price)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    IVA {storeSettings.tax.ivaPercent}% incluido
                  </p>
                  {firstVariant && (
                    <p className="text-xs text-slate-500 dark:text-slate-300">{locale('variants')}: {firstVariant.name}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      firstVariant &&
                      addItem(firstVariant.id, 1).catch(() => {
                        /* error surfaced in context */
                      })
                    }
                    disabled={!firstVariant || cartLoading}
                    aria-label={`Añadir ${product.name} al carrito`}
                  >
                    {locale('addToCart')}
                  </Button>
                  <Button
                    size="sm"
                    variant={inWishlist ? 'primary' : 'secondary'}
                    aria-label={locale('addToWishlist')}
                    aria-pressed={inWishlist}
                    onClick={() => toggleItem({ id: product.id, name: product.name, image: product.image ?? '' })}
                  >
                    ♥
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3" role="search">
        <div className="flex flex-col text-sm">
          <label className="font-semibold" htmlFor="product-search">
            {locale('filters')}
          </label>
          <input
            id="product-search"
            className="rounded px-3 py-2 border border-gray-200 bg-white text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
            placeholder={locale('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label className="text-sm" htmlFor="product-category">
          <span className="sr-only">Categoría</span>
          <select
            id="product-category"
            className="rounded px-3 py-2 border border-gray-200 bg-white text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm" htmlFor="product-tag">
          <span className="sr-only">Etiqueta</span>
          <select
            id="product-tag"
            className="rounded px-3 py-2 border border-gray-200 bg-white text-slate-800 focus-visible:outline-none focus-visible:ring dark:border-gray-700 dark:bg-surface-dark dark:text-text-dark"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="">Todas las etiquetas</option>
            {tags.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {renderContent()}
    </div>
  );
}
