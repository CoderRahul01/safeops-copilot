const express = require('express');
const router = express.Router();
const controllers = require('./controllers');
const { verifyToken } = require('../../middlewares/auth.middleware');

// GCP Routes
router.get('/gcp/services', verifyToken, controllers.listGcpServices);
router.post('/gcp/stop-service', verifyToken, controllers.stopGcpService);

// AWS Routes
router.get('/aws/services', verifyToken, controllers.listAwsServices);

// Unified Termination Route
router.post('/terminate', verifyToken, controllers.terminateResource);

// Real-time Cloud Management
router.get('/status', verifyToken, controllers.getConnectionStatus);
router.get('/overview', verifyToken, controllers.getCloudOverview);
router.post('/update-credentials', verifyToken, controllers.updateCredentials);
router.get('/logs', verifyToken, controllers.getCloudLogs);

module.exports = router;
