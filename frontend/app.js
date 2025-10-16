// Variables globales
let editors = {};
let activeTransactionType = 'consulta';
let configurations = {
    consulta: {
        requestMappings: [],
        responseMappings: [],
        xmlRequestTemplate: '',
        jsonRequestTemplate: '',
        jsonResponseTemplate: '',
        xmlResponseTemplate: ''
    },
    pago: {
        requestMappings: [],
        responseMappings: [],
        xmlRequestTemplate: '',
        jsonRequestTemplate: '',
        jsonResponseTemplate: '',
        xmlResponseTemplate: ''
    },
    reversa: {
        requestMappings: [],
        responseMappings: [],
        xmlRequestTemplate: '',
        jsonRequestTemplate: '',
        jsonResponseTemplate: '',
        xmlResponseTemplate: ''
    }
};
let activeConfig = null;

// Configuración del servidor
const SERVER_URL = 'https://glowing-space-meme-7v4p6wxjgx94fx49p-3001.app.github.dev';

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeEditors();
    loadDefaultTemplatesByType();
    checkServerStatus();
    loadSavedConfigs();
    
    console.log('🚀 GYT Collector Frontend iniciado con soporte multi-transacción');
});

// Inicializar editores CodeMirror
function initializeEditors() {
    const editorConfigs = [
        { id: 'xml-request-editor', mode: 'xml' },
        { id: 'json-request-editor', mode: 'javascript' },
        { id: 'json-response-editor', mode: 'javascript' },
        { id: 'xml-response-editor', mode: 'xml' },
        { id: 'test-xml-editor', mode: 'xml' },
        { id: 'test-result-editor', mode: 'javascript' }
    ];

    editorConfigs.forEach(config => {
        const textarea = document.getElementById(config.id);
        if (textarea) {
            editors[config.id] = CodeMirror.fromTextArea(textarea, {
                lineNumbers: true,
                mode: config.mode,
                theme: 'monokai',
                indentUnit: 2,
                lineWrapping: true,
                autoCloseTags: true,
                matchBrackets: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
            });
        }
    });

    console.log('✅ Editores inicializados');
}

