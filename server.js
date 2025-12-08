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

// Registration setup
const usersFilePath = path.join(__dirname, "users.json");

function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8").trim();
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading users.json:", err);
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Register route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Create users.json if it doesn't exist
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, "[]");
  }

  const users = readUsers();

  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  // Hash the password with bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);
  
  users.push({ username, hashedPassword });
  writeUsers(users);

  res.json({ message: "Registration successful!" });
});

// Error Handling (MUST BE LAST)
app.use((req, res) => {
  res.status(404).render("404");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500");
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});