const express = require('express');
const router = express.Router();
const routeUtils = require('./routeUtils');
const accountUtils = require("./accountUtils");

// GET /character
router.get('/', async (req, res) => {
  routeUtils.renderPage(req, res, 'character', {
    character: req.session.character
  });
});




// POST /character
router.post('/', async (req, res) => {
  // Extract submitted values
  const { gender, class: charClass, armor, weapon } = req.body;
  ;


  var newCharacter = await accountUtils.setCharacter(req.session.user,
    gender, charClass, armor, weapon);

  //Update the session
  //TODO: We may want to do this in the accountUtils
  if (newCharacter != null) {
    req.session.character = newCharacter;
    console.log(req.session.character);
  }

  // Optionally flash a message, then redirect back to character page
  // or render the page again with updated info
  routeUtils.renderPage(req, res, 'character', {
    character: req.session.character
  });
});

module.exports = router;
