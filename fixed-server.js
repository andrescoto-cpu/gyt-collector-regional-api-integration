const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const bodyParserXml = require('body-parser-xml');
const logger = require('./src/utils/logger');

// Configurar body-parser-xml
bodyParserXml(bodyParser);

const app = express();

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(bodyParser.json()); // JSON para todas las rutas

// Solo aplicar XML parser a rutas específicas
app.use('/api/collector/payment', (req, res, next) => {
    // Solo procesar XML para POST requests
    if (req.method === 'POST') {
        bodyParser.xml()(req, res, next);
    } else {
        next();
    }
});

// Rutas principales
app.get('/', (req, res) => {
    console.log('Procesando GET /');
    res.json({ 
        message: 'GYT Collector API está corriendo',
        status: 'OK',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            payment: '/api/collector/payment (POST)'
        }
    });
});

app.get('/health', (req, res) => {
    console.log('Procesando GET /health');
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Endpoint de payment (simplificado para evitar errores)
app.post('/api/collector/payment', (req, res) => {
    try {
        console.log('Procesando POST /api/collector/payment');
        console.log('Content-Type:', req.get('Content-Type'));
        
        // Respuesta mock por ahora
        const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<response>
    <status>success</status>
    <message>Payment processed successfully (MOCK)</message>
    <timestamp>${new Date().toISOString()}</timestamp>
</response>`;
        
        res.set('Content-Type', 'application/xml');
        res.status(200).send(mockResponse);
    } catch (error) {
        console.error('Error en payment endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handler mejorado
app.use((err, req, res, next) => {
    console.error('Error capturado en middleware:', err);
    logger.error(`Error in ${req.method} ${req.path}:`, err);
    
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: err?.message || 'Unknown error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`GYT Collector API running on port ${PORT}`);
    console.log(`Access at: https://glowing-space-meme-7v4p6wxjgx94fx49p-${PORT}.app.github.dev/`);
});