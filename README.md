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

Las variables se leen desde archivos `.env` en `apps/backend` (o `.env.<MEDUSA_ENV>`). Para desarrollo se pueden exportar en el shell o añadir a un `.env` en esa carpeta. Usa archivos diferentes según dónde corras los comandos:

- `.env.docker`: viene versionado con las URLs internas de la red Docker (`DATABASE_URL=postgres://medusa:medusa@db:5432/medusa`, `REDIS_URL=redis://redis:6379`). El `docker-compose` del repo lo monta por defecto para que el contenedor del backend encuentre sus servicios.
- `.env.host`: pensado para ejecutar migraciones/seeds desde tu máquina (`DATABASE_URL=postgres://medusa:medusa@localhost:5432/medusa`, `REDIS_URL=redis://localhost:6379`). Crea tu copia local desde el ejemplo con `cp apps/backend/.env.host.example apps/backend/.env.host.local` para evitar el error de "Missing env file" al correr `pnpm run dev:backend`, `pnpm run migrate` o `pnpm run seed` desde el host.

El backend resuelve el archivo en este orden: primero `ENV_FILE` si está definido; si corres desde el host, busca `.env.host.local` y luego `.env.host`; después usa `.env.<MEDUSA_ENV>` (si está definido) y por último `.env`. Si no encuentra `DATABASE_URL` o `REDIS_URL` después de leer el archivo seleccionado, mostrará un error con la ruta cargada y te pedirá ejecutar con `MEDUSA_ENV=host` o definir `ENV_FILE` apuntando al archivo correcto.

Al ejecutar procesos del backend desde el host (`dev`, `start`, `migrate`, `seed`), los scripts ya prueban `.env.host.local`, `.env.host` y finalmente `.env`, de modo que normalmente no necesitas exportar `ENV_FILE` para apuntar a tus servicios locales. Los contenedores de Docker cargan `ENV_FILE=./.env.docker` por defecto (o el archivo que definas en `docker-compose`).

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
# apps/backend/.env.host.example (para ejecutar desde el host)
PORT=9000
DATABASE_URL=postgres://medusa:medusa@localhost:5432/medusa
REDIS_URL=redis://localhost:6379
STORE_CORS=http://localhost:4321
ADMIN_CORS=http://localhost:7000
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RUN_SEED=false
SEED_FILE=./data/seed.json
START_COMMAND=dev
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

2. Ejecuta las migraciones desde tu máquina con las variables del host:
   ```bash
   cp apps/backend/.env.host.example apps/backend/.env.host.local  # crea tu copia local antes de correr comandos
   MEDUSA_ENV=host pnpm --dir apps/backend run migrate  # prueba .env.host.local, .env.host y luego .env
   ```

3. Semilla los datos (host) usando el mismo archivo de entorno:
   ```bash
   MEDUSA_ENV=host pnpm --dir apps/backend run seed  # usa el mismo orden de resolución de entorno
   ```
   - Usa un archivo alternativo: `pnpm --dir apps/backend run seed --file=./data/otra-semilla.json`

4. Alternativa: corre migraciones y seeds dentro del contenedor del backend (si levantaste `backend` con Docker):
   ```bash
   docker compose -f infrastructure/docker-compose.yml exec backend pnpm run migrate
   docker compose -f infrastructure/docker-compose.yml exec backend pnpm run seed
   ```

5. Inicia el backend de Medusa con recarga en `http://localhost:9000`:
   ```bash
   MEDUSA_ENV=host pnpm run dev:backend
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

> Antes de levantar los servicios, ya tienes `apps/backend/.env.docker` con las URLs internas (`db`/`redis`) que usa el contenedor del backend. Si quieres personalizarlo sin modificar el archivo versionado, crea tu propia copia (`cp apps/backend/.env.docker apps/backend/.env`) y apunta `ENV_FILE` o la clave `env_file` del `docker-compose` a ese archivo.

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
   - El script acepta `--file=<ruta>` igual que en host si quieres otro JSON.

> **Nota de solución de problemas:** el `docker-compose.yml` expone las vars `RUN_SEED` y `SEED_FILE`. Establece `RUN_SEED=true` para
> ejecutar seeds en cada arranque y define `SEED_FILE` (por ejemplo `./data/otra-semilla.json`) para sobreescribir el valor por defecto
> `./data/seed.json`.

### Flujo de desarrollo local (sin Docker en las apps)

1. Levanta la infraestructura (db y redis) con Docker o servicios locales equivalentes.
2. Define tus variables en `apps/backend/.env.host` o, para overrides locales, en `apps/backend/.env.host.local`.
   - Fuera de Docker, `medusa-config.(js|ts)` detecta automáticamente primero `.env.host.local`, luego `.env.host` y, si no existen, cae en `.env.<MEDUSA_ENV>` o `.env`, por lo que no necesitas exportar `ENV_FILE`/`MEDUSA_ENV` para el flujo estándar.
3. En una terminal, inicia el backend: `pnpm run dev:backend` (usa por defecto los archivos host detectados).
4. En otra terminal, inicia el storefront: `pnpm run dev:storefront`.
5. Corre seeds si necesitas datos de prueba: `pnpm run seed`.

## Seeds y datos iniciales

- Seed completo: `pnpm run seed` (requiere DB activa). Acepta `--file=./data/mi-semilla.json` para usar otro archivo.
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

