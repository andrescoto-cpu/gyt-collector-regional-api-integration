const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Variable para almacenar configuraciones por tipo de transacción
let transactionConfigs = {
    consulta: {
        xmlRequestTemplate: '',
        jsonRequestTemplate: '',
        jsonResponseTemplate: '',
        xmlResponseTemplate: '',
        requestMappings: [],
        responseMappings: []
    },
    pago: {
        xmlRequestTemplate: '',
        jsonRequestTemplate: '',
        jsonResponseTemplate: '',
        xmlResponseTemplate: '',
        requestMappings: [],
        responseMappings: []
    },
    reversa: {
        xmlRequestTemplate: '',
        jsonRequestTemplate: '',
        jsonResponseTemplate: '',
        xmlResponseTemplate: '',
        requestMappings: [],
        responseMappings: []
    }
};

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Middleware para parsear texto raw (que incluye XML)
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.json());

// Servir archivos estáticos del frontend
app.use('/admin', express.static('frontend'));

// Ruta principal
app.get('/', (req, res) => {
    res.json({ 
        message: 'GYT Collector API - Debug Version',
        status: 'OK',
        endpoints: {
            consulta: '/api/collector/consulta (POST con XML)',
            pago: '/api/collector/pago (POST con XML)',  
            reversa: '/api/collector/reversa (POST con XML)',
            payment: '/api/collector/payment (POST con XML - genérico)',
            admin: '/admin (Frontend de configuración)',
            config: '/api/config (GET/POST)',
            health: '/health'
        }
    });
});

// Ruta de salud
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
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
        
        // Conversión XML → JSON usando mapeos configurados
        console.log('\n🔄 --- CONVERSIÓN XML → JSON ---');
        
        try {
            const xmlContent = xmlData.trim();
            console.log('🔍 XML a procesar:', xmlContent);
            
            // Usar mapeos configurados para la conversión
            const jsonData = applyXmlToJsonMapping(xmlContent);
            
            console.log('📦 JSON resultante (con mapeos):', JSON.stringify(jsonData, null, 2));
            
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

// === ENDPOINTS ESPECÍFICOS POR TIPO DE TRANSACCIÓN ===

// Endpoint para CONSULTAS
app.post('/api/collector/consulta', async (req, res) => {
    await processTransaction(req, res, 'consulta');
});

// Endpoint para PAGOS
app.post('/api/collector/pago', async (req, res) => {
    await processTransaction(req, res, 'pago');
});

// Endpoint para REVERSAS
app.post('/api/collector/reversa', async (req, res) => {
    await processTransaction(req, res, 'reversa');
});

// Función genérica para procesar transacciones por tipo
async function processTransaction(req, res, transactionType) {
    try {
        console.log(`\n🔥 === PROCESAMIENTO ${transactionType.toUpperCase()} ===`);
        console.log('📅 Timestamp:', new Date().toISOString());
        console.log('📋 Content-Type:', req.get('Content-Type'));
        console.log('📏 Content-Length:', req.get('Content-Length'));
        
        // Log del XML recibido
        console.log('\n📄 --- XML RECIBIDO ---');
        console.log('🔧 Body type:', typeof req.body);
        console.log('📝 Raw body:', req.body);
        
        let xmlData = req.body;
        if (typeof xmlData === 'object') {
            console.log('Body es objeto, convirtiendo a string...');
            xmlData = JSON.stringify(xmlData);
        }
        
        console.log('📊 XML Length:', xmlData?.length || 0);
        
        // Validar que sea XML
        if (xmlData && xmlData.trim().startsWith('<')) {
            console.log('✅ Es XML válido');
            
            // Conversión XML → JSON usando mapeos específicos del tipo
            console.log(`\n🔄 --- CONVERSIÓN XML → JSON (${transactionType.toUpperCase()}) ---`);
            const xmlContent = xmlData.trim();
            const jsonData = applyXmlToJsonMapping(xmlContent, transactionType);
            
            console.log('📦 JSON resultante:', JSON.stringify(jsonData, null, 2));
            
            // Generar respuesta XML específica para el tipo
            console.log(`\n📤 --- RESPUESTA XML ${transactionType.toUpperCase()} ---`);
            
            // Mock de respuesta según el tipo de transacción
            const mockResponses = {
                consulta: {
                    success: true,
                    account: {
                        number: "1234567890",
                        type: "savings", 
                        status: "active",
                        balance: 1500.75,
                        currency: "GTQ"
                    },
                    customer: {
                        name: "Juan Pérez",
                        status: "active"
                    },
                    queryTime: new Date().toISOString()
                },
                pago: {
                    success: true,
                    transactionId: `TXN-${Date.now()}`,
                    status: "approved",
                    authorizationCode: `AUTH-${Math.floor(Math.random() * 10000)}`,
                    amount: jsonData.amount || 150.50,
                    currency: jsonData.currency || "GTQ",
                    processedAt: new Date().toISOString(),
                    reference: `REF-${Date.now()}`,
                    fees: 2.50
                },
                reversa: {
                    success: true,
                    reversalId: `REV-${Date.now()}`,
                    originalTransactionId: jsonData.originalTransaction?.transactionId || "TXN-12345",
                    status: "approved",
                    reversedAmount: jsonData.reversalAmount || 150.50,
                    currency: "GTQ", 
                    processedAt: new Date().toISOString(),
                    newBalance: 1351.25
                }
            };
            
            const responseData = mockResponses[transactionType];
            
            // Aplicar mapeo JSON → XML para la respuesta
            const responseXml = applyJsonToXmlMapping(responseData, transactionType);
            
            console.log('📋 Respuesta XML generada:', responseXml);
            console.log(`\n🏁 === FIN PROCESAMIENTO ${transactionType.toUpperCase()} EXITOSO ===\n`);
            
            res.set('Content-Type', 'application/xml');
            res.status(200).send(responseXml);
            
        } else {
            console.log('⚠️  No es XML válido o está vacío');
            console.log(`🏁 === FIN ${transactionType.toUpperCase()} - NO ES XML ===\n`);
            
            res.status(400).json({
                error: 'Invalid XML',
                message: 'Request body must be valid XML',
                transactionType: transactionType,
                received: xmlData
            });
        }
        
    } catch (error) {
        console.error(`\n❌ ERROR EN ${transactionType.toUpperCase()}:`);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.log(`=== FIN CON ERROR ${transactionType.toUpperCase()} ===\n`);
        
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            transactionType: transactionType,
            timestamp: new Date().toISOString()
        });
    }
}

