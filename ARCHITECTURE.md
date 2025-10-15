# Architecture Overview

## System Architecture

```
┌─────────────────┐
│   Banco GYT     │
│   Continental   │
└────────┬────────┘
         │ POST XML
         │ HTTPS/443
         ▼
┌─────────────────────────────────────────────────┐
│     GYT Collector Web Service                   │
│  ┌───────────────────────────────────────────┐  │
│  │         Express.js Server                 │  │
│  │         (HTTPS Port 443)                  │  │
│  └───────────────┬───────────────────────────┘  │
│                  │                               │
│  ┌───────────────▼───────────────────────────┐  │
│  │    XML Parser Middleware                  │  │
│  │    (xml2js)                               │  │
│  └───────────────┬───────────────────────────┘  │
│                  │                               │
│  ┌───────────────▼───────────────────────────┐  │
│  │    Collector Controller                   │  │
│  │    - Process Payment                      │  │
│  │    - XML → JSON Conversion                │  │
│  │    - JSON → XML Conversion                │  │
│  └───────────────┬───────────────────────────┘  │
│                  │                               │
│  ┌───────────────▼───────────────────────────┐  │
│  │    Akros API Client                       │  │
│  │    - OAuth 2.0 Authentication             │  │
│  │    - Token Management                     │  │
│  │    - API Communication                    │  │
│  └───────────────┬───────────────────────────┘  │
└──────────────────┼───────────────────────────────┘
                   │ POST JSON
                   │ HTTPS + OAuth 2.0
                   ▼
         ┌─────────────────┐
         │   Akros API     │
         │   (External)    │
         └─────────────────┘
```

## Component Details

### 1. Express.js Server
- **Technology**: Node.js, Express.js
- **Port**: 443 (HTTPS)
- **Security**: Helmet.js, CORS
- **Purpose**: HTTP server handling incoming requests

### 2. XML Parser Middleware
- **Technology**: xml2js
- **Purpose**: Parse incoming XML from Banco GYT
- **Features**:
  - Automatic XML parsing
  - Error handling for invalid XML
  - UTF-8 encoding support

### 3. Collector Controller
- **File**: `src/controllers/collectorController.js`
- **Responsibilities**:
  - Receive XML requests
  - Orchestrate XML→JSON conversion
  - Call Akros API
  - Convert JSON→XML for response
  - Error handling

### 4. XML Converter Utilities
- **File**: `src/utils/xmlConverter.js`
- **Functions**:
  - `parseXml()`: Parse XML string to object
  - `buildXml()`: Build XML from object
  - `xmlToJson()`: Convert XML to Akros API format
  - `jsonToXml()`: Convert Akros response to XML

### 5. Akros API Client
- **File**: `src/services/akrosClient.js`
- **Features**:
  - OAuth 2.0 authentication
  - Automatic token refresh
  - Token caching
  - API error handling
- **Technology**: Axios

### 6. Logger
- **File**: `src/utils/logger.js`
- **Technology**: Winston
- **Features**:
  - File logging (error.log, combined.log)
  - Console logging (development)
  - JSON format
  - Log levels: error, warn, info, debug

### 7. Error Handler
- **File**: `src/middleware/errorHandler.js`
- **Purpose**: Global error handling middleware
- **Features**:
  - Log all errors
  - Return standardized error responses
  - XML error format for API errors

## Data Flow

### Request Flow (Banco GYT → Akros)

```
1. Banco GYT sends XML POST to /api/collector/payment
   ↓
2. Express server receives request
   ↓
3. XML parser middleware parses XML to object
   ↓
4. Collector controller receives parsed XML
   ↓
5. xmlConverter.xmlToJson() converts to JSON
   ↓
6. Akros client checks OAuth token (refresh if needed)
   ↓
7. Akros client sends JSON to Akros API
   ↓
8. Akros API processes and returns JSON
```

### Response Flow (Akros → Banco GYT)

```
1. Akros client receives JSON response
   ↓
2. Collector controller receives JSON
   ↓
3. xmlConverter.jsonToXml() converts to XML
   ↓
4. Express sends XML response to Banco GYT
   ↓
5. Transaction complete
```

## OAuth 2.0 Flow

```
┌─────────────────────────────────────────────┐
│  First Request or Token Expired             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  POST to AKROS_TOKEN_URL                    │
│  Body: {                                    │
│    grant_type: "client_credentials",        │
│    client_id: AKROS_CLIENT_ID,              │
│    client_secret: AKROS_CLIENT_SECRET       │
│  }                                          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Receive access_token and expires_in        │
│  Cache token with expiry time              │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Use token for all subsequent API calls     │
│  Header: Authorization: Bearer <token>      │
└─────────────────────────────────────────────┘
```

## Security Layers

1. **Transport Security**
   - HTTPS/TLS encryption
   - Valid SSL certificates

2. **Application Security**
   - Helmet.js security headers
   - CORS configuration
   - Input validation

3. **Authentication**
   - OAuth 2.0 with Akros API
   - Secure credential storage (environment variables)

4. **Logging & Monitoring**
   - All transactions logged
   - Error tracking
   - Health check endpoint

## Scalability

### Horizontal Scaling
- Stateless design allows multiple instances
- Load balancer distribution
- Shared nothing architecture

### Vertical Scaling
- Node.js single-threaded but non-blocking I/O
- Can handle many concurrent connections
- Memory and CPU can be increased as needed

## Error Handling Strategy

1. **Invalid XML Input**
   - Return 400 Bad Request with error XML
   - Log the invalid input

2. **Akros API Errors**
   - Return 500 Internal Server Error with error XML
   - Log full error details
   - Include error message in response

3. **Network Errors**
   - Retry logic (future enhancement)
   - Return 503 Service Unavailable
   - Alert monitoring system

4. **OAuth Errors**
   - Automatic token refresh
   - If refresh fails, return 500 error
   - Log authentication failures

## Performance Considerations

- **Token Caching**: OAuth tokens are cached to avoid unnecessary auth requests
- **Async/Await**: All I/O operations are asynchronous
- **Connection Pooling**: HTTP client reuses connections
- **Minimal Dependencies**: Only essential packages included

## Monitoring Points

1. **Health Check**: `/health` endpoint
2. **Response Times**: Log processing duration
3. **Error Rates**: Track failed requests
4. **Token Refresh**: Monitor OAuth token operations
5. **API Availability**: Track Akros API uptime

## Configuration Management

All configuration is managed through environment variables:

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port
- `AKROS_*`: Akros API configuration
- `SSL_*`: SSL certificate paths
- `LOG_LEVEL`: Logging verbosity

## Testing Strategy

### Unit Tests
- XML conversion utilities
- Individual function testing
- Mock external dependencies

### Integration Tests
- Full request/response cycle
- Mock Akros API
- Validate XML/JSON conversion
- Error handling scenarios

### Load Testing (Future)
- Concurrent request handling
- Memory leak detection
- Performance benchmarking
