import { apiClient } from './api-client';
import type { ApiProduct, Product, ProductVariant } from '../types/store';

type ProductListResponse = {
  products: ApiProduct[];
};

type ProductResponse = {
  product: ApiProduct;
};

const normalizePrice = (amount?: number) => (amount ?? 0) / 100;

function mapVariant(variant?: ApiProduct['variants'][number]): ProductVariant | null {
  if (!variant) return null;
  const price = normalizePrice(variant.prices?.[0]?.amount);
  return {
    id: variant.id,
    name: variant.title,
    price,
    sku: variant.sku ?? undefined
  };
}

function mapProduct(product: ApiProduct): Product {
  const firstVariant = mapVariant(product.variants[0]);
  const tags = product.tags?.map((tag) => tag.value) ?? [];
  return {
    id: product.id,
    slug: product.handle || product.id,
    name: product.title,
    description: product.description ?? product.subtitle ?? undefined,
    price: firstVariant?.price ?? 0,
    image: product.thumbnail ?? product.images?.[0],
    category: product.categories?.[0]?.name,
    tags,
    variants: product.variants.map((variant) => mapVariant(variant)).filter(Boolean) as ProductVariant[]
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await apiClient.get<ProductListResponse>('/store/products');
  return response.products.map(mapProduct);
}

export async function fetchProduct(slug: string): Promise<Product | undefined> {
  try {
    const byId = await apiClient.get<ProductResponse>(`/store/products/${slug}`);
    return mapProduct(byId.product);
  } catch (error) {
    console.warn('Product lookup by id failed, trying handle filter', error);
  }

  const query = new URLSearchParams({ handle: slug });
  const response = await apiClient.get<ProductListResponse>(`/store/products?${query.toString()}`);
  const [product] = response.products;
  return product ? mapProduct(product) : undefined;
}
