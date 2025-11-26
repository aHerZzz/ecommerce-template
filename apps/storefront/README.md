# Storefront (Astro 5 + TypeScript + Tailwind)

Tienda headless construida con Astro 5, TypeScript y Tailwind para el directorio `apps/storefront`.

## Configuración rápida

```bash
cd apps/storefront
npm install
npm run dev
```

> Importante: el frontend necesita conocer la URL del backend para poder cargar el catálogo inicial. Por defecto el entorno de desarrollo usa `http://localhost:9000`, así que crea un `.env` con ese valor si no tienes uno propio.

Scripts disponibles:

- `npm run dev`: levanta el entorno de desarrollo.
- `npm run build`: genera la salida estática.
- `npm run preview`: sirve la build generada.
- `npm run check` / `npm run lint`: validación de tipados y rutas.

## Variables de entorno

Crea un fichero `.env` en `apps/storefront` si necesitas personalizar las integraciones:

```
PUBLIC_BACKEND_URL=http://localhost:9000
PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

## Estructura principal

- `src/pages`: rutas de catálogo, detalle, carrito, checkout, legal y perfil.
- `src/components`: cabecera, pie, grillas de productos, carrito, autenticación y wrappers React.
- `src/hooks`: hooks de autenticación, wishlist y carrito persistente.
- `src/services`: cliente API, productos con fallback y scaffolding de Stripe.
- `config/legal.config.json`: textos legales y datos de la empresa que se muestran en el pie y las páginas legales.
- `config/store.config.json`: branding, moneda, IVA y reglas de envío consumidas por cabecera, listados y carrito.
- `config/theme.config.json`: paleta, tipografías y logos usados en Tailwind, estilos globales y favicon.
- `src/i18n`: traducciones con `es` por defecto y estructura extensible.

## Personalizar branding, tema y textos legales

Todos los ficheros de configuración se encuentran en `apps/storefront/config` y se recargan de forma estática, por lo que basta con editarlos y volver a construir.

- `store.config.json`: define el nombre de la tienda, el claim de branding, la moneda y el IVA usado para formatear precios (`formatPrice`) y calcular el carrito. También incluye el coste base de envío, el umbral de envío gratis y los métodos disponibles que se muestran en el resumen del carrito.
- `theme.config.json`: controla la paleta usada por Tailwind (`primary`, `accent`, `background`, `surface`, `text`), las familias tipográficas para cuerpo y titulares, y los logos (principal, cuadrado y favicon) que alimentan la cabecera y la etiqueta `<link rel="icon">`.
- `legal.config.json`: almacena los textos de cada página legal (`slug`, `title`, `body`) y los datos corporativos (empresa, dirección, email, año). Las rutas en `/legal/[slug]` consumen directamente el contenido de `body`.

Ejemplo de edición rápida:

1. Actualiza `branding.storeName` y `branding.tagline` en `store.config.json` para renombrar la cabecera, el `<title>` y el encabezado de la home.
2. Cambia los hexadecimales de `theme.config.json` para modificar `primary` y `accent`; Tailwind recompilará las clases `bg-primary` y `text-accent` con los nuevos valores.
3. Sustituye `logos.main` por la URL de tu logotipo o un asset estático y ajusta los textos legales en `legal.config.json` para que las páginas de Términos, Privacidad y Cookies muestren tu copy final.

## Internacionalización

El idioma por defecto es `es`. Añade nuevas claves en `src/i18n/config.ts` y úsalas mediante la función `t`.

## Stripe y checkout

El archivo `src/services/stripe.ts` contiene el scaffolding para iniciar sesiones de checkout. Debes crear el endpoint en el backend y exponer las claves públicas/privadas por entorno para completar la integración.
