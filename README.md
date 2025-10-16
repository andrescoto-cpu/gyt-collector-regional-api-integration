# Sistema de Parametrización XML/JSON para Transacciones Bancarias

## 🏦 Descripción

Sistema completo de parametrización y conversión entre XML y JSON para transacciones bancarias, incluyendo una interfaz web profesional para configuración y testing en tiempo real.

### ✨ Características Principales

- 🔄 **Conversión Bidireccional**: XML ↔ JSON con mapeo configurable
- 🎯 **Múltiples Tipos de Transacción**: Consulta, Pago y Reversa
- 🖥️ **Interfaz Web Profesional**: Admin panel con sintaxis highlighting
- 📊 **Mapeo Visual**: Configuración de campos de manera intuitiva
- 🧪 **Testing en Tiempo Real**: Pruebas inmediatas de configuraciones
- 📝 **Logging Detallado**: Sistema completo de trazabilidad
- 💾 **Persistencia**: Configuraciones guardadas automáticamente

## 🚀 Demo en Vivo

El sistema está disponible públicamente en GitHub Codespaces:

**🌐 URL del Frontend**: https://andrescoto-cpu-humble-meme-wvgj69jx567hq5w-3001.app.github.dev/

**📡 API Base URL**: https://andrescoto-cpu-humble-meme-wvgj69jx567hq5w-3001.app.github.dev/api

## 📋 Endpoints Disponibles

### Transacciones
- `POST /api/collector/consulta` - Consultas de saldo/información
- `POST /api/collector/pago` - Procesamiento de pagos
- `POST /api/collector/reversa` - Reversas de transacciones

### Configuración
- `POST /api/save-config` - Guardar configuración de mapeo
- `GET /api/load-config` - Cargar configuración guardada

## 🛠️ Instalación Local

### Prerrequisitos
- Node.js 14+
- npm

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/andrescoto-cpu/gyt-collector-regional-api-integration.git
cd gyt-collector-regional-api-integration
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar el servidor**
```bash
npm start
# o para modo desarrollo con logs detallados:
node debug-server.js
```

4. **Acceder a la interfaz**
```
http://localhost:3001
```

## 📚 Uso del Sistema

### 1. Interfaz Web de Configuración

#### Características de la Interfaz:
- **Tabs de Transacciones**: Consulta, Pago, Reversa
- **Editor XML/JSON**: Con sintaxis highlighting
- **Mapeo Visual**: Configuración campo a campo
- **Testing Integrado**: Pruebas en tiempo real
- **Guardado Automático**: Configuraciones persistentes

### 2. Configuración de Mapeo

```javascript
// Ejemplo de configuración de mapeo
{
  "transactionType": "consulta",
  "xmlToJsonMapping": {
    "cedula": "$.body.consulta.cedula",
    "monto": "$.body.consulta.monto"
  },
  "jsonToXmlMapping": {
    "status": "respuesta.estado",
    "message": "respuesta.mensaje"
  }
}
```

### 3. Ejemplo de Uso de API

```bash
# Enviar XML de consulta
curl -X POST https://andrescoto-cpu-humble-meme-wvgj69jx567hq5w-3001.app.github.dev/api/collector/consulta \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?>
       <soap:Envelope>
         <soap:Body>
           <consulta>
             <cedula>1234567890</cedula>
             <monto>50000</monto>
           </consulta>
         </soap:Body>
       </soap:Envelope>'
```

## 🏗️ Arquitectura del Sistema

```
├── src/
│   ├── app.js                 # Servidor Express principal
│   ├── controllers/           # Controladores de endpoints
│   ├── services/             # Servicios de integración
│   ├── middleware/           # Middleware personalizado
│   └── utils/                # Utilidades (logger, XML converter)
├── frontend/
│   ├── index.html            # Interfaz web principal
│   └── app.js                # Lógica del frontend
├── test/                     # Tests unitarios
└── debug-server.js           # Servidor con logging detallado
```

## 🧪 Testing

### Tests Unitarios
```bash
npm test
```

### Testing Manual
1. Usar la interfaz web en `/`
2. Configurar mapeos en cada tab
3. Usar el botón "Test Configuration"
4. Verificar logs en tiempo real

### Ejemplos de XMLs de Prueba

#### Consulta
```xml
<?xml version="1.0"?>
<soap:Envelope>
  <soap:Body>
    <consulta>
      <cedula>1234567890</cedula>
      <monto>50000</monto>
    </consulta>
  </soap:Body>
</soap:Envelope>
```

#### Pago
```xml
<?xml version="1.0"?>
<soap:Envelope>
  <soap:Body>
    <pago>
      <cedula>1234567890</cedula>
      <monto>25000</monto>
      <referencia>PAY123</referencia>
    </pago>
  </soap:Body>
</soap:Envelope>
```

## 📊 Monitoreo y Logs

El sistema incluye logging detallado con Winston:

- **Debug**: Información de desarrollo
- **Info**: Operaciones normales
- **Warn**: Advertencias
- **Error**: Errores del sistema

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**Andrés Coto**
- GitHub: [@andrescoto-cpu](https://github.com/andrescoto-cpu)

---

⭐ **¡Dale una estrella al proyecto si te resulta útil!**