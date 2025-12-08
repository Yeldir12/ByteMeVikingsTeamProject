// Basic setup
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "middlewares/views"));
app.use(express.static("middlewares/public"));
app.use(express.urlencoded({ extended: true }));

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

// 404 handler
app.use((req, res) => {
  res.status(404).render("404");
});

// 500 handler (must have 4 params!)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500");
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on localhost:${port}`);
});

// Include route files
const homeRoute = require('./routes/index');
app.use('/', homeRoute);

const questBoard = require('./routes/quest-board');
app.use('/quest-board', questBoard);

const questChat = require('./routes/quest-chat');
app.use('/quest-chat', questChat);

const requestHelp = require('./routes/quest-board');
app.use('/quest-board', requestHelp);

const character = require('./routes/character');
app.use('/character', character);


//Error Handling (MUST BE LAST)
app.use((req, res, next) => {
    res.status(404).render('404'); // looks for views/404.ejs
});
app.use((req, res, next) => {
    res.status(500).render('500');
});
