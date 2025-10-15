const express = require('express');
const app = express();

// Ruta básica
app.get('/', (req, res) => {
    res.send('Test server is working!');
});

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = 3002; // Usar puerto diferente
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});