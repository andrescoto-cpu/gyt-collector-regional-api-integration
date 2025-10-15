# Quick Start Guide - XML Validation Service

## For Developers

### Building the Project

```bash
# Build the entire solution
dotnet build GytCollectorRegionalApi.sln

# Build only the service
dotnet build src/GytCollectorRegionalApi.Services/GytCollectorRegionalApi.Services.csproj

# Build with Release configuration
dotnet build GytCollectorRegionalApi.sln --configuration Release
```

### Running Tests

```bash
# Run all tests
dotnet test

# Run tests with detailed output
dotnet test --verbosity detailed

# Run tests and generate coverage report
dotnet test --collect:"XPlat Code Coverage"

# Run specific test
dotnet test --filter "FullyQualifiedName~XmlValidationServiceTests.IsWellFormedXml_ValidXml_ReturnsTrue"
```

### Using in Your Project

**Option 1: Add Project Reference**
```bash
dotnet add reference path/to/GytCollectorRegionalApi.Services.csproj
```

**Option 2: Copy the Service Class**
Copy `XmlValidationService.cs` to your project and ensure you have the required using statements:
- `System.Xml`
- `System.Xml.Schema`
- `System.Xml.Linq`

### Common Use Cases

#### 1. Validate Bank Payment Request

```csharp
var validator = new XmlValidationService();

string paymentXml = File.ReadAllText("payment_request.xml");
string schemaPath = "schemas/payment_request.xsd";

if (!validator.ValidateAgainstSchema(paymentXml, schemaPath))
{
    Console.WriteLine("Validation failed:");
    Console.WriteLine(validator.GetFormattedErrors());
}
```

#### 2. Validate XML from API Response

```csharp
var validator = new XmlValidationService();

// Get XML from API
string responseXml = await httpClient.GetStringAsync(apiUrl);

// First check if it's well-formed
if (!validator.IsWellFormedXml(responseXml))
{
    throw new InvalidDataException($"Invalid XML: {validator.GetFormattedErrors()}");
}

// Then validate against schema
if (!validator.ValidateAgainstSchemaContent(responseXml, schemaString))
{
    throw new InvalidDataException($"Schema validation failed: {validator.GetFormattedErrors()}");
}
```

#### 3. Pre-flight Check Before Sending to Bank

```csharp
public bool ValidateBeforeSending(string xmlRequest)
{
    var validator = new XmlValidationService();
    
    // Check well-formedness
    if (!validator.IsWellFormedXml(xmlRequest))
    {
        LogError("XML is not well-formed", validator.GetValidationErrors());
        return false;
    }
    
    // Validate against GYT Bank schema
    if (!validator.ValidateAgainstSchema(xmlRequest, "schemas/gyt_bank_request.xsd"))
    {
        LogError("Schema validation failed", validator.GetValidationErrors());
        return false;
    }
    
    return true;
}
```

### Test Examples

The test project includes examples for:
- Valid XML validation ✓
- Invalid XML detection ✓
- Schema validation with valid data ✓
- Schema validation with invalid data ✓
- Missing required elements ✓
- Null/empty input handling ✓
- Error message formatting ✓

### Project Structure

```
GytCollectorRegionalApi/
├── src/
│   └── GytCollectorRegionalApi.Services/
│       ├── XmlValidationService.cs          # Main service class
│       └── GytCollectorRegionalApi.Services.csproj
│
├── tests/
│   └── GytCollectorRegionalApi.Tests/
│       ├── XmlValidationServiceTests.cs     # Unit tests
│       └── GytCollectorRegionalApi.Tests.csproj
│
└── examples/
    ├── valid_payment_request.xml            # Example valid XML
    ├── invalid_payment_request.xml          # Example invalid XML
    └── schemas/
        └── payment_request.xsd              # Example XSD schema
```

### API Reference

| Method | Description | Returns |
|--------|-------------|---------|
| `IsWellFormedXml(string)` | Checks XML well-formedness | `bool` |
| `ValidateAgainstSchema(string, string)` | Validates XML against schema file | `bool` |
| `ValidateAgainstSchemaContent(string, string)` | Validates XML against schema string | `bool` |
| `GetValidationErrors()` | Returns list of validation errors | `IReadOnlyList<string>` |
| `GetValidationWarnings()` | Returns list of validation warnings | `IReadOnlyList<string>` |
| `GetFormattedErrors()` | Returns formatted error string | `string` |
| `GetFormattedWarnings()` | Returns formatted warning string | `string` |
| `ClearValidationMessages()` | Clears all errors and warnings | `void` |

### Troubleshooting

**Problem**: "Schema file not found"
- **Solution**: Ensure the path is correct and the file exists. Use absolute paths or paths relative to the executable.

**Problem**: "XML is not well-formed"
- **Solution**: Check the XML for syntax errors (unclosed tags, invalid characters, etc.). Use the error message to identify the specific issue.

**Problem**: Tests are failing
- **Solution**: Ensure you have .NET 9.0 SDK installed. Run `dotnet --version` to check.

**Problem**: Build warnings about nullable types
- **Solution**: These warnings are expected for tests that intentionally test null inputs. They can be safely ignored.

### Integration with GYT Bank Web Service

1. **Incoming Requests**: Validate XML received from the bank
2. **Outgoing Requests**: Validate XML before sending to the bank
3. **Error Handling**: Use validation errors for detailed logging and debugging
4. **Compliance**: Ensure all communications meet the bank's XSD specifications

### Performance Considerations

- Schema validation is more expensive than well-formedness checking
- Cache XSD schemas when validating multiple documents
- Consider async validation for large XML documents
- Clear validation messages between validations to prevent memory leaks

### Next Steps

1. Review the [XmlValidationService.md](XmlValidationService.md) for detailed documentation
2. Explore the test cases in `XmlValidationServiceTests.cs` for more examples
3. Check the `examples/` folder for sample XML and XSD files
4. Integrate the service into your API integration code

## Support

For issues or questions, please refer to the project documentation or contact the development team.
