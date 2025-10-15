const express = require('express');
const app = express();

// Solo middleware básico
app.use(express.json());

// Logging simple
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Ruta principal
app.get('/', (req, res) => {
    console.log('Procesando GET /');
    res.json({ 
        message: 'GYT Collector API está corriendo',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Ruta de salud
app.get('/health', (req, res) => {
    console.log('Procesando GET /health');
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Error handler básico
app.use((err, req, res, next) => {
    console.error('Error capturado:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err?.message || 'Unknown error'
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Basic server running on port ${PORT}`);
});