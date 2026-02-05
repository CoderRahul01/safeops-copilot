const express = require('express');
const router = express.Router();
const controllers = require('./controllers');
const { verifyToken } = require('../../middlewares/auth.middleware');

router.get('/context', verifyToken, controllers.getBillingContext);
router.get('/gcp', verifyToken, controllers.getGcpBilling);
router.get('/aws', verifyToken, controllers.getAwsBilling);
router.get('/sentinel', verifyToken, controllers.getSentinelData);

module.exports = router;
