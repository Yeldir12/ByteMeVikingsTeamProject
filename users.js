
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

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

// Registration setup
const usersFilePath = path.join(__dirname, "data\\users.json");
// Create users.json if it doesn't exist
if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, "[]");
}
console.log("Users filepath " + usersFilePath)


async function register(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
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
}

module.exports = { register };