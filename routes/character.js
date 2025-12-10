const express = require('express');
const router = express.Router();
const routeUtils = require('./routeUtils');
const accountUtils = require("./accountUtils");


// GET /character
router.get('/', async (req, res) => {
  // User not logged in — render an empty profile
  if (!req.session.user) {
    return routeUtils.renderPage(req, res, 'character', {
      character: {},
      characterPoints: 0
    });
  }

  // Ensure session.character exists
  if (!req.session.character) {
    const account = await accountUtils.getAccount(req.session.user);
    req.session.character = account?.character || {};
  }

  const account = await accountUtils.getAccount(req.session.user);

  return routeUtils.renderPage(req, res, 'character', {
    character: req.session.character,
    characterPoints: account?.characterPoints || 0
  });
});



// POST /character
router.post('/', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const { gender, class: charClass, armor, weapon } = req.body;

  console.log("Updating character... ", gender, charClass, armor, weapon);

  const newCharacter = await accountUtils.setCharacter(
    req.session.user,
    gender,
    charClass,
    armor,
    weapon
  );

  if (newCharacter) {
    req.session.character = newCharacter;
    console.log("Updated session character:", req.session.character);
  }

  // After POST, always redirect (prevents form re-submission)
  return res.redirect('/character');
});


module.exports = router;
