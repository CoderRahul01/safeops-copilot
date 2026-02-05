const express = require('express');
const router = express.Router();
const controllers = require('./controllers');

// GCP Routes
router.get('/gcp/services', controllers.listGcpServices);
router.post('/gcp/stop-service', controllers.stopGcpService);

// AWS Routes
router.get('/aws/services', controllers.listAwsServices);

module.exports = router;
