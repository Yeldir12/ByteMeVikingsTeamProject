const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const router = express.Router();
const routeUtils = require('./routeUtils');
const accountUtils = require("./accountUtils");

//Important registration methods
//If we are already logged in, redirect to the homepage
function redirectIfLoggedIn(req, res, next) {
    if (req.session.user) {
        return res.redirect("/");
    }
    next();
}


//Endpoints
// Register Page
router.get("/register", redirectIfLoggedIn, (req, res) => {
    routeUtils.renderPage(req, res, 'register');
});

router.post("/register", async (req, res) => {
    var { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }
    username = username.toLowerCase().trim();
    password = password.trim();

    if (username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    if (password.length > 20) {
        return res.status(400).json({ error: "Password must be less than 20 characters" });
    }

    if (username.length > 20) {
        return res.status(400).json({ error: "Username must be less than 20 characters" });
    }

    if (await accountUtils.isUsernameTaken(username)) {
        return res.status(400).json({ error: "Username \"" + username + "\" already exists" });
    }

    if (await accountUtils.addAccount(username, password)) {
        return res.json({ message: "Welcome \"" + username + "\"!" });
    } else {
        return res.json({ error: "Error Adding account" });
    }
});

// Login Page
router.get("/login", redirectIfLoggedIn, (req, res) => {
    routeUtils.renderPage(req, res, 'login');
});

router.post("/login", async (req, res) => {
    console.log("Login request");
    var { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }
    username = username.toLowerCase().trim();
    password = password.trim();

    const account = await accountUtils.getAccount(username);
    if (account == null) {
        return res.status(400).json({ error: "Account not found." });
    }

    console.log("Account: ", account);
    if (await bcrypt.compare(password, account.password) == false) {
        return res.status(400).json({ error: "Invalid credentials." });
    }
    req.session.user = username;
    req.session.character = account.character;
    console.log("Logged in with session: ", JSON.stringify(req.session));
    return res.status(200).json({ message: "Signed in." });

});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
