# ecommerce-template

Plantilla de monorepo para tiendas basadas en Medusa con storefront Astro. Incluye infraestructura local con Docker Compose, scripts de desarrollo y ejemplos de plugins para extender el backend.

## Arquitectura del monorepo

- `apps/backend`: API de Medusa (TypeScript) con plugins personalizados.
- `apps/storefront`: Storefront en Astro + React.
- `infrastructure/docker-compose.yml`: Servicios auxiliares (PostgreSQL, Redis y backend en contenedor para desarrollo rápido).
- `package.json`: Scripts raíz para orquestar las apps.

## Requisitos

- Node.js 20+ y npm.
- Docker y Docker Compose (para levantar la infraestructura local o desarrollo con contenedores).
- Stripe (clave secreta) si se quiere probar el plugin de pagos.

## Variables de entorno

Las variables se leen desde archivos `.env` en `apps/backend` (o `.env.<MEDUSA_ENV>`). Para desarrollo se pueden exportar en el shell o añadir a un `.env` en esa carpeta.

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL. | `postgres://medusa:medusa@localhost:5432/medusa` |
| `REDIS_URL` | URL de Redis. | `redis://localhost:6379` |
| `STORE_CORS` | Orígenes permitidos para la tienda. | `http://localhost:4321` |
| `ADMIN_CORS` | Orígenes permitidos para el panel admin. | `http://localhost:7000` |
| `JWT_SECRET` | Secreto para JWT. | `supersecret` |
| `COOKIE_SECRET` | Secreto para cookies de sesión. | `supersecret` |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe para el plugin de pagos. | `sk_test_...` |

## Comandos principales

Desde la raíz del monorepo:

- `npm install --prefix apps/backend` y `npm install --prefix apps/storefront` para instalar dependencias.
- `npm run dev:backend`: inicia el backend de Medusa con recarga.
- `npm run dev:storefront`: inicia el storefront de Astro en `http://localhost:4321`.
- `npm run dev`: levanta backend y storefront en paralelo.
- `npm run seed`: ejecuta los seeds del backend.

### Infraestructura local con Docker

1. Levanta base de datos, Redis y backend en contenedor:
   ```bash
   docker compose -f infrastructure/docker-compose.yml up -d db redis backend
   ```
   - PostgreSQL: `localhost:5432`
   - Redis: `localhost:6379`
   - Backend Medusa: `http://localhost:9000`

2. Detén y limpia:
   ```bash
   docker compose -f infrastructure/docker-compose.yml down
   ```

3. Para ejecutar seeds dentro del contenedor del backend:
   ```bash
   docker compose -f infrastructure/docker-compose.yml exec backend npm run seed
   ```

### Flujo de desarrollo local (sin Docker en las apps)

1. Levanta la infraestructura (db y redis) con Docker o servicios locales equivalentes.
2. Exporta las variables de entorno en `apps/backend/.env` (ver tabla anterior).
3. En una terminal, inicia el backend: `npm run dev:backend`.
4. En otra terminal, inicia el storefront: `npm run dev:storefront`.
5. Corre seeds si necesitas datos de prueba: `npm run seed`.

## Seeds y datos iniciales

- Seed completo: `npm run seed` (requiere DB activa).
- Crear usuario admin por defecto: `npm --prefix apps/backend run seed:admin`.

## Plugins y personalización

El backend carga plugins definidos en `apps/backend/src/plugins` y configurados en `apps/backend/medusa-config.ts`.

- `shipping`: expone métodos de envío mock desde rutas públicas (`/store/shipping-options`).
- `mock-webhook`: expone endpoints de prueba de webhooks tanto para store como admin (`/hooks/test`).

Para añadir o modificar plugins:
1. Crea una carpeta dentro de `apps/backend/src/plugins/<mi-plugin>` con un `index.ts` que exporte la función del plugin.
2. Registra el plugin en `apps/backend/medusa-config.ts` usando `resolve: path.join(__dirname, "src/plugins/<mi-plugin>")` y pasa `options` si aplica.
3. Reinicia el backend para cargar los cambios.

Más detalles en [docs/plugins.md](docs/plugins.md).

## Despliegue

- **Backend**: compila con `npm --prefix apps/backend run build` y ejecuta con `npm --prefix apps/backend run start` usando las variables de entorno productivas. Puedes empaquetarlo en contenedor reutilizando `infrastructure/docker-compose.yml` como referencia.
- **Storefront**: genera assets estáticos con `npm --prefix apps/storefront run build` y sirve con tu hosting preferido (`npm --prefix apps/storefront run preview` para probar).
- Asegura que `DATABASE_URL`, `REDIS_URL`, `STORE_CORS`, `ADMIN_CORS` y secretos estén configurados en el entorno de despliegue.

## Documentación adicional

- [docs/plugins.md](docs/plugins.md): guía para crear y extender plugins.

