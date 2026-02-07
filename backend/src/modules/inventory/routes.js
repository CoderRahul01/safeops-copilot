const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth.middleware');
const controllers = require('./controllers');

router.get('/resources', verifyToken, controllers.getResources);

module.exports = router;
