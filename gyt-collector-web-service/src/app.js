const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const collectorController = require('./controllers/collectorController');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.xml()); // Middleware to parse XML
app.use(bodyParser.json()); // Middleware to parse JSON

// Routes
app.post('/api/collector/payment', collectorController.processPayment);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 443;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});