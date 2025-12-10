const express = require("express");
const { WebSocketServer } = require("ws");
const questUtils = require("./questUtils");
const routeUtils = require("./routeUtils");

const userSockets = new Map();

class ChatModule {
  constructor(config) {
    this.grabAcceptedQuests = config.grabAcceptedQuests;
    this.address = config.address;
    this.title = config.title || "Chat";
    this.otherPageTitle = config.otherPageTitle || "Home";
    this.otherPageLink = config.otherPageLink || "/";

    this.router = express.Router();
    this.router.get("/", async (req, res) => {

      //Get accepted quests from quest database

      var acceptedQuests;
      if (this.grabAcceptedQuests) {
        acceptedQuests = await questUtils.getAcceptedQuests(req.session.user, false);
      } else {
        acceptedQuests = await questUtils.getMyQuests(req.session.user, true);
      }

      this.startingQuest = null;
      if (acceptedQuests.length > 0) {
        this.startingQuest = acceptedQuests[0];
      }
      console.log("Starting quest:", this.startingQuest);

      routeUtils.renderPage(req, res, "quest-chat", {
        acceptedQuests,
        chatWsAddress: this.address,
        startingQuest: this.startingQuest,
        title: this.title,
        otherPageTitle: this.otherPageTitle,
        otherPageLink: this.otherPageLink
      });
    });


    this._setupWebSocket();
  }

  _setupWebSocket() {
    this.wss = new WebSocketServer({ noServer: true });
    this.wss.on("connection", (ws, req) => {
      const session = req.session;
      if (!session?.user) {
        ws.close();
        return;
      }
      userSockets.set(session.user, ws);

      ws.send(JSON.stringify({
        type: "INFO",
        message: "Connected to chat WS!"
      }));

      ws.on("message", async (msg) => {
        try {
          // console.log("WS: " + msg);
          const data = JSON.parse(msg);

          // --- SEND MESSAGE ---
          if (data.action === "SEND_MESSAGE") {
            const { questDbId, message, attachments } = data;

            await questUtils.addMessage(
              questDbId,
              session.user,
              message,
              attachments || []
            );

            this.sendToAllInvolved(questDbId, JSON.stringify({
              type: "NEW_MESSAGE",
              questDbId,
              username: session.user,
              message,
              attachments: attachments || [],
              timestamp: Date.now()
            }));
          }

          // --- GET MESSAGES ---
          else if (data.action === "GET_MESSAGES") {
            const messages = await questUtils.getMessages(data.questDbId);
            ws.send(JSON.stringify({
              type: "MESSAGES_LIST",
              questDbId: data.questDbId,
              messages
            }));
          }

          // --- RESOLVE QUEST ---
          else if (data.action === "RESOLVE_QUEST") {
            await questUtils.closeQuest(data.questDbId);
            this.sendToAllInvolved(data.questDbId, JSON.stringify({
              type: "QUEST_RESOLVED",
              questDbId: data.questDbId
            }));

            //Delete the quest if the user is the creator
            var quest = await questUtils.getQuest(data.questDbId);
            if (quest !== null && quest.username == session.user) {
               await questUtils.deleteQuest(data.questDbId);
            }
          }

          else if (data.action === "SELECT_QUEST") {
            const messages = await questUtils.getMessages(data.questDbId);
            const quest = await questUtils.getQuest(data.questDbId);
            ws.send(JSON.stringify({
              type: "SELECT_QUEST",
              quest,
              messages
            }));
          }
        } catch (e) {
          console.log("Chat websocket error ", e);
        }
      });

      ws.on("close", () => {
        console.log("Chat WS closed");
        userSockets.delete(session.user);
      });
    });
  }

  // -----------------------------
  //   WebSocket methods
  // -----------------------------
  broadcast(data) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(data);
    });
  }

  sendToUser(user, data) {
    if (userSockets.has(user)) {
      userSockets.get(user).send(data);
    }
  }

  async sendToAllInvolved(questId, data) {
    const quest = await questUtils.getQuest(questId);
    if (quest === null) return;
    quest.acceptedUsers.forEach(user => {
      this.sendToUser(user, data);
    });
    this.sendToUser(quest.username, data);
  }

}

module.exports = ChatModule;