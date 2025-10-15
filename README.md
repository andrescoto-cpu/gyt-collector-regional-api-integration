# gyt-collector-regional-api-integration

Integración API Colecturía Regional con Web Service Banco GYT Continental

## Project Structure

This repository contains a C# .NET 8.0 implementation for the GYT Collector Regional API integration.

### Components

- **src/** - Main library containing the LoggingService implementation
- **tests/** - Unit tests using xUnit
- **examples/** - Example programs demonstrating usage
- **docs/** - Documentation

## Features

### LoggingService
A comprehensive logging service with:
- Multiple log levels (Info, Warning, Error, Debug)
- Console and file logging
- Colored console output
- Thread-safe operations
- UTC timestamps
- Exception logging with stack traces

## Getting Started

### Prerequisites
- .NET 8.0 SDK or later

### Building the Project

```bash
# Build the library
cd src
dotnet build

# Run tests
cd ../tests
dotnet test

# Run example
cd ../examples
dotnet run
```

## Documentation

See [docs/LoggingService.md](docs/LoggingService.md) for detailed documentation on the logging service.

## Usage Example

```csharp
using GytCollectorRegionalApi.Services;

// Create a logging service instance
ILoggingService logger = new LoggingService();

// Use different log levels
logger.LogInfo("Application started");
logger.LogWarning("This is a warning");
logger.LogError("An error occurred");
logger.LogDebug("Debug information");

// Log exceptions
try
{
    // Your code
}
catch (Exception ex)
{
    logger.LogError("Operation failed", ex);
}
```

## License

This project is part of the GYT Collector Regional API integration system.

