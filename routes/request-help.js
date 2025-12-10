const express = require('express');
const router = express.Router();
const routeUtils = require('./routeUtils');
const database = require("../database");
const questUtils = require("./questUtils");

router.get('/', (req, res) => {
  routeUtils.renderPage(req, res, 'request-help', {
    title: "Request Help",
    otherPageTitle: "Help Chat",
    otherPageLink: "/request-help/chat",
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

      //Check the length of all elements to prevent unreasonable requests
      if (title.length > 55) {
        return res.status(400).json({ error: "Title too long (55 characters max)" });
      }

      if (description.length > 500) {
        return res.status(400).json({ error: "Description too long" });
      }


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
