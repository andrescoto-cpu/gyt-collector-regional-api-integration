require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./utils/logger');
const collectorRouter = require('./routes/collector');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 443;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.text({ type: 'application/xml' }));
app.use(express.json());

// Routes
app.use('/api/collector', collectorRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV === 'production') {
  // HTTPS server for production
  try {
    const options = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };

    https.createServer(options, app).listen(PORT, () => {
      logger.info(`HTTPS Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start HTTPS server:', error);
    process.exit(1);
  }
} else {
  // HTTP server for development
  app.listen(PORT, () => {
    logger.info(`HTTP Server running on port ${PORT}`);
  });
}

module.exports = app;
