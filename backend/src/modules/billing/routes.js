const express = require('express');
const router = express.Router();
const controllers = require('./controllers');

router.get('/context', controllers.getBillingContext);
router.get('/gcp', controllers.getGcpBilling);
router.get('/aws', controllers.getAwsBilling);
router.get('/sentinel', controllers.getSentinelData);

module.exports = router;
