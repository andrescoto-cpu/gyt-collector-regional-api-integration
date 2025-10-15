const express = require('express');
const app = express();

app.get('/', (req, res) => {
    console.log('GET / request received');
    res.json({ message: 'GYT Collector API está corriendo', status: 'OK' });
});

app.get('/health', (req, res) => {
    console.log('GET /health request received');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Test server is running on port ${PORT}`);
});