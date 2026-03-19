const express = require('express');
const router = express.Router();
const controllers = require('./controllers');
const { verifyAuth } = require('../../middleware/auth.middleware');

router.post('/', verifyAuth, controllers.onboard);

module.exports = router;
