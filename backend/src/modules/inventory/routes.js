const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../../middleware/auth.middleware');
const controllers = require('./controllers');

router.get('/test', (req, res) => res.json({ success: true, message: 'Public Inventory Test Reachable' }));
router.get('/resources', verifyAuth, controllers.getResources);

module.exports = router;
