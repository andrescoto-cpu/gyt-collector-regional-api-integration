gyt-collector-web-service

# GYT Collector Web Service

## Descripción

GYT Collector Web Service es una API Node.js/Express que recibe solicitudes de pago en XML, las convierte a JSON, interactúa con la API de Akros usando OAuth 2.0 y responde en XML. Incluye logging, manejo de errores global y pruebas automatizadas.

## Estructura del Proyecto

```
src/
   controllers/
      collectorController.js
   middleware/
      errorHandler.js
   services/
      akrosClient.js
   utils/
      logger.js
      xmlConverter.js
   app.js
test/
   controllers/
      collectorController.test.js
   services/
      akrosClient.test.js
   utils/
      xmlConverter.test.js
.env.example
package.json
README.md
ARCHITECTURE.md
```

## Instalación

1. Clona el repositorio:
    ```bash
    git clone <url-del-repositorio>
    cd gyt-collector-regional-api-integration
    ```
2. Instala las dependencias:
    ```bash
    npm install
    ```
3. Configura las variables de entorno:
    ```bash
    cp .env.example .env
    # Edita .env con tus credenciales y configuración
    ```

## Uso

Para iniciar el servidor:

```bash
npm start
```

El servidor escuchará en el puerto definido por la variable de entorno `PORT` (por defecto 3000).

### Endpoint principal

- `POST /api/collector/payment` — Recibe solicitudes de pago en XML.

## Variables de entorno principales

- `NODE_ENV` — development/production
- `PORT` — Puerto del servidor (ej: 3000)
- `AKROS_CLIENT_ID`, `AKROS_CLIENT_SECRET`, `AKROS_TOKEN_URL` — Credenciales y URL de Akros API
- `SSL_CERT_PATH`, `SSL_KEY_PATH` — Rutas a certificados SSL (si aplica)
- `LOG_LEVEL` — Nivel de logging

Consulta `.env.example` para ver todos los parámetros.

## Pruebas

Para ejecutar los tests:

```bash
npm test
```

## Arquitectura y detalles técnicos

Consulta [`ARCHITECTURE.md`](ARCHITECTURE.md) para un diagrama, flujo de datos, seguridad, manejo de errores y detalles de componentes.

## Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o pull request para sugerencias o mejoras.

## Licencia

MIT. Consulta el archivo LICENSE para más detalles.