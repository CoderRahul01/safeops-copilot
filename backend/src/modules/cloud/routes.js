const express = require('express');
const router = express.Router();
const controllers = require('./controllers');
const { verifyToken } = require('../../middlewares/auth.middleware');

// GCP Routes
router.get('/gcp/services', verifyToken, controllers.listGcpServices);
router.post('/gcp/stop-service', verifyToken, controllers.stopGcpService);

// AWS Routes
router.get('/aws/services', verifyToken, controllers.listAwsServices);

module.exports = router;
