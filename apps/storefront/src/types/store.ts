export type ApiMoneyAmount = {
  amount: number;
  currency_code: string;
};

export type ApiProductVariant = {
  id: string;
  title: string;
  sku?: string | null;
  prices?: ApiMoneyAmount[];
  options?: Record<string, string>;
};

export type ApiProduct = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  subtitle?: string | null;
  thumbnail?: string | null;
  images?: string[];
  tags?: { id: string; value: string }[];
  categories?: { id: string; name: string; handle: string }[];
  variants: ApiProductVariant[];
};

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  sku?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  tags: string[];
  variants: ProductVariant[];
};

export type ApiLineItem = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  quantity: number;
  unit_price: number;
  variant_id?: string;
  variant?: ApiProductVariant & { product?: ApiProduct };
};

export type ApiCart = {
  id: string;
  items: ApiLineItem[];
  subtotal: number;
  total: number;
  tax_total: number | null;
  shipping_total: number;
  discount_total: number;
  region?: { id: string; name: string; currency_code: string };
};

export type ApiOrder = {
  id: string;
  status: string;
  email?: string;
  cart_id?: string;
  display_id?: number;
  total?: number;
  subtotal?: number;
  shipping_total?: number;
  tax_total?: number | null;
};
