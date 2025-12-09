const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const router = express.Router();

const database = require("../database");

//Important registration methods
function redirectIfLoggedIn(req, res, next) {
    if (req.session.user) {
        return res.redirect("/");
    }
    next();
}

async function addAccount(username, password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds); //Hash the password
        console.log("Adding account to database...");
        const result = await database.accountsCollection.insertOne({
            username: username,
            password: hashedPassword
        });
        return true;
    } catch (err) {
        console.log("ERROR ADDING ACCOUNT:", err);
        return false;
    }
}

async function isUsernameTaken(username) {
    try {
        // Search for a document with this username
        const existing = await database.accountsCollection.findOne({ username: username });
        console.log("Existing username ",existing,existing !== null)
        // If a document is found, username is taken
        return existing !== null;
    } catch (err) {
        console.error("ERROR checking username:", err);
        return true; // safer to assume taken if DB fails
    }
}


async function passwordMatch(password, bcryptHash) {
    return await bcrypt.compare(password, bcryptHash);
}


//Endpoints
// Register Page
router.get("/register", redirectIfLoggedIn, (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }

    if(username.length < 3){
        return res.status(400).json({ error: "Username must be at least 3 characters" });
    }

    if(password.length < 8){
        return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    if(password.length > 20){
        return res.status(400).json({ error: "Password must be less than 20 characters" });
    }

    if(username.length > 20){
        return res.status(400).json({ error: "Username must be less than 20 characters" });
    }

    if (await isUsernameTaken(username)) {
        return res.status(400).json({ error: "Username \""+username+"\" already exists" });
    }

    if (await addAccount(username, password)) {
        // res.redirect("/login");
        return res.json({ message: "Account added" });
    } else {
        return res.json({ error: "Error Adding account" });
    }
});

// Login Page
router.get("/login", redirectIfLoggedIn, (req, res) => {
    res.render("login");
});

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
