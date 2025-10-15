# GYT Collector Regional API Integration

Integración API Colecturía Regional con Web Service Banco GYT Continental

## Descripción

Este proyecto implementa un servicio web que actúa como intermediario entre el Banco GYT Continental y la API de Akros, facilitando el procesamiento de pagos mediante la conversión de formatos XML a JSON y viceversa.

## Flujo de Comunicación

```
Banco GYT (XML) → Web Service Colecturía (HTTPS/443) → Parseo XML → JSON → API Akros (OAuth 2.0)
                                                                              ↓
Banco GYT (XML) ← Conversión XML ← JSON ← Respuesta API Akros
```

### Proceso Detallado:

1. **Recepción**: Banco GYT envía solicitud POST con XML sobre HTTPS (puerto 443)
2. **Parseo**: El servicio parsea el XML recibido
3. **Conversión**: Convierte XML a formato JSON
4. **Autenticación**: Obtiene token OAuth 2.0 de la API de Akros
5. **Llamada API**: Envía petición JSON a la API de Akros con autenticación
6. **Respuesta**: Recibe respuesta JSON de Akros
7. **Conversión**: Convierte JSON a formato XML
8. **Envío**: Responde al Banco GYT con XML

## Estructura del Proyecto

```
gyt-collector-regional-api-integration/
├── src/
│   ├── index.js                    # Punto de entrada de la aplicación
│   ├── controllers/
│   │   └── collectorController.js  # Controlador de procesamiento de pagos
│   ├── routes/
│   │   └── collector.js            # Rutas de la API
│   ├── services/
│   │   └── akrosClient.js          # Cliente para API Akros con OAuth 2.0
│   ├── utils/
│   │   ├── logger.js               # Configuración de logging
│   │   └── xmlConverter.js         # Utilidades de conversión XML/JSON
│   └── middleware/
│       └── errorHandler.js         # Manejo de errores
├── tests/
│   ├── unit/                       # Tests unitarios
│   └── integration/                # Tests de integración
├── .env.example                    # Ejemplo de variables de entorno
├── Dockerfile                      # Configuración Docker
├── docker-compose.yml              # Orquestación Docker
└── package.json                    # Dependencias del proyecto
```

## Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Certificados SSL para HTTPS (producción)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/andrescoto-cpu/gyt-collector-regional-api-integration.git
cd gyt-collector-regional-api-integration
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con las credenciales correctas
```

4. (Producción) Colocar certificados SSL:
```bash
mkdir -p certs
# Copiar key.pem y cert.pem a la carpeta certs/
```

## Configuración

Editar el archivo `.env` con los valores apropiados:

```env
NODE_ENV=development
PORT=443

# Configuración API Akros
AKROS_API_URL=https://api.akros.com
AKROS_CLIENT_ID=your_client_id
AKROS_CLIENT_SECRET=your_client_secret
AKROS_TOKEN_URL=https://api.akros.com/oauth/token
AKROS_API_ENDPOINT=/api/v1/payments

# Configuración SSL (producción)
SSL_KEY_PATH=./certs/key.pem
SSL_CERT_PATH=./certs/cert.pem

# Logging
LOG_LEVEL=info
```

## Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

### Docker

```bash
# Construir imagen
docker build -t gyt-collector .

# Ejecutar con docker-compose
docker-compose up -d
```

## API Endpoints

### POST /api/collector/payment

Procesa solicitudes de pago del Banco GYT.

**Request:**
- Content-Type: `application/xml`
- Body: XML con datos de la transacción

**Response:**
- Content-Type: `application/xml`
- Body: XML con resultado del procesamiento

**Ejemplo de Request XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<request>
  <amount>100.00</amount>
  <account>12345678</account>
  <reference>REF123456</reference>
</request>
```

**Ejemplo de Response XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>success</status>
  <transactionId>TXN123456789</transactionId>
  <message>Transaction processed</message>
  <timestamp>2025-10-15T18:45:00.000Z</timestamp>
</response>
```

### GET /health

Endpoint de verificación de salud del servicio.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-15T18:45:00.000Z"
}
```

## Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ver cobertura
npm test -- --coverage
```

## Seguridad

- Comunicación HTTPS/TLS en producción (puerto 443)
- Autenticación OAuth 2.0 con API Akros
- Headers de seguridad con Helmet.js
- Validación de entrada XML
- Logging de todas las transacciones
- Manejo seguro de credenciales con variables de entorno

## Logging

Los logs se almacenan en:
- `error.log`: Errores del sistema
- `combined.log`: Todos los eventos
- Console: En modo desarrollo

Niveles de log: error, warn, info, debug

## Mantenimiento

### Rotación de Tokens OAuth 2.0

El sistema maneja automáticamente la renovación de tokens OAuth 2.0 antes de su expiración.

### Monitoreo

- Verificar endpoint `/health` para estado del servicio
- Revisar logs para identificar errores
- Monitorear tasas de error en conversiones XML/JSON

## Troubleshooting

### Error: "OAuth 2.0 authentication failed"
- Verificar credenciales AKROS_CLIENT_ID y AKROS_CLIENT_SECRET
- Confirmar que AKROS_TOKEN_URL es correcta
- Revisar conectividad con API Akros

### Error: "Failed to start HTTPS server"
- Verificar que los certificados SSL existen en la ruta especificada
- Confirmar permisos de lectura de certificados
- En desarrollo, cambiar NODE_ENV a 'development' para usar HTTP

### Error en parsing XML
- Validar formato XML de entrada
- Revisar logs para detalles del error
- Verificar encoding UTF-8

## Contribuir

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

ISC

## Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.
