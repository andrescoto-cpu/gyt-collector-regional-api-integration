# API Documentation

## Overview

This API serves as a middleware between Banco GYT Continental and Akros API, handling XML to JSON conversion and OAuth 2.0 authentication.

## Base URL

```
https://your-domain.com/api/collector
```

## Authentication

The service handles OAuth 2.0 authentication with Akros API internally. No authentication is required from Banco GYT.

## Endpoints

### Process Payment

Process a payment request from Banco GYT.

**Endpoint:** `POST /payment`

**Content-Type:** `application/xml`

**Request Body:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<request>
  <transactionId>TXN001</transactionId>
  <amount>100.00</amount>
  <currency>GTQ</currency>
  <account>12345678</account>
  <customerName>John Doe</customerName>
  <reference>REF123456</reference>
  <timestamp>2025-10-15T18:45:00Z</timestamp>
</request>
```

**Success Response:**

**Status Code:** `200 OK`

**Content-Type:** `application/xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>success</status>
  <transactionId>TXN123456789</transactionId>
  <message>Transaction processed successfully</message>
  <data>
    <approvalCode>APP001</approvalCode>
    <referenceNumber>REF789</referenceNumber>
  </data>
  <timestamp>2025-10-15T18:45:30.000Z</timestamp>
</response>
```

**Error Response:**

**Status Code:** `500 Internal Server Error`

**Content-Type:** `application/xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>error</status>
  <message>Error description</message>
  <timestamp>2025-10-15T18:45:30.000Z</timestamp>
</response>
```

### Health Check

Check service health status.

**Endpoint:** `GET /health`

**Success Response:**

**Status Code:** `200 OK`

**Content-Type:** `application/json`

```json
{
  "status": "OK",
  "timestamp": "2025-10-15T18:45:00.000Z"
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid XML format |
| 500 | Internal Server Error - Processing error or Akros API error |
| 503 | Service Unavailable - Unable to connect to Akros API |

## Data Flow

1. Banco GYT sends XML POST request
2. Service parses XML
3. Service converts XML to JSON
4. Service authenticates with Akros API (OAuth 2.0)
5. Service sends JSON to Akros API
6. Service receives JSON response from Akros
7. Service converts JSON to XML
8. Service returns XML to Banco GYT

## Rate Limiting

Currently no rate limiting is implemented. This should be added based on Akros API limitations.

## Security

- All production traffic must use HTTPS
- Akros API credentials are stored securely in environment variables
- OAuth 2.0 tokens are cached and refreshed automatically

## Support

For issues or questions, contact the development team.
