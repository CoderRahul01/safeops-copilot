const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth.middleware');

router.get('/resources', verifyToken, controllers.getResources);

module.exports = router;
