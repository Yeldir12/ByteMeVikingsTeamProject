const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const router = express.Router();

const usersFile = path.join(__dirname, "../data/users.json");

function getUsers() {
    return JSON.parse(fs.readFileSync(usersFile));
}

function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// ⭐ Step 6: redirect logged-in users away from login/register
function redirectIfLoggedIn(req, res, next) {
    if (req.session.user) {
        return res.redirect("/");
    }
    next();
}

// Register Page
router.get("/register", redirectIfLoggedIn, (req, res) => {
    res.render("register");
});

// Login Page
router.get("/login", redirectIfLoggedIn, (req, res) => {
    res.render("login");
});

// POST register
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const users = getUsers();
    if (users.find(u => u.username === username)) {
        return res.send("User already exists");
    }

    const hashed = await bcrypt.hash(password, 10);
    users.push({ username, password: hashed });
    saveUsers(users);

    res.redirect("/login");
});

// POST login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user) return res.send("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.send("Invalid credentials");

    req.session.user = username;
    res.redirect("/");
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
