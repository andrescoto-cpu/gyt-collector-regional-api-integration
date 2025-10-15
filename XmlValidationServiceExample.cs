using System;
using System.IO;
using GytCollectorRegionalApi.Services;

namespace GytCollectorRegionalApi.Examples
{
    /// <summary>
    /// Example program demonstrating the usage of XmlValidationService
    /// </summary>
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== GYT Collector Regional API - XML Validation Service Demo ===\n");

            var validationService = new XmlValidationService();

            // Example 1: Well-formedness validation
            Console.WriteLine("Example 1: Well-formedness Validation");
            Console.WriteLine("--------------------------------------");
            DemonstrateWellFormednessValidation(validationService);
            Console.WriteLine();

            // Example 2: Schema validation with valid XML
            Console.WriteLine("Example 2: Schema Validation (Valid XML)");
            Console.WriteLine("----------------------------------------");
            DemonstrateSchemaValidationValid(validationService);
            Console.WriteLine();

            // Example 3: Schema validation with invalid XML
            Console.WriteLine("Example 3: Schema Validation (Invalid XML)");
            Console.WriteLine("------------------------------------------");
            DemonstrateSchemaValidationInvalid(validationService);
            Console.WriteLine();

            // Example 4: File-based validation
            Console.WriteLine("Example 4: File-based Validation");
            Console.WriteLine("--------------------------------");
            DemonstrateFileBased Validation(validationService);
            Console.WriteLine();

            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }

        static void DemonstrateWellFormednessValidation(XmlValidationService validator)
        {
            string validXml = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <root>
                    <element>value</element>
                </root>";

            string invalidXml = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <root>
                    <element>value
                </root>";

            Console.WriteLine("Testing valid XML:");
            bool isValid = validator.IsWellFormedXml(validXml);
            Console.WriteLine($"Result: {(isValid ? "VALID" : "INVALID")}");

            Console.WriteLine("\nTesting invalid XML:");
            validator.ClearValidationMessages();
            isValid = validator.IsWellFormedXml(invalidXml);
            Console.WriteLine($"Result: {(isValid ? "VALID" : "INVALID")}");
            if (!isValid)
            {
                Console.WriteLine("Errors:");
                Console.WriteLine(validator.GetFormattedErrors());
            }
        }

        static void DemonstrateSchemaValidationValid(XmlValidationService validator)
        {
            string xsdSchema = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <xs:schema xmlns:xs=""http://www.w3.org/2001/XMLSchema"">
                    <xs:element name=""payment"">
                        <xs:complexType>
                            <xs:sequence>
                                <xs:element name=""amount"" type=""xs:decimal""/>
                                <xs:element name=""currency"" type=""xs:string""/>
                                <xs:element name=""reference"" type=""xs:string""/>
                            </xs:sequence>
                        </xs:complexType>
                    </xs:element>
                </xs:schema>";

            string validXml = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <payment>
                    <amount>1500.50</amount>
                    <currency>GTQ</currency>
                    <reference>REF-001</reference>
                </payment>";

            validator.ClearValidationMessages();
            bool isValid = validator.ValidateAgainstSchemaContent(validXml, xsdSchema);
            Console.WriteLine($"Result: {(isValid ? "VALID" : "INVALID")}");
            
            if (isValid)
            {
                Console.WriteLine("XML conforms to the schema!");
            }
        }

        static void DemonstrateSchemaValidationInvalid(XmlValidationService validator)
        {
            string xsdSchema = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <xs:schema xmlns:xs=""http://www.w3.org/2001/XMLSchema"">
                    <xs:element name=""payment"">
                        <xs:complexType>
                            <xs:sequence>
                                <xs:element name=""amount"" type=""xs:decimal""/>
                                <xs:element name=""currency"" type=""xs:string""/>
                                <xs:element name=""reference"" type=""xs:string""/>
                            </xs:sequence>
                        </xs:complexType>
                    </xs:element>
                </xs:schema>";

            string invalidXml = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <payment>
                    <amount>invalid-amount</amount>
                    <currency>GTQ</currency>
                    <reference>REF-001</reference>
                </payment>";

            validator.ClearValidationMessages();
            bool isValid = validator.ValidateAgainstSchemaContent(invalidXml, xsdSchema);
            Console.WriteLine($"Result: {(isValid ? "VALID" : "INVALID")}");
            
            if (!isValid)
            {
                Console.WriteLine("Validation Errors:");
                foreach (var error in validator.GetValidationErrors())
                {
                    Console.WriteLine($"  - {error}");
                }
            }
        }

        static void DemonstrateFileBasedValidation(XmlValidationService validator)
        {
            string schemaPath = "examples/schemas/payment_request.xsd";
            string validXmlPath = "examples/valid_payment_request.xml";

            if (!File.Exists(schemaPath))
            {
                Console.WriteLine($"Schema file not found: {schemaPath}");
                Console.WriteLine("Skipping file-based validation example.");
                return;
            }

            if (!File.Exists(validXmlPath))
            {
                Console.WriteLine($"XML file not found: {validXmlPath}");
                Console.WriteLine("Skipping file-based validation example.");
                return;
            }

            string xmlContent = File.ReadAllText(validXmlPath);
            
            validator.ClearValidationMessages();
            bool isValid = validator.ValidateAgainstSchema(xmlContent, schemaPath);
            Console.WriteLine($"Validating: {validXmlPath}");
            Console.WriteLine($"Against schema: {schemaPath}");
            Console.WriteLine($"Result: {(isValid ? "VALID" : "INVALID")}");
            
            if (!isValid)
            {
                Console.WriteLine(validator.GetFormattedErrors());
            }
        }
    }
}
