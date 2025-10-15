const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Middleware para parsear texto raw (que incluye XML)
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.json());

// Ruta principal
app.get('/', (req, res) => {
    res.json({ 
        message: 'GYT Collector API - Debug Version',
        status: 'OK',
        endpoint: '/api/collector/payment (POST con XML)'
    });
});

// Endpoint de payment con logs detallados
app.post('/api/collector/payment', (req, res) => {
    console.log('\n🔥 === INICIO PROCESAMIENTO PAYMENT ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📋 Content-Type:', req.get('Content-Type'));
    console.log('📏 Content-Length:', req.get('Content-Length'));
    
    // Log del XML recibido
    console.log('\n📄 --- XML RECIBIDO ---');
    console.log('🔧 Body type:', typeof req.body);
    console.log('📝 Raw body:', req.body);
    console.log('📊 Body length:', req.body?.length || 0);
    
    let xmlData = req.body;
    
    // Validar que sea XML
    if (typeof xmlData === 'string' && xmlData.trim().startsWith('<')) {
        console.log('✅ Es XML válido');
        
        // Simulación de conversión XML → JSON usando regex simple
        console.log('\n🔄 --- CONVERSIÓN XML → JSON ---');
        
        try {
            // Parse simple de XML para demo (solo para logging)
            const xmlContent = xmlData.trim();
            console.log('🔍 XML a procesar:', xmlContent);
            
            // Extraer algunos elementos básicos para mostrar el proceso
            const tagMatches = xmlContent.match(/<(\w+)>([^<]+)<\/\1>/g) || [];
            console.log('🏷️  Tags encontrados:', tagMatches);
            
            // Crear un objeto JSON simple basado en los tags
            const jsonData = {};
            tagMatches.forEach(tag => {
                const match = tag.match(/<(\w+)>([^<]+)<\/\1>/);
                if (match) {
                    jsonData[match[1]] = match[2];
                }
            });
            
            console.log('📦 JSON resultante (simple):', JSON.stringify(jsonData, null, 2));
            
            // Respuesta
            const response = `<?xml version="1.0" encoding="UTF-8"?>
<response>
    <status>success</status>
    <message>Payment processed successfully</message>
    <timestamp>${new Date().toISOString()}</timestamp>
    <originalXml>${xmlContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</originalXml>
    <processedJson>${JSON.stringify(jsonData).replace(/"/g, '&quot;')}</processedJson>
</response>`;
            
            console.log('\n📤 --- RESPUESTA XML GENERADA ---');
            console.log('📋 Respuesta:', response);
            console.log('🏁 === FIN PROCESAMIENTO EXITOSO ===\n');
            
            res.set('Content-Type', 'application/xml');
            res.status(200).send(response);
            
        } catch (error) {
            console.error('❌ Error procesando XML:', error.message);
            console.log('🏁 === FIN CON ERROR ===\n');
            
            res.status(500).json({
                error: 'Error processing XML',
                message: error.message
            });
        }
        
    } else {
        console.log('⚠️  No es XML válido o está vacío');
        console.log('🏁 === FIN - NO ES XML ===\n');
        
        res.status(400).json({
            error: 'Invalid XML',
            message: 'Request body must be valid XML',
            received: xmlData
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
    console.log(`🌐 Access at: https://glowing-space-meme-7v4p6wxjgx94fx49p-${PORT}.app.github.dev/`);
    console.log('📡 Ready to receive XML and show conversion logs!');
});