// === ENDPOINTS DE CONFIGURACIÓN ===

// Obtener configuración actual
app.get('/api/config', (req, res) => {
    console.log('📄 Obteniendo configuraciones actuales');
    res.json({
        success: true,
        configurations: transactionConfigs,
        timestamp: new Date().toISOString()
    });
});

// Guardar nueva configuración
app.post('/api/config', (req, res) => {
    try {
        console.log('\n💾 === GUARDANDO CONFIGURACIONES ===');
        console.log('📋 Configuraciones recibidas:', JSON.stringify(req.body, null, 2));
        
        // El frontend enviará todas las configuraciones por tipo
        if (req.body.configurations) {
            transactionConfigs = {
                ...transactionConfigs,
                ...req.body.configurations
            };
        } else {
            // Backward compatibility - si viene una sola configuración
            const transactionType = req.body.transactionType || 'pago';
            transactionConfigs[transactionType] = {
                ...transactionConfigs[transactionType],
                ...req.body,
                lastUpdated: new Date().toISOString()
            };
        }
        
        console.log('✅ Configuraciones actualizadas exitosamente');
        Object.keys(transactionConfigs).forEach(type => {
            console.log(`📊 ${type}: ${transactionConfigs[type].requestMappings?.length || 0} request mappings, ${transactionConfigs[type].responseMappings?.length || 0} response mappings`);
        });
        console.log('💾 === FIN GUARDADO CONFIGURACIONES ===\n');
        
        res.json({
            success: true,
            message: 'Configuraciones actualizadas exitosamente',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error guardando configuraciones:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al guardar configuraciones',
            message: error.message
        });
    }
});

// Aplicar mapeo a XML usando la configuración del tipo específico
function applyXmlToJsonMapping(xmlData, transactionType = 'pago') {
    try {
        console.log(`\n🔄 === APLICANDO MAPEO XML → JSON (${transactionType.toUpperCase()}) ===`);
        console.log('📄 XML original:', xmlData);
        
        const config = transactionConfigs[transactionType];
        if (!config.requestMappings || config.requestMappings.length === 0) {
            console.log('⚠️  No hay mapeos configurados para', transactionType, ', usando conversión simple');
            return parseXmlSimple(xmlData);
        }
        
        const result = {};
        
        config.requestMappings.forEach(mapping => {
            if (mapping.xmlPath && mapping.jsonPath) {
                // Buscar valor en XML usando regex simple
                const regex = new RegExp(`<${mapping.xmlPath.split('.').pop()}>([^<]+)</${mapping.xmlPath.split('.').pop()}>`, 'i');
                const match = xmlData.match(regex);
                
                if (match) {
                    let value = match[1];
                    
                    // Convertir tipo si es necesario
                    switch (mapping.type) {
                        case 'number':
                            value = parseFloat(value) || 0;
                            break;
                        case 'boolean':
                            value = value.toLowerCase() === 'true';
                            break;
                        case 'date':
                            value = new Date(value).toISOString();
                            break;
                        default:
                            value = String(value);
                    }
                    
                    // Asignar al path JSON
                    setJsonPath(result, mapping.jsonPath, value);
                    console.log(`✅ Mapeado: ${mapping.xmlPath} → ${mapping.jsonPath} = ${value}`);
                } else {
                    console.log(`⚠️  No encontrado: ${mapping.xmlPath}`);
                }
            }
        });
        
        console.log('📦 JSON resultante:', JSON.stringify(result, null, 2));
        console.log(`🔄 === FIN MAPEO XML → JSON (${transactionType.toUpperCase()}) ===\n`);
        
        return result;
        
    } catch (error) {
        console.error('❌ Error en mapeo XML → JSON:', error.message);
        return parseXmlSimple(xmlData);
    }
}

