using System;
using System.IO;
using Xunit;
using GytCollectorRegionalApi.Services;

namespace GytCollectorRegionalApi.Tests
{
    /// <summary>
    /// Unit tests for XmlValidationService
    /// </summary>
    public class XmlValidationServiceTests
    {
        private readonly XmlValidationService _validationService;

        public XmlValidationServiceTests()
        {
            _validationService = new XmlValidationService();
        }

        [Fact]
        public void IsWellFormedXml_ValidXml_ReturnsTrue()
        {
            // Arrange
            string validXml = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                                <root>
                                    <element>value</element>
                                </root>";

            // Act
            bool result = _validationService.IsWellFormedXml(validXml);

            // Assert
            Assert.True(result);
            Assert.Empty(_validationService.GetValidationErrors());
        }

        [Fact]
        public void IsWellFormedXml_InvalidXml_ReturnsFalse()
        {
            // Arrange
            string invalidXml = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                                  <root>
                                      <element>value
                                  </root>";

            // Act
            bool result = _validationService.IsWellFormedXml(invalidXml);

            // Assert
            Assert.False(result);
            Assert.NotEmpty(_validationService.GetValidationErrors());
        }

        [Fact]
        public void IsWellFormedXml_NullContent_ReturnsFalse()
        {
            // Arrange
            string nullXml = null;

            // Act
            bool result = _validationService.IsWellFormedXml(nullXml);

            // Assert
            Assert.False(result);
            Assert.Contains(_validationService.GetValidationErrors(), 
                error => error.Contains("cannot be null or empty"));
        }

        [Fact]
        public void IsWellFormedXml_EmptyContent_ReturnsFalse()
        {
            // Arrange
            string emptyXml = "";

            // Act
            bool result = _validationService.IsWellFormedXml(emptyXml);

            // Assert
            Assert.False(result);
            Assert.Contains(_validationService.GetValidationErrors(), 
                error => error.Contains("cannot be null or empty"));
        }

        [Fact]
        public void ValidateAgainstSchemaContent_ValidXml_ReturnsTrue()
        {
            // Arrange
            string xsdSchema = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <xs:schema xmlns:xs=""http://www.w3.org/2001/XMLSchema"">
                    <xs:element name=""root"">
                        <xs:complexType>
                            <xs:sequence>
                                <xs:element name=""name"" type=""xs:string""/>
                                <xs:element name=""age"" type=""xs:int""/>
                            </xs:sequence>
                        </xs:complexType>
                    </xs:element>
                </xs:schema>";

            string validXml = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <root>
                    <name>John Doe</name>
                    <age>30</age>
                </root>";

            // Act
            bool result = _validationService.ValidateAgainstSchemaContent(validXml, xsdSchema);

            // Assert
            Assert.True(result);
            Assert.Empty(_validationService.GetValidationErrors());
        }

        [Fact]
        public void ValidateAgainstSchemaContent_InvalidXml_ReturnsFalse()
        {
            // Arrange
            string xsdSchema = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <xs:schema xmlns:xs=""http://www.w3.org/2001/XMLSchema"">
                    <xs:element name=""root"">
                        <xs:complexType>
                            <xs:sequence>
                                <xs:element name=""name"" type=""xs:string""/>
                                <xs:element name=""age"" type=""xs:int""/>
                            </xs:sequence>
                        </xs:complexType>
                    </xs:element>
                </xs:schema>";

            string invalidXml = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <root>
                    <name>John Doe</name>
                    <age>invalid</age>
                </root>";

            // Act
            bool result = _validationService.ValidateAgainstSchemaContent(invalidXml, xsdSchema);

            // Assert
            Assert.False(result);
            Assert.NotEmpty(_validationService.GetValidationErrors());
        }

        [Fact]
        public void ValidateAgainstSchemaContent_MissingRequiredElement_ReturnsFalse()
        {
            // Arrange
            string xsdSchema = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <xs:schema xmlns:xs=""http://www.w3.org/2001/XMLSchema"">
                    <xs:element name=""root"">
                        <xs:complexType>
                            <xs:sequence>
                                <xs:element name=""name"" type=""xs:string""/>
                                <xs:element name=""age"" type=""xs:int""/>
                            </xs:sequence>
                        </xs:complexType>
                    </xs:element>
                </xs:schema>";

            string invalidXml = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <root>
                    <name>John Doe</name>
                </root>";

            // Act
            bool result = _validationService.ValidateAgainstSchemaContent(invalidXml, xsdSchema);

            // Assert
            Assert.False(result);
            Assert.NotEmpty(_validationService.GetValidationErrors());
        }

        [Fact]
        public void GetFormattedErrors_WithErrors_ReturnsFormattedString()
        {
            // Arrange
            string invalidXml = @"<root><element>value</root>";

            // Act
            _validationService.IsWellFormedXml(invalidXml);
            string formattedErrors = _validationService.GetFormattedErrors();

            // Assert
            Assert.NotEmpty(formattedErrors);
            Assert.Contains("XML Validation Errors:", formattedErrors);
        }

        [Fact]
        public void GetFormattedErrors_NoErrors_ReturnsEmptyString()
        {
            // Arrange
            string validXml = @"<root><element>value</element></root>";

            // Act
            _validationService.IsWellFormedXml(validXml);
            string formattedErrors = _validationService.GetFormattedErrors();

            // Assert
            Assert.Empty(formattedErrors);
        }

        [Fact]
        public void ClearValidationMessages_RemovesAllErrorsAndWarnings()
        {
            // Arrange
            string invalidXml = @"<root><element>value</root>";
            _validationService.IsWellFormedXml(invalidXml);
            
            // Act
            _validationService.ClearValidationMessages();

            // Assert
            Assert.Empty(_validationService.GetValidationErrors());
            Assert.Empty(_validationService.GetValidationWarnings());
        }

        [Fact]
        public void ValidateAgainstSchema_FileNotFound_ReturnsFalse()
        {
            // Arrange
            string validXml = @"<root><element>value</element></root>";
            string nonExistentSchemaPath = "/path/that/does/not/exist.xsd";

            // Act
            bool result = _validationService.ValidateAgainstSchema(validXml, nonExistentSchemaPath);

            // Assert
            Assert.False(result);
            Assert.Contains(_validationService.GetValidationErrors(), 
                error => error.Contains("not found"));
        }

        [Fact]
        public void ValidateAgainstSchema_NullXmlContent_ReturnsFalse()
        {
            // Arrange
            string nullXml = null;
            string schemaPath = "schema.xsd";

            // Act
            bool result = _validationService.ValidateAgainstSchema(nullXml, schemaPath);

            // Assert
            Assert.False(result);
            Assert.Contains(_validationService.GetValidationErrors(), 
                error => error.Contains("cannot be null or empty"));
        }

        [Fact]
        public void ValidateAgainstSchemaContent_NullSchemaContent_ReturnsFalse()
        {
            // Arrange
            string validXml = @"<root><element>value</element></root>";
            string nullSchema = null;

            // Act
            bool result = _validationService.ValidateAgainstSchemaContent(validXml, nullSchema);

            // Assert
            Assert.False(result);
            Assert.Contains(_validationService.GetValidationErrors(), 
                error => error.Contains("cannot be null or empty"));
        }
    }
}
