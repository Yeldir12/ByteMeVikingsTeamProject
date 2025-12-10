// Basic setup
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { WebSocketServer } = require("ws");



// Load environment variables from .env file
dotenv.config();

const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "middlewares/views"));
app.use(express.static("middlewares/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions (only once!)
const sessionParser = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
});

app.use(
  sessionParser
);


//Database
const database = require("./database");
async function connectDB() {
  await database.connect();
}

//Add endpoint for adding items to the database
app.post('/api/items', async (req, res) => {
  try {
    console.log("Posting");
    const newItem = req.body;

    //This is where the magic happens
    const result = await database.accountsCollection.insertOne(newItem);

    res.status(201).json({
      message: "Item added!",
      id: result.insertedId
    });
  } catch (err) {
    // Log the full error to the console
    console.error("MongoDB Insert Error:", err);

    // Send a detailed response
    res.status(500).json({
      message: "Something exploded 💥",
      errorName: err.name,
      errorMessage: err.message,
      stack: err.stack
    });
  }
});

//-------------------------------------
// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Server running http://localhost:${port}`));

//-------------------------------------
//Routes

//Home
const homeRoute = require("./routes/index");
app.use("/", homeRoute);

//Request Help
const requestHelp = require("./routes/request-help");
app.use("/request-help", requestHelp);

//Character
const character = require("./routes/character");
app.use("/character", character);

//login / register
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

//Quest Board
const questBoard = require("./routes/quest-board");
app.use("/quest-board", questBoard);

const ChatModule  = require("./routes/ChatModule");

//Quest Chat
const questBoardChat = new ChatModule({
  address: "/ws/quest-board/chat",
  title: "Quest Chat",
  grabAcceptedQuests: true,
  otherPageTitle: "Quest Board",
  otherPageLink: "/quest-board"
});
app.use("/quest-board/chat", questBoardChat.router);

//Request Help Chat
const questHelpChat = new ChatModule({
  address: "/ws/request-help/chat",
  title: "Quest Help Chat",
  grabAcceptedQuests: false,
  otherPageTitle: "Request Help",
  otherPageLink: "/request-help"
});
app.use("/request-help/chat", questHelpChat.router);

//-------------------------------------
//Websockets
const wssMap = {
  [questBoardChat.address]: questBoardChat.wss,
  [questHelpChat.address]: questHelpChat.wss,
  [questBoard.wssQuestsAddress]: questBoard.wssQuests
};

//Setup the websockets
server.on("upgrade", (req, socket, head) => {
  const wss = wssMap[req.url];

  if (!wss) {
    socket.destroy();
    return;
  }

  sessionParser(req, {}, () => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
});

//----------------------------------------------------
// Error endpoints (MUST BE LAST)
app.use((req, res) => {
  res.status(404).render("404");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500");
});

//----------------------------------------------------
connectDB();