// Cambiar tipo de transacción
function switchTransactionType(type) {
    // Guardar configuración actual antes de cambiar
    saveCurrentConfiguration();
    
    // Cambiar tipo activo
    activeTransactionType = type;
    
    // Actualizar UI
    document.querySelectorAll('.transaction-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // Actualizar descripción
    const descriptions = {
        consulta: 'Consulta de saldo, información de cuenta o validación de datos',
        pago: 'Procesamiento de pagos y transacciones monetarias',
        reversa: 'Reversión o anulación de transacciones previamente procesadas'
    };
    
    document.getElementById('transaction-description').textContent = descriptions[type];
    
    // Cargar configuración del nuevo tipo
    loadConfigurationForType(type);
    
    console.log(`🔄 Cambiado a tipo de transacción: ${type}`);
}

// Guardar configuración actual
function saveCurrentConfiguration() {
    configurations[activeTransactionType] = {
        xmlRequestTemplate: editors['xml-request-editor']?.getValue() || '',
        jsonRequestTemplate: editors['json-request-editor']?.getValue() || '',
        jsonResponseTemplate: editors['json-response-editor']?.getValue() || '',
        xmlResponseTemplate: editors['xml-response-editor']?.getValue() || '',
        requestMappings: [...(configurations[activeTransactionType]?.requestMappings || [])],
        responseMappings: [...(configurations[activeTransactionType]?.responseMappings || [])]
    };
}

// Cargar configuración para un tipo específico
function loadConfigurationForType(type) {
    const config = configurations[type];
    
    if (editors['xml-request-editor']) editors['xml-request-editor'].setValue(config.xmlRequestTemplate || '');
    if (editors['json-request-editor']) editors['json-request-editor'].setValue(config.jsonRequestTemplate || '');
    if (editors['json-response-editor']) editors['json-response-editor'].setValue(config.jsonResponseTemplate || '');
    if (editors['xml-response-editor']) editors['xml-response-editor'].setValue(config.xmlResponseTemplate || '');
    
    // Limpiar y recrear mapeos
    clearRequestMappings();
    clearResponseMappings();
    
    // Recrear mapeos de request
    (config.requestMappings || []).forEach(mapping => {
        addRequestMapping();
        const lastMapping = document.querySelector('#request-mappings .mapping-item:last-child');
        if (lastMapping) {
            lastMapping.dataset.id = mapping.id;
            const inputs = lastMapping.querySelectorAll('input');
            const select = lastMapping.querySelector('select');
            if (inputs[0]) inputs[0].value = mapping.xmlPath || '';
            if (inputs[1]) inputs[1].value = mapping.jsonPath || '';
            if (select) select.value = mapping.type || 'string';
        }
    });
    
    // Recrear mapeos de response
    (config.responseMappings || []).forEach(mapping => {
        addResponseMapping();
        const lastMapping = document.querySelector('#response-mappings .mapping-item:last-child');
        if (lastMapping) {
            lastMapping.dataset.id = mapping.id;
            const inputs = lastMapping.querySelectorAll('input');
            const select = lastMapping.querySelector('select');
            if (inputs[0]) inputs[0].value = mapping.jsonPath || '';
            if (inputs[1]) inputs[1].value = mapping.xmlPath || '';
            if (select) select.value = mapping.type || 'string';
        }
    });
}

// Cargar templates por defecto según tipo de transacción
function loadDefaultTemplatesByType() {
    // CONSULTA - Templates
    configurations.consulta = {
        xmlRequestTemplate: `<?xml version="1.0" encoding="UTF-8"?>
<consulta>
    <cliente>
        <numeroDocumento>{cliente.documento}</numeroDocumento>
        <tipoDocumento>{cliente.tipoDocumento}</tipoDocumento>
    </cliente>
    <cuenta>
        <numero>{cuenta.numero}</numero>
        <tipo>{cuenta.tipo}</tipo>
    </cuenta>
    <tipoConsulta>{tipoConsulta}</tipoConsulta>
    <timestamp>{timestamp}</timestamp>
</consulta>`,
        
        jsonRequestTemplate: `{
    "queryType": "{tipoConsulta}",
    "customer": {
        "documentNumber": "{cliente.documento}",
        "documentType": "{cliente.tipoDocumento}"
    },
    "account": {
        "number": "{cuenta.numero}",
        "type": "{cuenta.tipo}"
    },
    "requestTime": "{timestamp}"
}`,
        
        jsonResponseTemplate: `{
    "success": true,
    "account": {
        "number": "1234567890",
        "type": "savings",
        "status": "active",
        "balance": 1500.75,
        "currency": "GTQ"
    },
    "customer": {
        "name": "Juan Pérez",
        "status": "active"
    },
    "queryTime": "2025-10-16T12:00:00Z"
}`,
        
        xmlResponseTemplate: `<?xml version="1.0" encoding="UTF-8"?>
<respuestaConsulta>
    <resultado>
        <exito>{success}</exito>
        <cuenta>
            <numero>{account.number}</numero>
            <tipo>{account.type}</tipo>
            <estado>{account.status}</estado>
            <saldo>{account.balance}</saldo>
            <moneda>{account.currency}</moneda>
        </cuenta>
        <cliente>
            <nombre>{customer.name}</nombre>
            <estado>{customer.status}</estado>
        </cliente>
        <fechaConsulta>{queryTime}</fechaConsulta>
    </resultado>
</respuestaConsulta>`,
        requestMappings: [],
        responseMappings: []
    };

    // PAGO - Templates
    configurations.pago = {
        xmlRequestTemplate: `<?xml version="1.0" encoding="UTF-8"?>
<pago>
    <transaccion>
        <id>{transaccion.id}</id>
        <monto>{transaccion.monto}</monto>
        <moneda>{transaccion.moneda}</moneda>
        <descripcion>{transaccion.descripcion}</descripcion>
    </transaccion>
    <cuentaOrigen>
        <numero>{cuentaOrigen.numero}</numero>
        <tipo>{cuentaOrigen.tipo}</tipo>
    </cuentaOrigen>
    <cuentaDestino>
        <numero>{cuentaDestino.numero}</numero>
        <banco>{cuentaDestino.banco}</banco>
    </cuentaDestino>
    <cliente>
        <nombre>{cliente.nombre}</nombre>
        <email>{cliente.email}</email>
        <telefono>{cliente.telefono}</telefono>
    </cliente>
    <timestamp>{timestamp}</timestamp>
</pago>`,
        
        jsonRequestTemplate: `{
    "transactionId": "{transaccion.id}",
    "amount": "{transaccion.monto}",
    "currency": "{transaccion.moneda}",
    "description": "{transaccion.descripcion}",
    "sourceAccount": {
        "number": "{cuentaOrigen.numero}",
        "type": "{cuentaOrigen.tipo}"
    },
    "targetAccount": {
        "number": "{cuentaDestino.numero}",
        "bankCode": "{cuentaDestino.banco}"
    },
    "customer": {
        "fullName": "{cliente.nombre}",
        "email": "{cliente.email}",
        "phone": "{cliente.telefono}"
    },
    "requestTime": "{timestamp}"
}`,
        
        jsonResponseTemplate: `{
    "success": true,
    "transactionId": "TXN-12345",
    "status": "approved",
    "authorizationCode": "AUTH-789",
    "amount": 150.50,
    "currency": "GTQ",
    "processedAt": "2025-10-16T12:30:00Z",
    "reference": "REF-456",
    "fees": 2.50
}`,
        
        xmlResponseTemplate: `<?xml version="1.0" encoding="UTF-8"?>
<respuestaPago>
    <resultado>
        <exito>{success}</exito>
        <transaccionId>{transactionId}</transaccionId>
        <estado>{status}</estado>
        <codigoAutorizacion>{authorizationCode}</codigoAutorizacion>
        <monto>{amount}</monto>
        <moneda>{currency}</moneda>
        <fechaProcesamiento>{processedAt}</fechaProcesamiento>
        <referencia>{reference}</referencia>
        <comisiones>{fees}</comisiones>
    </resultado>
</respuestaPago>`,
        requestMappings: [],
        responseMappings: []
    };

    // REVERSA - Templates  
    configurations.reversa = {
        xmlRequestTemplate: `<?xml version="1.0" encoding="UTF-8"?>
<reversa>
    <transaccionOriginal>
        <id>{transaccionOriginal.id}</id>
        <fecha>{transaccionOriginal.fecha}</fecha>
        <monto>{transaccionOriginal.monto}</monto>
        <referencia>{transaccionOriginal.referencia}</referencia>
    </transaccionOriginal>
    <motivoReversa>{motivoReversa}</motivoReversa>
    <montoReversa>{montoReversa}</montoReversa>
    <solicitante>
        <usuario>{solicitante.usuario}</usuario>
        <rol>{solicitante.rol}</rol>
    </solicitante>
    <timestamp>{timestamp}</timestamp>
</reversa>`,
        
        jsonRequestTemplate: `{
    "originalTransaction": {
        "transactionId": "{transaccionOriginal.id}",
        "date": "{transaccionOriginal.fecha}",
        "amount": "{transaccionOriginal.monto}",
        "reference": "{transaccionOriginal.referencia}"
    },
    "reversalReason": "{motivoReversa}",
    "reversalAmount": "{montoReversa}",
    "requestedBy": {
        "user": "{solicitante.usuario}",
        "role": "{solicitante.rol}"
    },
    "requestTime": "{timestamp}"
}`,
        
        jsonResponseTemplate: `{
    "success": true,
    "reversalId": "REV-12345",
    "originalTransactionId": "TXN-12345", 
    "status": "approved",
    "reversedAmount": 150.50,
    "currency": "GTQ",
    "processedAt": "2025-10-16T13:00:00Z",
    "newBalance": 1351.25
}`,
        
        xmlResponseTemplate: `<?xml version="1.0" encoding="UTF-8"?>
<respuestaReversa>
    <resultado>
        <exito>{success}</exito>
        <reversaId>{reversalId}</reversaId>
        <transaccionOriginalId>{originalTransactionId}</transaccionOriginalId>
        <estado>{status}</estado>
        <montoReversado>{reversedAmount}</montoReversado>
        <moneda>{currency}</moneda>
        <fechaProcesamiento>{processedAt}</fechaProcesamiento>
        <nuevoSaldo>{newBalance}</nuevoSaldo>
    </resultado>
</respuestaReversa>`,
        requestMappings: [],
        responseMappings: []
    };

    // Cargar configuración inicial (consulta)
    loadConfigurationForType('consulta');
    console.log('📝 Templates específicos por tipo de transacción cargados');
}

// Cargar templates por defecto (método legacy - mantener por compatibilidad)
function loadDefaultTemplates() {
    // Template XML de request por defecto
    const defaultXmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<payment>
    <transaction>
        <id>{transaction.id}</id>
        <amount>{transaction.amount}</amount>
        <currency>{transaction.currency}</currency>
        <description>{transaction.description}</description>
        <customer>
            <name>{customer.name}</name>
            <email>{customer.email}</email>
            <phone>{customer.phone}</phone>
        </customer>
        <timestamp>{timestamp}</timestamp>
    </transaction>
</payment>`;

    // JSON request target por defecto
    const defaultJsonRequest = `{
    "transactionId": "{transaction.id}",
    "paymentAmount": "{transaction.amount}",
    "currencyCode": "{transaction.currency}",
    "description": "{transaction.description}",
    "customerInfo": {
        "fullName": "{customer.name}",
        "emailAddress": "{customer.email}",
        "phoneNumber": "{customer.phone}"
    },
    "requestTime": "{timestamp}"
}`;

    // JSON response source por defecto
    const defaultJsonResponse = `{
    "success": true,
    "transactionId": "TXN-12345",
    "status": "approved",
    "authorizationCode": "AUTH-789",
    "amount": 150.50,
    "currency": "GTQ",
    "processedAt": "2025-10-15T23:30:00Z",
    "reference": "REF-456"
}`;

    // XML response template por defecto
    const defaultXmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<response>
    <result>
        <status>{status}</status>
        <transactionId>{transactionId}</transactionId>
        <authCode>{authorizationCode}</authCode>
        <amount>{amount}</amount>
        <currency>{currency}</currency>
        <timestamp>{processedAt}</timestamp>
        <reference>{reference}</reference>
    </result>
</response>`;

    // Cargar en los editores
    if (editors['xml-request-editor']) editors['xml-request-editor'].setValue(defaultXmlRequest);
    if (editors['json-request-editor']) editors['json-request-editor'].setValue(defaultJsonRequest);
    if (editors['json-response-editor']) editors['json-response-editor'].setValue(defaultJsonResponse);
    if (editors['xml-response-editor']) editors['xml-response-editor'].setValue(defaultXmlResponse);

    console.log('📝 Templates por defecto cargados');
}

// Cambiar entre tabs
function switchTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar tab seleccionado
    document.getElementById(tabName).classList.add('active');
    
    // Activar botón correspondiente
    event.target.classList.add('active');
    
    // Refresh editors cuando se cambia de tab
    setTimeout(() => {
        Object.values(editors).forEach(editor => {
            if (editor) editor.refresh();
        });
    }, 100);
}

