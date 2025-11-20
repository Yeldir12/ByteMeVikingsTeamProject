// routes/users.js
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.render('quest-chat');
});
module.exports = router;