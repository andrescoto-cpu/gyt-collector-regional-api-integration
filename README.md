# GYT Collector Regional API Integration

Integración API Colecturía Regional con Web Service Banco GYT Continental

## Overview
This repository contains services for integrating the Regional Collection API with GYT Continental Bank Web Service, including XML validation capabilities for SOAP-based communication.

## Features

- **XML Validation Service**: Comprehensive XML validation against XSD schemas
- **Well-formedness checking**: Validates XML structure and syntax
- **Schema validation**: Validates XML content against XSD schemas
- **Error reporting**: Detailed error and warning messages
- **Test coverage**: Comprehensive unit tests with xUnit

## Project Structure

```
├── src/
│   └── GytCollectorRegionalApi.Services/    # Service library
│       └── XmlValidationService.cs          # XML validation service
├── tests/
│   └── GytCollectorRegionalApi.Tests/       # Unit tests
│       └── XmlValidationServiceTests.cs     # Test suite
├── examples/                                # Example files
│   ├── schemas/                            # XSD schemas
│   │   └── payment_request.xsd             # Payment request schema
│   ├── valid_payment_request.xml           # Valid example
│   └── invalid_payment_request.xml         # Invalid example
├── XmlValidationService.md                  # Documentation
├── XmlValidationServiceExample.cs           # Usage examples
└── GytCollectorRegionalApi.sln             # Solution file
```

## Getting Started

### Prerequisites
- .NET 9.0 SDK or later
- Visual Studio 2022 or Visual Studio Code (optional)

### Building the Project

```bash
# Clone the repository
git clone https://github.com/andrescoto-cpu/gyt-collector-regional-api-integration.git
cd gyt-collector-regional-api-integration

# Build the solution
dotnet build GytCollectorRegionalApi.sln
```

### Running Tests

```bash
# Run all tests
dotnet test GytCollectorRegionalApi.sln

# Run tests with detailed output
dotnet test GytCollectorRegionalApi.sln --verbosity detailed
```

### Using the XML Validation Service

```csharp
using GytCollectorRegionalApi.Services;

// Create service instance
var validationService = new XmlValidationService();

// Validate well-formedness
string xmlContent = @"<?xml version=""1.0""?><root><element>value</element></root>";
bool isValid = validationService.IsWellFormedXml(xmlContent);

// Validate against schema
bool isSchemaValid = validationService.ValidateAgainstSchema(
    xmlContent, 
    "path/to/schema.xsd"
);

// Get validation errors
if (!isSchemaValid)
{
    foreach (var error in validationService.GetValidationErrors())
    {
        Console.WriteLine(error);
    }
}
```

## Documentation

See [XmlValidationService.md](XmlValidationService.md) for detailed API documentation and usage examples.

## Testing

The project includes comprehensive unit tests covering:
- Valid XML validation
- Invalid XML detection
- Schema validation (file and string-based)
- Error message formatting
- Edge cases and null handling

Test results:
- **Total Tests**: 13
- **Passed**: 13
- **Failed**: 0
- **Coverage**: Core validation scenarios

## License

This project is part of the GYT Continental Bank integration initiative.