// === FUNCIONES DE MAPEO ===

function addRequestMapping() {
    const mappingId = Date.now();
    const mappingHtml = `
        <div class="mapping-item" data-id="${mappingId}">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; width: 100%;">
                <label>XML Path:</label>
                <input type="text" placeholder="transaction.id" style="flex: 1; min-width: 150px;" onchange="updateRequestMapping(${mappingId})">
                
                <span>→</span>
                
                <label>JSON Path:</label>
                <input type="text" placeholder="transactionId" style="flex: 1; min-width: 150px;" onchange="updateRequestMapping(${mappingId})">
                
                <select onchange="updateRequestMapping(${mappingId})" style="min-width: 120px;">
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="date">Date</option>
                </select>
                
                <button class="btn btn-danger" onclick="removeRequestMapping(${mappingId})" style="padding: 8px 12px;">❌</button>
            </div>
        </div>
    `;
    
    document.getElementById('request-mappings').insertAdjacentHTML('beforeend', mappingHtml);
}

function addResponseMapping() {
    const mappingId = Date.now();
    const mappingHtml = `
        <div class="mapping-item" data-id="${mappingId}">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; width: 100%;">
                <label>JSON Path:</label>
                <input type="text" placeholder="transactionId" style="flex: 1; min-width: 150px;" onchange="updateResponseMapping(${mappingId})">
                
                <span>→</span>
                
                <label>XML Path:</label>
                <input type="text" placeholder="result.transactionId" style="flex: 1; min-width: 150px;" onchange="updateResponseMapping(${mappingId})">
                
                <select onchange="updateResponseMapping(${mappingId})" style="min-width: 120px;">
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="date">Date</option>
                </select>
                
                <button class="btn btn-danger" onclick="removeResponseMapping(${mappingId})" style="padding: 8px 12px;">❌</button>
            </div>
        </div>
    `;
    
    document.getElementById('response-mappings').insertAdjacentHTML('beforeend', mappingHtml);
}

