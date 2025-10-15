# gyt-collector-regional-api-integration

Integración API Colecturía Regional con Web Service Banco GYT Continental

## Descripción

Este proyecto proporciona una API REST para integrar la Colecturía Regional con el Web Service del Banco GYT Continental a través del servicio Akros.

## Estructura del Proyecto

```
GytCollectorApi/
├── Controllers/
│   └── PaymentsController.cs    # Controlador de pagos
├── Services/
│   └── akros_api_service.cs     # Servicio de integración con Akros API
├── Program.cs                    # Punto de entrada de la aplicación
├── appsettings.json             # Configuración de la aplicación
└── GytCollectorApi.csproj       # Archivo de proyecto .NET

GytCollectorApi.Tests/
├── AkrosApiServiceTests.cs      # Pruebas unitarias del servicio Akros
└── GytCollectorApi.Tests.csproj # Archivo de proyecto de pruebas

GytCollectorApi.sln              # Archivo de solución .NET
```

## Características

- **Servicio Akros API**: Servicio completo para integración con la API de Akros
  - Envío de pagos
  - Consulta de estado de transacciones
  - Validación de conectividad

- **Controlador de Pagos**: API REST con endpoints para:
  - `POST /api/payments` - Procesar un nuevo pago
  - `GET /api/payments/{transactionId}/status` - Consultar estado de pago
  - `GET /api/payments/health` - Verificar conectividad con Akros API

## Requisitos

- .NET 9.0 SDK o superior
- Visual Studio 2022, VS Code, o Rider (opcional)

## Configuración

1. Actualizar `appsettings.json` con la URL base del API de Akros:

```json
{
  "AkrosApi": {
    "BaseUrl": "https://api.akros.example.com",
    "Timeout": 30
  }
}
```

## Ejecución

### Modo Desarrollo

```bash
cd GytCollectorApi
dotnet run
```

O desde la raíz del proyecto:

```bash
dotnet run --project GytCollectorApi
```

### Compilación

Compilar todo el proyecto:

```bash
dotnet build GytCollectorApi.sln
```

O compilar solo la API:

```bash
cd GytCollectorApi
dotnet build
```

### Pruebas (Tests)

Ejecutar todas las pruebas:

```bash
dotnet test GytCollectorApi.sln
```

O ejecutar solo las pruebas del proyecto de tests:

```bash
cd GytCollectorApi.Tests
dotnet test
```

### Publicación

```bash
cd GytCollectorApi
dotnet publish -c Release
```

## Uso de la API

### Procesar un Pago

```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN123456",
    "amount": 100.50,
    "currency": "GTQ",
    "accountNumber": "1234567890",
    "customerName": "Juan Pérez",
    "transactionDate": "2025-10-15T12:00:00",
    "description": "Pago de servicio"
  }'
```

### Consultar Estado de Pago

```bash
curl http://localhost:5000/api/payments/TXN123456/status
```

### Verificar Salud del Servicio

```bash
curl http://localhost:5000/api/payments/health
```

## Documentación de la API

Cuando la aplicación se ejecuta en modo desarrollo, la documentación OpenAPI está disponible en:

- OpenAPI JSON: `http://localhost:5000/openapi/v1.json`

## Estructura de Datos

### PaymentRequest

```json
{
  "transactionId": "string",
  "amount": 0.0,
  "currency": "string",
  "accountNumber": "string",
  "customerName": "string",
  "transactionDate": "2025-10-15T12:00:00",
  "description": "string"
}
```

### AkrosApiResponse

```json
{
  "success": true,
  "message": "string",
  "transactionId": "string",
  "processedDate": "2025-10-15T12:00:00",
  "referenceNumber": "string"
}
```

### PaymentStatus

```json
{
  "status": "string",
  "transactionId": "string",
  "message": "string",
  "lastUpdated": "2025-10-15T12:00:00"
}
```

## Testing

El proyecto incluye pruebas unitarias completas para el servicio `AkrosApiService`. Las pruebas cubren:

- ✅ Envío exitoso de pagos
- ✅ Manejo de errores HTTP en envío de pagos
- ✅ Consulta exitosa de estado de pago
- ✅ Manejo de errores HTTP en consulta de estado
- ✅ Validación de conexión exitosa
- ✅ Manejo de fallo en validación de conexión

Ejecutar las pruebas:

```bash
dotnet test GytCollectorApi.sln
```

Para ver cobertura de código detallada, ejecutar:

```bash
cd GytCollectorApi.Tests
dotnet test --collect:"XPlat Code Coverage"
```

## Licencia

Este proyecto es propiedad de GYT Continental Bank.
