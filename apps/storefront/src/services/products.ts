import { apiClient } from './api-client';
import { products, Product } from '../data/products';

export async function fetchProducts(): Promise<Product[]> {
  try {
    return await apiClient.get<Product[]>('/products');
  } catch (error) {
    console.warn('Falling back to local products', error);
    return products;
  }
}

export async function fetchProduct(slug: string): Promise<Product | undefined> {
  try {
    return await apiClient.get<Product>(`/products/${slug}`);
  } catch (error) {
    console.warn('Falling back to local product', error);
    return products.find((product) => product.slug === slug);
  }
}
