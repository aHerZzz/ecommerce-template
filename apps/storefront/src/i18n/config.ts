export const defaultLocale = 'es';

export const messages: Record<string, Record<string, string>> = {
  es: {
    searchPlaceholder: 'Buscar productos',
    cart: 'Carrito',
    profile: 'Perfil',
    addToCart: 'Añadir al carrito',
    addToWishlist: 'Añadir a favoritos',
    viewDetails: 'Ver detalles',
    filters: 'Filtros',
    variants: 'Variantes',
    legal: 'Legal',
    checkout: 'Pagar',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    vat: 'IVA',
    total: 'Total'
  }
};

export const availableLocales = Object.keys(messages);

export function t(key: string, locale = defaultLocale): string {
  return messages[locale]?.[key] ?? messages[defaultLocale]?.[key] ?? key;
}