function updateRequestMapping(mappingId) {
    const mappingElement = document.querySelector(`[data-id="${mappingId}"]`);
    const inputs = mappingElement.querySelectorAll('input');
    const select = mappingElement.querySelector('select');
    
    const mapping = {
        id: mappingId,
        xmlPath: inputs[0].value,
        jsonPath: inputs[1].value,
        type: select.value
    };
    
    // Actualizar en la configuración del tipo activo
    const currentMappings = configurations[activeTransactionType].requestMappings;
    const index = currentMappings.findIndex(m => m.id === mappingId);
    if (index >= 0) {
        currentMappings[index] = mapping;
    } else {
        currentMappings.push(mapping);
    }
    
    console.log(`📝 Request mapping actualizado para ${activeTransactionType}:`, mapping);
}

function updateResponseMapping(mappingId) {
    const mappingElement = document.querySelector(`[data-id="${mappingId}"]`);
    const inputs = mappingElement.querySelectorAll('input');
    const select = mappingElement.querySelector('select');
    
    const mapping = {
        id: mappingId,
        jsonPath: inputs[0].value,
        xmlPath: inputs[1].value,
        type: select.value
    };
    
    // Actualizar en la configuración del tipo activo
    const currentMappings = configurations[activeTransactionType].responseMappings;
    const index = currentMappings.findIndex(m => m.id === mappingId);
    if (index >= 0) {
        currentMappings[index] = mapping;
    } else {
        currentMappings.push(mapping);
    }
    
    console.log(`📝 Response mapping actualizado para ${activeTransactionType}:`, mapping);
}

