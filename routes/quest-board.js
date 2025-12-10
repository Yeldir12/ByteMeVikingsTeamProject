const express = require('express');
const router = express.Router();
const routeUtils = require('./routeUtils');
const database = require("../database");
const questUtils = require("./questUtils");
const accountUtils = require("./accountUtils");
const { WebSocketServer } = require("ws");


//Websockets
const wssQuestsAddress = "/ws/quest-board";
const wssQuests = new WebSocketServer({ noServer: true });
wssQuests.on("connection", (ws, request) => {
  const session = request.session;
  if (!request.session.user) {
    console.log("QUESTS---WebSocket connection rejected (unauthenticated)");
    return;
  }

  ws.send(JSON.stringify({
    type: "INFO",
    message: "Connected to chat WS!"
  }));

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg);

    if (data.action === "GET_QUESTS") {
      const quests = await questUtils.getUnacceptedQuests(session.user);
      ws.send(JSON.stringify({ type: "QUESTS_LIST", quests }));
    } else if (data.action === "ACCEPT") {
      var out = await questUtils.acceptQuest(data.questID, session.user);
      
      accountUtils.gainPoints(session.user, 10);

      // console.log("quest accepted: " + out);
    } else if (data.action === "REJECT") {
      var out = await questUtils.rejectQuest(data.questID, session.user);
      // console.log("quest rejected: " + out);
    }
  });

  ws.on("close", () => {
    console.log("QUESTS---WebSocket connection closed");
  });
});

router.wssQuests = wssQuests;
router.wssQuestsAddress = wssQuestsAddress;


router.get('/', async (req, res) => {
  routeUtils.renderPage(req, res, 'quest-board', {
    title: "Quest Board",
    otherPageTitle: "Quest Chat",
    otherPageLink: "/quest-board/chat"
  });
});
module.exports = router;