# ecommerce-template

## Infraestructura local

1. Arranca los servicios base con Docker Compose:
   ```bash
   docker compose -f infrastructure/docker-compose.yml up -d db redis backend
   ```
   - La base de datos queda disponible en `localhost:5432`.
   - Redis expone `localhost:6379`.
   - El backend de Medusa se sirve en `http://localhost:9000`.

2. Para detenerlos:
   ```bash
   docker compose -f infrastructure/docker-compose.yml down
   ```

## Desarrollo

Desde la raíz del repositorio:

- Levantar solo el backend: `npm run dev:backend`
- Levantar solo el storefront: `npm run dev:storefront`
- Levantar ambas apps en paralelo: `npm run dev`

En cada app también puedes levantar los servicios con Docker Compose:

- `npm --prefix apps/backend run services` para levantar db/redis/backend.
- `npm --prefix apps/storefront run services` para levantar el backend requerido por el storefront.

## Seeds

1. Asegúrate de que la base de datos esté activa (puedes usar `npm --prefix apps/backend run services`).
2. Ejecuta el seed desde la raíz: `npm run seed`.
3. También puedes correrlo dentro del contenedor del backend: `npm --prefix apps/backend run seed:services`.

Las credenciales de administrador por defecto se crean con:
```bash
npm --prefix apps/backend run seed:admin
```
