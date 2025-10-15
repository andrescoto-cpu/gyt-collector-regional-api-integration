# gyt-collector-regional-api-integration
Integración API Colecturía Regional con Web Service Banco GYT Continental

## Overview
This is an ASP.NET Core Web API project that integrates regional collection services with Banco GYT Continental's Web Service.

## Getting Started

### Prerequisites
- .NET 9.0 SDK or later

### Building the Project
```bash
dotnet build
```

### Running the Application
```bash
dotnet run
```

The API will be available at `http://localhost:5241`

## API Endpoints

### Banco GYT Controller (`/api/BancoGyt`)

#### Health Check
- **GET** `/api/BancoGyt/health`
- Returns the health status of the integration service

#### Verify Payment
- **GET** `/api/BancoGyt/verify/{paymentId}`
- Verifies a payment with Banco GYT Continental
- Parameters:
  - `paymentId`: Payment identifier

#### Collect Payment
- **POST** `/api/BancoGyt/collect`
- Processes a payment collection through Banco GYT Continental
- Request Body:
```json
{
  "amount": 100.50,
  "currency": "GTQ",
  "accountReference": "ACC123",
  "description": "Payment description"
}
```

#### Get Payment Status
- **GET** `/api/BancoGyt/status/{transactionId}`
- Queries the status of a transaction
- Parameters:
  - `transactionId`: Transaction identifier

## Project Structure
```
.
├── Controllers/
│   └── BancoGytController.cs    # Main controller for Banco GYT integration
├── Properties/
│   └── launchSettings.json
├── Program.cs                    # Application entry point
├── appsettings.json             # Application configuration
└── GytCollectorRegionalApi.csproj
```