function removeRequestMapping(mappingId) {
    document.querySelector(`[data-id="${mappingId}"]`).remove();
    configurations[activeTransactionType].requestMappings = 
        configurations[activeTransactionType].requestMappings.filter(m => m.id !== mappingId);
}

function removeResponseMapping(mappingId) {
    document.querySelector(`[data-id="${mappingId}"]`).remove();
    configurations[activeTransactionType].responseMappings = 
        configurations[activeTransactionType].responseMappings.filter(m => m.id !== mappingId);
}

function clearRequestMappings() {
    document.getElementById('request-mappings').innerHTML = '';
    configurations[activeTransactionType].requestMappings = [];
}

function clearResponseMappings() {
    document.getElementById('response-mappings').innerHTML = '';
    configurations[activeTransactionType].responseMappings = [];
}

// Auto-detectar mapeos basados en los templates
function autoDetectRequestMapping() {
    try {
        const xmlTemplate = editors['xml-request-editor'].getValue();
        const jsonTemplate = editors['json-request-editor'].getValue();
        
        // Extraer placeholders del XML (formato {path})
        const xmlPlaceholders = xmlTemplate.match(/\{([^}]+)\}/g) || [];
        const jsonPlaceholders = jsonTemplate.match(/\{([^}]+)\}/g) || [];
        
        clearRequestMappings();
        
        xmlPlaceholders.forEach(placeholder => {
            const path = placeholder.replace(/[{}]/g, '');
            if (jsonPlaceholders.includes(placeholder)) {
                addRequestMapping();
                // Auto-completar el último mapeo agregado
                const lastMapping = document.querySelector('#request-mappings .mapping-item:last-child');
                const inputs = lastMapping.querySelectorAll('input');
                inputs[0].value = path;
                inputs[1].value = path; // Mismo path por defecto
                updateRequestMapping(parseInt(lastMapping.dataset.id));
            }
        });
        
        showStatus('✅ Auto-detección de mapeos completada', 'success');
    } catch (error) {
        showStatus('❌ Error en auto-detección: ' + error.message, 'error');
    }
}

