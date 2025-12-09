const express = require('express');
const router = express.Router();
const routeUtils = require('./routeUtils');

router.get('/', (req, res) => {
  routeUtils.renderPage(req,res,'quest-chat');
});

module.exports = router;

