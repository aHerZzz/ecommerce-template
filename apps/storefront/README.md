# Storefront (Astro 5 + TypeScript + Tailwind)

Tienda headless construida con Astro 5, TypeScript y Tailwind para el directorio `apps/storefront`.

## Configuración rápida

```bash
cd apps/storefront
npm install
npm run dev
```

Scripts disponibles:

- `npm run dev`: levanta el entorno de desarrollo.
- `npm run build`: genera la salida estática.
- `npm run preview`: sirve la build generada.
- `npm run check` / `npm run lint`: validación de tipados y rutas.

## Variables de entorno

Crea un fichero `.env` en `apps/storefront` si necesitas personalizar las integraciones:

```
PUBLIC_BACKEND_URL=http://localhost:3000
PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

## Estructura principal

- `src/pages`: rutas de catálogo, detalle, carrito, checkout, legal y perfil.
- `src/components`: cabecera, pie, grillas de productos, carrito, autenticación y wrappers React.
- `src/hooks`: hooks de autenticación, wishlist y carrito persistente.
- `src/services`: cliente API, productos con fallback y scaffolding de Stripe.
- `config/legal.config.json`: títulos y slugs de páginas legales consumidas por las rutas.
- `src/i18n`: traducciones con `es` por defecto y estructura extensible.

## Internacionalización

El idioma por defecto es `es`. Añade nuevas claves en `src/i18n/config.ts` y úsalas mediante la función `t`.

## Stripe y checkout

El archivo `src/services/stripe.ts` contiene el scaffolding para iniciar sesiones de checkout. Debes crear el endpoint en el backend y exponer las claves públicas/privadas por entorno para completar la integración.
