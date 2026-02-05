const express = require('express');
const router = express.Router();
const controllers = require('./controllers');

router.get('/resources', controllers.getResources);

module.exports = router;
