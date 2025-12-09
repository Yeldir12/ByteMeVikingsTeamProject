const express = require('express');
const router = express.Router();
const routeUtils = require('./routeUtils');
const database = require("../database");
const questUtils = require("./questUtils");

router.get('/', (req, res) => {
  routeUtils.renderPage(req, res, 'request-help');
});

router.get('/chat', async (req, res) => {
  var acceptedQuests = await questUtils.getAcceptedQuests(req.session.user);
  
  routeUtils.renderPage(req, res, 'quest-chat', {
    acceptedQuests: acceptedQuests
  });
});



router.post('/', (req, res) => {
  try {
    if (req.session.user != null) {
      const username = req.session.user;
      const title = req.body.title;
      const description = req.body.description;
      const color = req.body.color;
      const timeMins = req.body.timeMins;
      questUtils.newQuest(username, title, description, color, timeMins);
      return res.status(200).json({ message: "Request added successfully" });
    } else {
      return res.status(400).json({ error: "You are not signed in" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error adding request" });
  }
});

module.exports = router;
