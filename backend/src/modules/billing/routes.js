const express = require('express');
const router = express.Router();
const controllers = require('./controllers');
const { verifyAuth } = require('../../middleware/auth.middleware');

router.get('/context', verifyAuth, controllers.getBillingContext);
router.get('/gcp', verifyAuth, controllers.getGcpBilling);
router.get('/aws', verifyAuth, controllers.getAwsBilling);
router.get('/sentinel', verifyAuth, controllers.getSentinelData);

module.exports = router;