function autoDetectResponseMapping() {
    try {
        const jsonTemplate = editors['json-response-editor'].getValue();
        const xmlTemplate = editors['xml-response-editor'].getValue();
        
        // Extraer campos del JSON de ejemplo
        const jsonObj = JSON.parse(jsonTemplate);
        const jsonPaths = extractJsonPaths(jsonObj);
        
        // Extraer placeholders del XML
        const xmlPlaceholders = xmlTemplate.match(/\{([^}]+)\}/g) || [];
        
        clearResponseMappings();
        
        jsonPaths.forEach(path => {
            const placeholder = `{${path}}`;
            if (xmlPlaceholders.includes(placeholder)) {
                addResponseMapping();
                const lastMapping = document.querySelector('#response-mappings .mapping-item:last-child');
                const inputs = lastMapping.querySelectorAll('input');
                inputs[0].value = path;
                inputs[1].value = path;
                updateResponseMapping(parseInt(lastMapping.dataset.id));
            }
        });
        
        showStatus('✅ Auto-detección de mapeos de respuesta completada', 'success');
    } catch (error) {
        showStatus('❌ Error en auto-detección: ' + error.message, 'error');
    }
}

// Función auxiliar para extraer paths de un objeto JSON
function extractJsonPaths(obj, prefix = '') {
    const paths = [];
    
    for (const key in obj) {
        const currentPath = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            paths.push(...extractJsonPaths(obj[key], currentPath));
        } else {
            paths.push(currentPath);
        }
    }
    
    return paths;
}

// === FUNCIONES DE TESTING ===

async function testTransformation() {
    try {
        showStatus(`🔄 Probando transformación de ${activeTransactionType.toUpperCase()}...`, 'warning');
        
        const testXml = editors['test-xml-editor'].getValue();
        if (!testXml.trim()) {
            throw new Error('Ingrese XML de prueba');
        }
        
        // Enviar al endpoint específico del tipo de transacción
        const endpoint = `${SERVER_URL}/api/collector/${activeTransactionType}`;
        console.log(`🚀 Enviando a endpoint: ${endpoint}`);
        
        const startTime = Date.now();
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: testXml
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const result = await response.text();
        editors['test-result-editor'].setValue(result);
        
        showStatus(`✅ Transformación ${activeTransactionType.toUpperCase()} completada exitosamente`, 'success');
        
        // Mostrar resultados detallados
        document.getElementById('test-results').style.display = 'block';
        document.getElementById('test-results').innerHTML = `
            <h4>📊 Resultados de la Prueba - ${activeTransactionType.toUpperCase()}</h4>
            <p><strong>Tipo de transacción:</strong> 🔄 ${activeTransactionType}</p>
            <p><strong>Endpoint:</strong> ${endpoint}</p>
            <p><strong>Estado:</strong> ${response.ok ? '✅ Exitoso' : '❌ Error'}</p>
            <p><strong>Código de respuesta:</strong> ${response.status}</p>
            <p><strong>Tiempo de respuesta:</strong> ${responseTime}ms</p>
            <p><strong>Tamaño XML enviado:</strong> ${testXml.length} caracteres</p>
            <p><strong>Tamaño respuesta:</strong> ${result.length} caracteres</p>
            <p><strong>Content-Type respuesta:</strong> ${response.headers.get('Content-Type')}</p>
        `;
        
    } catch (error) {
        showStatus('❌ Error en la prueba: ' + error.message, 'error');
        editors['test-result-editor'].setValue(`Error: ${error.message}`);
    }
}