// Función auxiliar para parseo simple
function parseXmlSimple(xmlData) {
    const result = {};
    const tagMatches = xmlData.match(/<(\w+)>([^<]+)<\/\1>/g) || [];
    
    tagMatches.forEach(tag => {
        const match = tag.match(/<(\w+)>([^<]+)<\/\1>/);
        if (match) {
            result[match[1]] = match[2];
        }
    });
    
    return result;
}

// Función auxiliar para establecer valor en path JSON anidado
function setJsonPath(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
}

// Aplicar mapeo JSON → XML para respuestas
function applyJsonToXmlMapping(jsonData, transactionType = 'pago') {
    try {
        console.log(`\n🔄 === APLICANDO MAPEO JSON → XML (${transactionType.toUpperCase()}) ===`);
        console.log('📦 JSON original:', JSON.stringify(jsonData, null, 2));
        
        const config = transactionConfigs[transactionType];
        
        // Si no hay template específico, usar respuesta genérica
        if (!config.xmlResponseTemplate) {
            console.log('⚠️  No hay template XML configurado, usando respuesta genérica');
            return generateGenericXmlResponse(jsonData, transactionType);
        }
        
        let xmlTemplate = config.xmlResponseTemplate;
        
        // Reemplazar placeholders en el template XML usando los mapeos
        if (config.responseMappings && config.responseMappings.length > 0) {
            config.responseMappings.forEach(mapping => {
                if (mapping.jsonPath && mapping.xmlPath) {
                    const value = getJsonValue(jsonData, mapping.jsonPath);
                    if (value !== undefined) {
                        const placeholder = `{${mapping.xmlPath}}`;
                        xmlTemplate = xmlTemplate.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
                        console.log(`✅ Mapeado: ${mapping.jsonPath} → ${mapping.xmlPath} = ${value}`);
                    } else {
                        console.log(`⚠️  Valor no encontrado: ${mapping.jsonPath}`);
                    }
                }
            });
        } else {
            // Auto-mapeo basado en nombres de campos
            xmlTemplate = autoMapJsonToXml(xmlTemplate, jsonData);
        }
        
        console.log('📄 XML resultante:', xmlTemplate);
        console.log(`🔄 === FIN MAPEO JSON → XML (${transactionType.toUpperCase()}) ===\n`);
        
        return xmlTemplate;
        
    } catch (error) {
        console.error(`❌ Error en mapeo JSON → XML (${transactionType}):`, error.message);
        return generateGenericXmlResponse(jsonData, transactionType);
    }
}

// Función auxiliar para obtener valor de path JSON
function getJsonValue(obj, path) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }
    
    return current;
}

// Auto-mapeo simple basado en nombres de campos
function autoMapJsonToXml(xmlTemplate, jsonData) {
    const flattenedJson = flattenObject(jsonData);
    
    Object.keys(flattenedJson).forEach(key => {
        const value = flattenedJson[key];
        const placeholder = `{${key}}`;
        xmlTemplate = xmlTemplate.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    return xmlTemplate;
}

// Función auxiliar para aplanar objeto JSON
function flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(flattened, flattenObject(obj[key], newKey));
        } else {
            flattened[newKey] = obj[key];
        }
    }
    
    return flattened;
}

// Generar respuesta XML genérica
function generateGenericXmlResponse(jsonData, transactionType) {
    const timestamp = new Date().toISOString();
    
    switch (transactionType) {
        case 'consulta':
            return `<?xml version="1.0" encoding="UTF-8"?>
<respuestaConsulta>
    <resultado>
        <exito>${jsonData.success || true}</exito>
        <timestamp>${timestamp}</timestamp>
        <datos>${JSON.stringify(jsonData).replace(/"/g, '&quot;')}</datos>
    </resultado>
</respuestaConsulta>`;
            
        case 'pago':
            return `<?xml version="1.0" encoding="UTF-8"?>
<respuestaPago>
    <resultado>
        <exito>${jsonData.success || true}</exito>
        <transaccionId>${jsonData.transactionId || 'TXN-' + Date.now()}</transaccionId>
        <estado>${jsonData.status || 'approved'}</estado>
        <timestamp>${timestamp}</timestamp>
    </resultado>
</respuestaPago>`;
            
        case 'reversa':
            return `<?xml version="1.0" encoding="UTF-8"?>
<respuestaReversa>
    <resultado>
        <exito>${jsonData.success || true}</exito>
        <reversaId>${jsonData.reversalId || 'REV-' + Date.now()}</reversaId>
        <estado>${jsonData.status || 'approved'}</estado>
        <timestamp>${timestamp}</timestamp>
    </resultado>
</respuestaReversa>`;
            
        default:
            return `<?xml version="1.0" encoding="UTF-8"?>
<response>
    <status>success</status>
    <timestamp>${timestamp}</timestamp>
    <data>${JSON.stringify(jsonData).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</data>
</response>`;
    }
}

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
    console.log(`🌐 Access at: https://glowing-space-meme-7v4p6wxjgx94fx49p-${PORT}.app.github.dev/`);
    console.log('📡 Ready to receive XML and show conversion logs!');
});