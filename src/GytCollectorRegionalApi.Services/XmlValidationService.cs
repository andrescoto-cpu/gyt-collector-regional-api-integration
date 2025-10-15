using System;
using System.IO;
using System.Xml;
using System.Xml.Schema;
using System.Xml.Linq;
using System.Collections.Generic;
using System.Text;

namespace GytCollectorRegionalApi.Services
{
    /// <summary>
    /// Service for validating XML documents against XSD schemas
    /// Used for validating requests and responses from GYT Continental Bank Web Service
    /// </summary>
    public class XmlValidationService
    {
        private readonly List<string> _validationErrors;
        private readonly List<string> _validationWarnings;

        public XmlValidationService()
        {
            _validationErrors = new List<string>();
            _validationWarnings = new List<string>();
        }

        /// <summary>
        /// Validates XML content for well-formedness
        /// </summary>
        /// <param name="xmlContent">The XML content to validate</param>
        /// <returns>True if the XML is well-formed, false otherwise</returns>
        public bool IsWellFormedXml(string xmlContent)
        {
            if (string.IsNullOrWhiteSpace(xmlContent))
            {
                _validationErrors.Add("XML content cannot be null or empty");
                return false;
            }

            try
            {
                XDocument.Parse(xmlContent);
                return true;
            }
            catch (XmlException ex)
            {
                _validationErrors.Add($"XML is not well-formed: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Validates XML content against an XSD schema
        /// </summary>
        /// <param name="xmlContent">The XML content to validate</param>
        /// <param name="xsdSchemaPath">Path to the XSD schema file</param>
        /// <returns>True if validation succeeds, false otherwise</returns>
        public bool ValidateAgainstSchema(string xmlContent, string xsdSchemaPath)
        {
            _validationErrors.Clear();
            _validationWarnings.Clear();

            if (string.IsNullOrWhiteSpace(xmlContent))
            {
                _validationErrors.Add("XML content cannot be null or empty");
                return false;
            }

            if (string.IsNullOrWhiteSpace(xsdSchemaPath))
            {
                _validationErrors.Add("XSD schema path cannot be null or empty");
                return false;
            }

            if (!File.Exists(xsdSchemaPath))
            {
                _validationErrors.Add($"XSD schema file not found: {xsdSchemaPath}");
                return false;
            }

            try
            {
                XmlSchemaSet schemas = new XmlSchemaSet();
                schemas.Add(null, xsdSchemaPath);

                XDocument document = XDocument.Parse(xmlContent);
                
                document.Validate(schemas, (sender, e) =>
                {
                    if (e.Severity == XmlSeverityType.Error)
                    {
                        _validationErrors.Add(e.Message);
                    }
                    else if (e.Severity == XmlSeverityType.Warning)
                    {
                        _validationWarnings.Add(e.Message);
                    }
                });

                return _validationErrors.Count == 0;
            }
            catch (XmlSchemaException ex)
            {
                _validationErrors.Add($"Schema validation error: {ex.Message}");
                return false;
            }
            catch (XmlException ex)
            {
                _validationErrors.Add($"XML parsing error: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                _validationErrors.Add($"Unexpected error during validation: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Validates XML content against an XSD schema provided as string
        /// </summary>
        /// <param name="xmlContent">The XML content to validate</param>
        /// <param name="xsdSchemaContent">The XSD schema content as string</param>
        /// <returns>True if validation succeeds, false otherwise</returns>
        public bool ValidateAgainstSchemaContent(string xmlContent, string xsdSchemaContent)
        {
            _validationErrors.Clear();
            _validationWarnings.Clear();

            if (string.IsNullOrWhiteSpace(xmlContent))
            {
                _validationErrors.Add("XML content cannot be null or empty");
                return false;
            }

            if (string.IsNullOrWhiteSpace(xsdSchemaContent))
            {
                _validationErrors.Add("XSD schema content cannot be null or empty");
                return false;
            }

            try
            {
                XmlSchemaSet schemas = new XmlSchemaSet();
                
                using (StringReader schemaReader = new StringReader(xsdSchemaContent))
                using (XmlReader xmlSchemaReader = XmlReader.Create(schemaReader))
                {
                    schemas.Add(null, xmlSchemaReader);
                }

                XDocument document = XDocument.Parse(xmlContent);
                
                document.Validate(schemas, (sender, e) =>
                {
                    if (e.Severity == XmlSeverityType.Error)
                    {
                        _validationErrors.Add(e.Message);
                    }
                    else if (e.Severity == XmlSeverityType.Warning)
                    {
                        _validationWarnings.Add(e.Message);
                    }
                });

                return _validationErrors.Count == 0;
            }
            catch (XmlSchemaException ex)
            {
                _validationErrors.Add($"Schema validation error: {ex.Message}");
                return false;
            }
            catch (XmlException ex)
            {
                _validationErrors.Add($"XML parsing error: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                _validationErrors.Add($"Unexpected error during validation: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Gets all validation errors encountered during the last validation
        /// </summary>
        /// <returns>List of validation error messages</returns>
        public IReadOnlyList<string> GetValidationErrors()
        {
            return _validationErrors.AsReadOnly();
        }

        /// <summary>
        /// Gets all validation warnings encountered during the last validation
        /// </summary>
        /// <returns>List of validation warning messages</returns>
        public IReadOnlyList<string> GetValidationWarnings()
        {
            return _validationWarnings.AsReadOnly();
        }

        /// <summary>
        /// Gets a formatted string with all validation errors
        /// </summary>
        /// <returns>Formatted error message string</returns>
        public string GetFormattedErrors()
        {
            if (_validationErrors.Count == 0)
                return string.Empty;

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("XML Validation Errors:");
            for (int i = 0; i < _validationErrors.Count; i++)
            {
                sb.AppendLine($"{i + 1}. {_validationErrors[i]}");
            }
            return sb.ToString();
        }

        /// <summary>
        /// Gets a formatted string with all validation warnings
        /// </summary>
        /// <returns>Formatted warning message string</returns>
        public string GetFormattedWarnings()
        {
            if (_validationWarnings.Count == 0)
                return string.Empty;

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("XML Validation Warnings:");
            for (int i = 0; i < _validationWarnings.Count; i++)
            {
                sb.AppendLine($"{i + 1}. {_validationWarnings[i]}");
            }
            return sb.ToString();
        }

        /// <summary>
        /// Clears all validation errors and warnings
        /// </summary>
        public void ClearValidationMessages()
        {
            _validationErrors.Clear();
            _validationWarnings.Clear();
        }
    }
}
