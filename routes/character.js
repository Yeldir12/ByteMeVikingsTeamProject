const express = require('express');
const router = express.Router();
const routeUtils = require('./routeUtils');

// GET /character
router.get('/', (req, res) => {
  routeUtils.renderPage(req, res, 'character');
});

// POST /character
router.post('/', (req, res) => {
  // Extract submitted values
  const { gender, class: charClass, armor, weapon } = req.body;

  // For now, let's just store it in session (or you can save to DB)
  req.session.character = {
    gender,
    class: charClass,
    armor,
    weapon,
  };

  console.log('Updated character:', req.session.character);

  // Optionally flash a message, then redirect back to character page
  // or render the page again with updated info
  routeUtils.renderPage(req, res, 'character', {
    character: req.session.character,
    title: 'Your Character',
  });
});

module.exports = router;