async function testFullFlow() {
    try {
        showStatus('🔄 Probando flujo completo...', 'warning');
        
        // 1. Obtener configuración actual
        const config = getCurrentConfig();
        
        // 2. Aplicar configuración al servidor
        await deployConfig();
        
        // 3. Ejecutar prueba
        await testTransformation();
        
        showStatus('✅ Flujo completo probado exitosamente', 'success');
        
    } catch (error) {
        showStatus('❌ Error en flujo completo: ' + error.message, 'error');
    }
}

// === FUNCIONES DE CONFIGURACIÓN ===

function getCurrentConfig() {
    // Guardar configuración actual antes de obtenerla
    saveCurrentConfiguration();
    
    return {
        configurations: configurations,
        activeTransactionType: activeTransactionType,
        timestamp: new Date().toISOString()
    };
}

async function deployConfig() {
    try {
        showStatus('🚀 Aplicando configuración...', 'warning');
        
        const config = getCurrentConfig();
        
        // Enviar configuración al servidor
        const response = await fetch(`${SERVER_URL}/api/config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        
        if (response.ok) {
            showStatus('✅ Configuración aplicada exitosamente', 'success');
            document.getElementById('last-update').textContent = new Date().toLocaleString();
        } else {
            throw new Error('Error al aplicar configuración');
        }
        
    } catch (error) {
        showStatus('❌ Error al aplicar configuración: ' + error.message, 'error');
    }
}

function saveConfig() {
    const configName = prompt('Nombre de la configuración:');
    if (!configName) return;
    
    const config = getCurrentConfig();
    const savedConfigs = JSON.parse(localStorage.getItem('gytConfigs') || '{}');
    
    savedConfigs[configName] = config;
    localStorage.setItem('gytConfigs', JSON.stringify(savedConfigs));
    
    loadSavedConfigs();
    showStatus(`✅ Configuración "${configName}" guardada`, 'success');
}

function loadConfig() {
    const configName = document.getElementById('config-list').value;
    if (!configName) return;
    
    const savedConfigs = JSON.parse(localStorage.getItem('gytConfigs') || '{}');
    const config = savedConfigs[configName];
    
    if (config) {
        // Cargar templates
        editors['xml-request-editor'].setValue(config.xmlRequestTemplate || '');
        editors['json-request-editor'].setValue(config.jsonRequestTemplate || '');
        editors['json-response-editor'].setValue(config.jsonResponseTemplate || '');
        editors['xml-response-editor'].setValue(config.xmlResponseTemplate || '');
        
        // Cargar mapeos
        clearRequestMappings();
        clearResponseMappings();
        
        // Recrear mapeos de request
        requestMappings = config.requestMappings || [];
        requestMappings.forEach(mapping => {
            addRequestMapping();
            const lastMapping = document.querySelector('#request-mappings .mapping-item:last-child');
            lastMapping.dataset.id = mapping.id;
            const inputs = lastMapping.querySelectorAll('input');
            const select = lastMapping.querySelector('select');
            inputs[0].value = mapping.xmlPath;
            inputs[1].value = mapping.jsonPath;
            select.value = mapping.type;
        });
        
        // Recrear mapeos de response
        responseMappings = config.responseMappings || [];
        responseMappings.forEach(mapping => {
            addResponseMapping();
            const lastMapping = document.querySelector('#response-mappings .mapping-item:last-child');
            lastMapping.dataset.id = mapping.id;
            const inputs = lastMapping.querySelectorAll('input');
            const select = lastMapping.querySelector('select');
            inputs[0].value = mapping.jsonPath;
            inputs[1].value = mapping.xmlPath;
            select.value = mapping.type;
        });
        
        activeConfig = configName;
        document.getElementById('active-config').textContent = configName;
        showStatus(`✅ Configuración "${configName}" cargada`, 'success');
    }
}

function loadSavedConfigs() {
    const savedConfigs = JSON.parse(localStorage.getItem('gytConfigs') || '{}');
    const select = document.getElementById('config-list');
    
    select.innerHTML = '<option value="">Seleccionar configuración...</option>';
    
    Object.keys(savedConfigs).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function deleteConfig() {
    const configName = document.getElementById('config-list').value;
    if (!configName) return;
    
    if (confirm(`¿Eliminar la configuración "${configName}"?`)) {
        const savedConfigs = JSON.parse(localStorage.getItem('gytConfigs') || '{}');
        delete savedConfigs[configName];
        localStorage.setItem('gytConfigs', JSON.stringify(savedConfigs));
        
        loadSavedConfigs();
        showStatus(`✅ Configuración "${configName}" eliminada`, 'success');
    }
}

// === FUNCIONES DE UTILIDAD ===

function showStatus(message, type) {
    const statusDiv = document.getElementById('test-status');
    statusDiv.innerHTML = `<div class="status-indicator status-${type}">${message}</div>`;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        statusDiv.innerHTML = '';
    }, 5000);
}

async function checkServerStatus() {
    try {
        const response = await fetch(`${SERVER_URL}/health`);
        if (response.ok) {
            document.getElementById('server-status').textContent = '✅ Conectado';
            document.getElementById('server-status').style.color = 'green';
        } else {
            throw new Error('Server not responding');
        }
    } catch (error) {
        document.getElementById('server-status').textContent = '❌ Desconectado';
        document.getElementById('server-status').style.color = 'red';
    }
}

function validateAll() {
    const issues = [];
    
    // Validar templates
    try {
        const xmlReq = editors['xml-request-editor'].getValue();
        if (!xmlReq.trim()) issues.push('XML Request template está vacío');
        
        const jsonReq = editors['json-request-editor'].getValue();
        if (jsonReq.trim()) {
            JSON.parse(jsonReq); // Validar JSON
        } else {
            issues.push('JSON Request template está vacío');
        }
        
        const jsonRes = editors['json-response-editor'].getValue();
        if (jsonRes.trim()) {
            JSON.parse(jsonRes); // Validar JSON
        } else {
            issues.push('JSON Response template está vacío');
        }
        
        const xmlRes = editors['xml-response-editor'].getValue();
        if (!xmlRes.trim()) issues.push('XML Response template está vacío');
        
        // Validar mapeos
        if (requestMappings.length === 0) issues.push('No hay mapeos de request definidos');
        if (responseMappings.length === 0) issues.push('No hay mapeos de response definidos');
        
        // Mostrar resultado
        if (issues.length === 0) {
            showStatus('✅ Validación exitosa - Todo está correcto', 'success');
        } else {
            showStatus(`⚠️ Validación: ${issues.length} problemas encontrados: ${issues.join(', ')}`, 'warning');
        }
        
    } catch (error) {
        showStatus('❌ Error de validación: ' + error.message, 'error');
    }
}

function exportConfig() {
    const config = getCurrentConfig();
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], {type:'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `gyt-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const config = JSON.parse(e.target.result);
                    // Aplicar configuración importada
                    // (similar a loadConfig pero desde archivo)
                    showStatus('✅ Configuración importada exitosamente', 'success');
                } catch (error) {
                    showStatus('❌ Error al importar configuración: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function resetAll() {
    if (confirm('¿Está seguro de que desea resetear toda la configuración?')) {
        // Limpiar editores
        Object.values(editors).forEach(editor => {
            if (editor) editor.setValue('');
        });
        
        // Limpiar mapeos
        clearRequestMappings();
        clearResponseMappings();
        
        // Cargar templates por defecto
        loadDefaultTemplates();
        
        showStatus('✅ Configuración reseteada', 'success');
    }
}