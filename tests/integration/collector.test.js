const request = require('supertest');
const express = require('express');
const collectorRouter = require('../../src/routes/collector');

// Mock the akrosClient
jest.mock('../../src/services/akrosClient', () => ({
  callApi: jest.fn()
}));

const akrosClient = require('../../src/services/akrosClient');

describe('Collector API Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.text({ type: 'application/xml' }));
    app.use('/api/collector', collectorRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/collector/payment', () => {
    it('should process XML request and return XML response', async () => {
      const xmlRequest = '<request><amount>100</amount><account>12345</account></request>';
      
      // Mock Akros API response
      akrosClient.callApi.mockResolvedValue({
        status: 'success',
        transactionId: 'TXN123456',
        message: 'Payment processed successfully'
      });

      const response = await request(app)
        .post('/api/collector/payment')
        .set('Content-Type', 'application/xml')
        .send(xmlRequest);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/xml');
      expect(response.text).toContain('<?xml');
      expect(response.text).toContain('<response>');
      expect(response.text).toContain('<status>success</status>');
      expect(akrosClient.callApi).toHaveBeenCalled();
    });

    it('should handle API errors and return error XML', async () => {
      const xmlRequest = '<request><amount>100</amount></request>';
      
      // Mock Akros API error
      akrosClient.callApi.mockRejectedValue(new Error('API connection failed'));

      const response = await request(app)
        .post('/api/collector/payment')
        .set('Content-Type', 'application/xml')
        .send(xmlRequest);

      expect(response.status).toBe(500);
      expect(response.headers['content-type']).toContain('application/xml');
      expect(response.text).toContain('<status>error</status>');
    });

    it('should convert XML to JSON and call Akros API', async () => {
      const xmlRequest = '<request><paymentId>PAY123</paymentId><amount>250</amount></request>';
      
      akrosClient.callApi.mockResolvedValue({
        status: 'approved',
        id: 'TXN789'
      });

      await request(app)
        .post('/api/collector/payment')
        .set('Content-Type', 'application/xml')
        .send(xmlRequest);

      expect(akrosClient.callApi).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.any(Object),
          timestamp: expect.any(String),
          source: 'banco-gyt'
        })
      );
    });
  });
});
