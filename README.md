# ecommerce-template

Plantilla de monorepo para tiendas basadas en Medusa con storefront Astro. Incluye infraestructura local con Docker Compose, scripts de desarrollo y ejemplos de plugins para extender el backend.

## Arquitectura del monorepo

- `apps/backend`: API de Medusa (TypeScript) con plugins personalizados.
- `apps/storefront`: Storefront en Astro + React.
- `infrastructure/docker-compose.yml`: Servicios auxiliares (PostgreSQL, Redis y backend en contenedor para desarrollo rápido).
- `package.json`: Scripts raíz para orquestar las apps.

## Requisitos

- Node.js 20+ con pnpm (se recomienda habilitar Corepack para gestionarlo automáticamente). npm puede funcionar como alternativa.
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

### Instalación por app (paso a paso)

1. Habilita pnpm si no lo tienes: `corepack enable pnpm` (o instala pnpm manualmente).
2. Instala dependencias del backend: `pnpm install --dir apps/backend`.
3. Instala dependencias del storefront: `pnpm install --dir apps/storefront`.
4. Verifica que los binarios queden disponibles desde la raíz (pnpm usa el store compartido del workspace).

Ejemplos de `.env` locales:

```bash
# apps/backend/.env
DATABASE_URL=postgres://medusa:medusa@localhost:5432/medusa
REDIS_URL=redis://localhost:6379
STORE_CORS=http://localhost:4321
ADMIN_CORS=http://localhost:7000
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
```

```bash
# apps/storefront/.env
PUBLIC_BACKEND_URL=http://localhost:9000
PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
```

### Backend y base de datos (docker-compose + pnpm)

1. Levanta base de datos y Redis (Docker):
   ```bash
   docker compose -f infrastructure/docker-compose.yml up -d db redis
   ```
   - PostgreSQL: `localhost:5432`
   - Redis: `localhost:6379`

2. Ejecuta las migraciones desde tu máquina:
   ```bash
   pnpm --dir apps/backend run migrate
   ```

3. Semilla los datos (host):
   ```bash
   pnpm --dir apps/backend run seed
   ```

4. Alternativa: corre migraciones y seeds dentro del contenedor del backend (si levantaste `backend` con Docker):
   ```bash
   docker compose -f infrastructure/docker-compose.yml exec backend pnpm run migrate
   docker compose -f infrastructure/docker-compose.yml exec backend pnpm run seed
   ```

5. Inicia el backend de Medusa con recarga en `http://localhost:9000`:
   ```bash
   pnpm run dev:backend
   ```

Para ejecutar todo en contenedores en segundo plano:
```bash
docker compose -f infrastructure/docker-compose.yml up -d db redis backend
```
- Backend Medusa: `http://localhost:9000`

### Storefront (Astro)

1. Con el backend operativo en `http://localhost:9000`, inicia el storefront en `http://localhost:4321`:
   ```bash
   pnpm run dev:storefront
   ```

2. Levanta backend + storefront en paralelo desde la raíz (dos procesos pnpm):
   ```bash
   pnpm run dev
   ```

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
   docker compose -f infrastructure/docker-compose.yml exec backend pnpm run seed
   ```

> **Nota de solución de problemas:** el `docker-compose.yml` expone las vars `RUN_SEED` y `SEED_FILE`. Déjalas en `false`/vacías
> para evitar que el contenedor ejecute seeds automáticamente en cada arranque, o define `SEED_FILE` con la ruta relativa del
> seed que quieras correr cuando establezcas `RUN_SEED=true`.

### Flujo de desarrollo local (sin Docker en las apps)

1. Levanta la infraestructura (db y redis) con Docker o servicios locales equivalentes.
2. Exporta las variables de entorno en `apps/backend/.env` (ver tabla anterior).
3. En una terminal, inicia el backend: `pnpm run dev:backend`.
4. En otra terminal, inicia el storefront: `pnpm run dev:storefront`.
5. Corre seeds si necesitas datos de prueba: `pnpm run seed`.

## Seeds y datos iniciales

- Seed completo: `pnpm run seed` (requiere DB activa).
- Crear usuario admin por defecto: `pnpm --dir apps/backend run seed:admin`.

## Plugins y personalización

El backend carga plugins definidos en `apps/backend/src/plugins` y configurados en `apps/backend/medusa-config.ts`.

- `shipping`: expone rutas públicas de catálogo de envíos.
  - `GET /store/shipping-options` devuelve métodos mock.
  - `GET /store/shipping-options/:id` devuelve un método específico.
- `mock-webhook`: endpoints de prueba disponibles para store y admin.
  - `GET /hooks/test` responde como healthcheck sencillo.
  - `POST /hooks/test` devuelve el payload recibido.

Para añadir o modificar plugins:
1. Crea una carpeta dentro de `apps/backend/src/plugins/<mi-plugin>` con un `index.ts` que exporte la función del plugin.
2. Registra el plugin en `apps/backend/medusa-config.ts` usando `resolve: path.join(__dirname, "src/plugins/<mi-plugin>")` y pasa `options` si aplica.
3. Reinicia el backend para cargar los cambios.

Más detalles en [docs/plugins.md](docs/plugins.md).

## Despliegue

- **Backend**: compila con `pnpm --dir apps/backend run build` y ejecuta con `pnpm --dir apps/backend run start` usando las variables de entorno productivas. Puedes empaquetarlo en contenedor reutilizando `infrastructure/docker-compose.yml` como referencia.
- **Storefront**: genera assets estáticos con `pnpm --dir apps/storefront run build` y sirve con tu hosting preferido (`pnpm --dir apps/storefront run preview` para probar).
- Asegura que `DATABASE_URL`, `REDIS_URL`, `STORE_CORS`, `ADMIN_CORS` y secretos estén configurados en el entorno de despliegue.

## Documentación adicional

- [docs/plugins.md](docs/plugins.md): guía para crear y extender plugins.

