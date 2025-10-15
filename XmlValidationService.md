# XML Validation Service

## Overview
The `XmlValidationService` is a C# service designed to validate XML documents for the GYT Collector Regional API integration with GYT Continental Bank Web Service. It provides comprehensive validation capabilities including well-formedness checking and XSD schema validation.

## Features

- **Well-formedness validation**: Checks if XML is properly formatted
- **XSD schema validation**: Validates XML against XSD schemas (from file or string)
- **Error reporting**: Collects and formats validation errors and warnings
- **Multiple validation modes**: Support for file-based and string-based schema validation

## Usage

### Basic Well-formedness Validation

```csharp
using GytCollectorRegionalApi.Services;

var validationService = new XmlValidationService();
string xmlContent = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                      <root>
                          <element>value</element>
                      </root>";

bool isValid = validationService.IsWellFormedXml(xmlContent);

if (!isValid)
{
    Console.WriteLine(validationService.GetFormattedErrors());
}
```

### Schema Validation from File

```csharp
var validationService = new XmlValidationService();
string xmlContent = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                      <payment>
                          <amount>1000.50</amount>
                          <currency>GTQ</currency>
                      </payment>";

bool isValid = validationService.ValidateAgainstSchema(xmlContent, "schemas/payment.xsd");

if (!isValid)
{
    foreach (var error in validationService.GetValidationErrors())
    {
        Console.WriteLine(error);
    }
}
```

### Schema Validation from String

```csharp
var validationService = new XmlValidationService();
string xsdSchema = @"<?xml version=""1.0"" encoding=""UTF-8""?>
    <xs:schema xmlns:xs=""http://www.w3.org/2001/XMLSchema"">
        <xs:element name=""payment"">
            <xs:complexType>
                <xs:sequence>
                    <xs:element name=""amount"" type=""xs:decimal""/>
                    <xs:element name=""currency"" type=""xs:string""/>
                </xs:sequence>
            </xs:complexType>
        </xs:element>
    </xs:schema>";

string xmlContent = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                      <payment>
                          <amount>1000.50</amount>
                          <currency>GTQ</currency>
                      </payment>";

bool isValid = validationService.ValidateAgainstSchemaContent(xmlContent, xsdSchema);
```

## API Reference

### Methods

#### `IsWellFormedXml(string xmlContent)`
Validates XML content for well-formedness.

**Parameters:**
- `xmlContent`: The XML content to validate

**Returns:** `true` if the XML is well-formed, `false` otherwise

#### `ValidateAgainstSchema(string xmlContent, string xsdSchemaPath)`
Validates XML content against an XSD schema file.

**Parameters:**
- `xmlContent`: The XML content to validate
- `xsdSchemaPath`: Path to the XSD schema file

**Returns:** `true` if validation succeeds, `false` otherwise

#### `ValidateAgainstSchemaContent(string xmlContent, string xsdSchemaContent)`
Validates XML content against an XSD schema provided as string.

**Parameters:**
- `xmlContent`: The XML content to validate
- `xsdSchemaContent`: The XSD schema content as string

**Returns:** `true` if validation succeeds, `false` otherwise

#### `GetValidationErrors()`
Gets all validation errors encountered during the last validation.

**Returns:** Read-only list of validation error messages

#### `GetValidationWarnings()`
Gets all validation warnings encountered during the last validation.

**Returns:** Read-only list of validation warning messages

#### `GetFormattedErrors()`
Gets a formatted string with all validation errors.

**Returns:** Formatted error message string

#### `GetFormattedWarnings()`
Gets a formatted string with all validation warnings.

**Returns:** Formatted warning message string

#### `ClearValidationMessages()`
Clears all validation errors and warnings.

## Integration with GYT Bank Web Service

This validation service is designed to work with the GYT Continental Bank Web Service integration for the Regional Collection API. It can be used to:

1. Validate incoming XML requests from the bank's web service
2. Validate outgoing XML responses before sending them to the bank
3. Ensure compliance with the bank's API specification
4. Provide detailed error reporting for troubleshooting

## Example: Bank Payment Request Validation

```csharp
public class BankPaymentValidator
{
    private readonly XmlValidationService _xmlValidator;
    private const string PaymentSchemaPath = "schemas/bank_payment_request.xsd";

    public BankPaymentValidator()
    {
        _xmlValidator = new XmlValidationService();
    }

    public (bool IsValid, string ErrorMessage) ValidatePaymentRequest(string xmlRequest)
    {
        // First check well-formedness
        if (!_xmlValidator.IsWellFormedXml(xmlRequest))
        {
            return (false, _xmlValidator.GetFormattedErrors());
        }

        // Then validate against schema
        if (!_xmlValidator.ValidateAgainstSchema(xmlRequest, PaymentSchemaPath))
        {
            return (false, _xmlValidator.GetFormattedErrors());
        }

        return (true, string.Empty);
    }
}
```

## Error Handling

The service provides comprehensive error handling and reporting:

- **Null or empty content**: Returns appropriate error messages
- **XML parsing errors**: Captures and reports parsing exceptions
- **Schema validation errors**: Collects all schema validation errors
- **File not found**: Reports when schema files are not found
- **Unexpected errors**: Catches and reports any unexpected exceptions

## Testing

The service includes comprehensive unit tests covering:
- Valid XML validation
- Invalid XML handling
- Schema validation (both valid and invalid cases)
- Error message formatting
- Edge cases (null, empty strings, missing files)

Run tests using:
```bash
dotnet test
```

## Requirements

- .NET Framework 4.5+ or .NET Core 2.0+
- System.Xml
- System.Xml.Linq
- System.Xml.Schema

## License

This component is part of the GYT Collector Regional API Integration project.
