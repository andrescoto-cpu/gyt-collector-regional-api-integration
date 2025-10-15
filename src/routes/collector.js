const express = require('express');
const router = express.Router();
const collectorController = require('../controllers/collectorController');

/**
 * POST /api/collector/payment
 * Receives XML from Banco GYT, processes through Akros API, returns XML
 */
router.post('/payment', collectorController.processPayment);

module.exports = router;
