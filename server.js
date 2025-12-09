// Basic setup
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "middlewares/views"));
app.use(express.static("middlewares/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions (only once!)
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);

// Routes
const homeRoute = require("./routes/index");
app.use("/", homeRoute);

const questBoard = require("./routes/quest-board");
app.use("/quest-board", questBoard);

const questChat = require("./routes/quest-chat");
app.use("/quest-chat", questChat);

const character = require("./routes/character");
app.use("/character", character);

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);


//Database
const database = require("./database");

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
//Users endpoint
users = require("./users");
app.post("/register", async (req, res) => users.register(req, res));

//-------------------------------------
// Error endpoints (MUST BE LAST)
app.use((req, res) => {
  res.status(404).render("404");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500");
});

//-------------------------------------
// Start server and database connection
const port = process.env.PORT || 3000;
async function start() {
  await database.connect();
  app.listen(port, () => console.log(`Server running http://localhost:${port}`));
}

start();