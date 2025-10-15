const xml2js = require('xml2js');

/**
 * Parse XML string to JavaScript object
 * @param {string} xml - XML string to parse
 * @returns {Promise<object>} Parsed JavaScript object
 */
async function parseXml(xml) {
  const parser = new xml2js.Parser({ 
    explicitArray: false,
    ignoreAttrs: false,
    mergeAttrs: true
  });
  
  return await parser.parseStringPromise(xml);
}

/**
 * Convert JavaScript object to XML string
 * @param {object} obj - JavaScript object to convert
 * @param {string} rootName - Name of the root XML element
 * @returns {string} XML string
 */
function buildXml(obj, rootName = 'response') {
  const builder = new xml2js.Builder({
    rootName: rootName,
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  });
  
  return builder.buildObject(obj);
}

/**
 * Convert XML to JSON format suitable for Akros API
 * @param {string} xml - XML string from Banco GYT
 * @returns {Promise<object>} JSON object for Akros API
 */
async function xmlToJson(xml) {
  const parsed = await parseXml(xml);
  
  // Extract relevant data and transform to Akros API format
  // This structure should be adjusted based on actual API requirements
  const jsonPayload = {
    transaction: parsed.request || parsed,
    timestamp: new Date().toISOString(),
    source: 'banco-gyt'
  };
  
  return jsonPayload;
}

/**
 * Convert JSON response from Akros to XML format for Banco GYT
 * @param {object} json - JSON response from Akros API
 * @returns {string} XML string for Banco GYT
 */
function jsonToXml(json) {
  // Transform the response to the expected XML structure
  const xmlStructure = {
    status: json.status || 'success',
    transactionId: json.transactionId || json.id,
    message: json.message || 'Transaction processed',
    data: json.data || json,
    timestamp: new Date().toISOString()
  };
  
  return buildXml(xmlStructure, 'response');
}

module.exports = {
  parseXml,
  buildXml,
  xmlToJson,
  jsonToXml
};
