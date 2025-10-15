const akrosClient = require('../services/akrosClient');
const { xmlToJson, jsonToXml } = require('../utils/xmlConverter');
const logger = require('../utils/logger');

/**
 * Process payment request from Banco GYT
 * Workflow: XML -> JSON -> Akros API -> JSON -> XML
 */
async function processPayment(req, res) {
  try {
    const xmlRequest = req.body;
    
    logger.info('Received XML request from Banco GYT');
    logger.debug('XML content:', xmlRequest);

    // Step 1: Parse XML and convert to JSON
    const jsonPayload = await xmlToJson(xmlRequest);
    logger.info('Converted XML to JSON for Akros API');
    logger.debug('JSON payload:', jsonPayload);

    // Step 2: Call Akros API with OAuth 2.0
    const akrosResponse = await akrosClient.callApi(jsonPayload);
    logger.info('Received response from Akros API');
    logger.debug('Akros response:', akrosResponse);

    // Step 3: Convert Akros JSON response to XML
    const xmlResponse = jsonToXml(akrosResponse);
    logger.info('Converted Akros response to XML');
    logger.debug('XML response:', xmlResponse);

    // Step 4: Send XML response back to Banco GYT
    res.set('Content-Type', 'application/xml');
    res.status(200).send(xmlResponse);
    
    logger.info('Successfully processed payment request');
  } catch (error) {
    logger.error('Error processing payment:', error.message);
    
    // Send error response in XML format
    const errorXml = jsonToXml({
      status: 'error',
      message: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
    
    res.set('Content-Type', 'application/xml');
    res.status(500).send(errorXml);
  }
}

module.exports = {
  processPayment
};
