const express = require('express');
const router = express.Router();
const controllers = require('./controllers');
const { verifyAuth } = require('../../middleware/auth.middleware');

// GCP Routes
router.get('/gcp/services', verifyAuth, controllers.listGcpServices);
router.post('/gcp/stop-service', verifyAuth, controllers.stopGcpService);

// AWS Routes
router.get('/aws/services', verifyAuth, controllers.listAwsServices);

// Unified Termination Route
router.post('/terminate', verifyAuth, controllers.terminateResource);

// Real-time Cloud Management
router.get('/status', verifyAuth, controllers.getConnectionStatus);
router.get('/overview', verifyAuth, controllers.getCloudOverview);
router.post('/update-credentials', verifyAuth, controllers.updateCredentials);
router.get('/logs', verifyAuth, controllers.getCloudLogs);

module.exports = router;
