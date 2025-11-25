# Plugins del backend

El backend de Medusa utiliza la API de plugins para extender rutas y servicios sin modificar el core. Cada plugin exporta una función async que devuelve metadatos (`resolve`, `routers`, `services`) y puede registrar middleware o endpoints adicionales.

## Estructura

```
apps/backend
├── medusa-config.ts     # registra plugins y lee variables de entorno
└── src
    └── plugins
        ├── shipping
        │   └── index.ts
        └── mock-webhook
            └── index.ts
```

- Cada plugin vive en su propia carpeta dentro de `src/plugins`.
- El archivo `index.ts` define las rutas y retorna el objeto de configuración del plugin.
- Se registran en `medusa-config.ts` con `resolve: path.join(__dirname, "src/plugins/<plugin>")`.

## Plugins incluidos

### `shipping`

- Expone rutas públicas para obtener métodos de envío de ejemplo.
- Rutas:
  - `GET /store/shipping-options` devuelve la lista de métodos.
  - `GET /store/shipping-options/:id` devuelve un método específico.
- Uso: consulta desde el storefront para mostrar opciones al usuario.

### `mock-webhook`

- Pensado para probar integraciones de webhooks en desarrollo.
- Rutas:
  - `POST /hooks/test` devuelve el payload recibido.
  - `GET /hooks/test` actúa como healthcheck sencillo.
- Disponible tanto para el tipo `admin` como `store`.

## Crear un nuevo plugin

1. **Crea la carpeta** `apps/backend/src/plugins/<mi-plugin>` y un `index.ts` dentro.
2. **Exporta una función** que registre rutas o servicios:
   ```ts
   import { Router } from "express";

   export default async function myPlugin() {
     const router = Router();

     router.get("/hello", (_req, res) => {
       res.json({ message: "Hola desde mi plugin" });
     });

     return {
       resolve: "my-plugin",
       routers: [
         { type: "store", route: "", router },
       ],
       services: [],
     };
   }
   ```
3. **Registra el plugin** en `apps/backend/medusa-config.ts`:
   ```ts
   import path from "path";

   // ...
   plugins: [
     // otros plugins
     { resolve: path.join(__dirname, "src/plugins/my-plugin"), options: {} },
   ],
   ```
4. **Reinicia el backend** (`npm run dev:backend`) para cargar el nuevo plugin.

## Buenas prácticas

- Mantén la lógica de negocio en servicios o archivos separados si crece la complejidad.
- Usa variables de entorno para credenciales externas y accede a ellas en `medusa-config.ts`.
- Prefiere rutas con prefijo claro para evitar colisiones (`/store/<feature>`, `/admin/<feature>`).
- Acompaña cada plugin con pruebas manuales o scripts de verificación de rutas según aplique.

