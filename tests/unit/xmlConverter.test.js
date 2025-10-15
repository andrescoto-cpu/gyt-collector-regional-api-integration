const { parseXml, buildXml, xmlToJson, jsonToXml } = require('../../src/utils/xmlConverter');

describe('XML Converter Utils', () => {
  describe('parseXml', () => {
    it('should parse valid XML string to object', async () => {
      const xml = '<request><amount>100</amount><account>12345</account></request>';
      const result = await parseXml(xml);
      
      expect(result).toBeDefined();
      expect(result.request).toBeDefined();
      expect(result.request.amount).toBe('100');
      expect(result.request.account).toBe('12345');
    });

    it('should handle nested XML elements', async () => {
      const xml = '<request><customer><name>John Doe</name><id>123</id></customer></request>';
      const result = await parseXml(xml);
      
      expect(result.request.customer).toBeDefined();
      expect(result.request.customer.name).toBe('John Doe');
      expect(result.request.customer.id).toBe('123');
    });
  });

  describe('buildXml', () => {
    it('should build XML from object', () => {
      const obj = {
        status: 'success',
        transactionId: '123456'
      };
      
      const xml = buildXml(obj, 'response');
      
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<response>');
      expect(xml).toContain('<status>success</status>');
      expect(xml).toContain('<transactionId>123456</transactionId>');
      expect(xml).toContain('</response>');
    });
  });

  describe('xmlToJson', () => {
    it('should convert XML to JSON with correct structure', async () => {
      const xml = '<request><amount>100</amount><account>12345</account></request>';
      const json = await xmlToJson(xml);
      
      expect(json).toBeDefined();
      expect(json.transaction).toBeDefined();
      expect(json.timestamp).toBeDefined();
      expect(json.source).toBe('banco-gyt');
    });
  });

  describe('jsonToXml', () => {
    it('should convert JSON response to XML', () => {
      const json = {
        status: 'success',
        transactionId: '123456',
        message: 'Payment processed'
      };
      
      const xml = jsonToXml(json);
      
      expect(xml).toContain('<?xml');
      expect(xml).toContain('<response>');
      expect(xml).toContain('<status>success</status>');
      expect(xml).toContain('<transactionId>123456</transactionId>');
    });

    it('should include timestamp in XML response', () => {
      const json = { status: 'success' };
      const xml = jsonToXml(json);
      
      expect(xml).toContain('<timestamp>');
    });
  });
});
