const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const bodyParserXml = require('body-parser-xml');
const xml2js = require('xml2js');
const logger = require('./src/utils/logger');

// Configurar parsers XML
const parser = new xml2js.Parser({ explicitArray: false });
const builder = new xml2js.Builder();

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

// Endpoint de payment con logging detallado
app.post('/api/collector/payment', async (req, res) => {
    try {
        console.log('\n=== INICIO PROCESAMIENTO PAYMENT ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Content-Type:', req.get('Content-Type'));
        console.log('Content-Length:', req.get('Content-Length'));
        
        // Log del XML recibido
        console.log('\n--- XML RECIBIDO ---');
        console.log('Raw body type:', typeof req.body);
        console.log('Raw body:', req.body);
        
        // Verificar si es string o objeto
        let xmlData = req.body;
        if (typeof xmlData === 'object') {
            console.log('Body es objeto, convirtiendo a string...');
            xmlData = JSON.stringify(xmlData);
        }
        
        console.log('XML Data (string):', xmlData);
        console.log('XML Length:', xmlData?.length || 0);
        
        // Simulación de conversión XML a JSON
        console.log('\n--- CONVERSIÓN XML -> JSON ---');
        let jsonData;
        
        if (xmlData && xmlData.trim().startsWith('<')) {
            // Es XML válido, intentar parsear
            try {
                jsonData = await new Promise((resolve, reject) => {
                    parser.parseString(xmlData, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                
                console.log('✅ XML parseado exitosamente');
                console.log('JSON resultante:', JSON.stringify(jsonData, null, 2));
            } catch (parseError) {
                console.error('❌ Error parseando XML:', parseError.message);
                jsonData = { error: 'Invalid XML format', raw: xmlData };
            }
        } else {
            console.log('⚠️  No es XML válido, tratando como datos simples');
            jsonData = { rawData: xmlData, note: 'Not valid XML' };
        }
        
        // Log del procesamiento
        console.log('\n--- PROCESAMIENTO JSON ---');
        console.log('Datos procesados:', JSON.stringify(jsonData, null, 2));
        
        // Generar respuesta XML
        console.log('\n--- GENERANDO RESPUESTA XML ---');
        const responseData = {
            response: {
                status: 'success',
                message: 'Payment processed successfully',
                timestamp: new Date().toISOString(),
                processedData: jsonData
            }
        };
        
        const responseXml = builder.buildObject(responseData);
        
        console.log('Respuesta XML generada:');
        console.log(responseXml);
        console.log('\n=== FIN PROCESAMIENTO PAYMENT ===\n');
        
        res.set('Content-Type', 'application/xml');
        res.status(200).send(responseXml);
        
    } catch (error) {
        console.error('\n❌ ERROR EN PAYMENT ENDPOINT:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.log('=== FIN CON ERROR ===\n');
        
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
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