import React, { useMemo, useState } from 'react';
import { useCart } from './CartContext';
import { useWishlist } from '../hooks/useWishlist';
import type { Product } from '../data/products';
import { t } from '../i18n/config';

const locale = t;

type Props = {
  products: Product[];
};

export function ProductGrid({ products }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const { addItem } = useCart();
  const { items: wishlist, toggleItem } = useWishlist();

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);
  const tags = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.tags))),
    [products]
  );

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-col text-sm">
          <label className="font-semibold">{locale('filters')}</label>
          <input
            className="border border-gray-200 rounded px-3 py-2"
            placeholder={locale('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded px-3 py-2"
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
        <select
          className="border border-gray-200 rounded px-3 py-2"
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
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => {
          const [firstVariant] = product.variants;
          const inWishlist = wishlist.some((item) => item.id === product.id);
          return (
            <article key={product.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
              <a href={`/product/${product.slug}`} className="block overflow-hidden rounded-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover transition-transform duration-150 hover:scale-105"
                />
              </a>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <span className="text-sm text-slate-500">{product.category}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">€{product.price.toFixed(2)}</p>
                  {firstVariant && (
                    <p className="text-xs text-slate-500">
                      {locale('variants')}: {firstVariant.name} ({firstVariant.sku})
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: firstVariant?.price ?? product.price,
                        variant: firstVariant?.name,
                        image: product.image
                      })
                    }
                    className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:opacity-90"
                  >
                    {locale('addToCart')}
                  </button>
                  <button
                    aria-label={locale('addToWishlist')}
                    onClick={() =>
                      toggleItem({ id: product.id, name: product.name, image: product.image })
                    }
                    className={`px-3 py-2 border rounded-lg text-sm ${
                      inWishlist ? 'bg-primary text-white' : 'bg-white'
                    }`}
                  >
                    ♥
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
