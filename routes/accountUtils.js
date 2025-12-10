const database = require("../database");
const bcrypt = require("bcrypt");

function character_json(gender = "male", charClass = "wizard", armor = "basic-armor", weapon = "sword") {
    return {
        gender,//Male female
        class: charClass,//wizard, knight, ranger
        armor, //basic-armor, elite-armor, legendary-robes
        weapon, //sword, bow, shield
    };
}

async function gainPoints(username, points) {
    try {
        // Make sure points is a number
        const p = Number(points);
        if (isNaN(p)) {
            console.error("gainPoints error: points must be a number");
            return false;
        }

        // Use $inc — no need to fetch the account unless you want to
        const result = await database.accountsCollection.updateOne(
            { username },
            { $inc: { characterPoints: p } }
        );

        if (result.matchedCount === 0) {
            console.error(`gainPoints error: user '${username}' not found`);
            return false;
        }

        console.log(`Character points updated for ${username} (+${p})`);
        return true;

    } catch (err) {
        console.error("ERROR saving character points:", err);
        return false;
    }
}


function updateSession(req, account) {
    req.session.user = account.username;
    req.session.character = account.character;
}

async function saveCharacterToDB(username, character) {
    try {
        return await database.accountsCollection.updateOne(
            { username }, // filter by username
            { $set: { character: character } } // replace character
        );
    } catch (err) {
        console.error("ERROR saving character:", err);
        return 0;
    }
}

async function setCharacter(username, gender, charClass, armor, weapon) {
    try {
        var newCharacter = character_json(gender, charClass, armor, weapon);
        const result = await saveCharacterToDB(username, newCharacter);

        if (result.modifiedCount === 1) {
            console.log(`Character replaced for user ${username}`);
            return newCharacter;
        } else {
            console.log(`No character updated for user ${username}`);
            return null;
        }
    } catch (err) {
        console.error("Error replacing character:", err);
        return null;
    }
}

async function addAccount(username, password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds); //Hash the password
        console.log("Adding account to database...");

        const result = await database.accountsCollection.insertOne({
            username: username,
            password: hashedPassword,
            characterPoints: 0,
            character: character_json()
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
        console.log("Existing username ", existing, existing !== null)
        // If a document is found, username is taken
        return existing !== null;
    } catch (err) {
        console.error("ERROR checking username:", err);
        return true; // safer to assume taken if DB fails
    }
}

async function getAccount(username) {
    try {
        return await database.accountsCollection.findOne({ username: username });
    } catch (err) {
        console.error("ERROR getting account:", err);
        return null;
    }
}


module.exports = {
    setCharacter,
    addAccount,
    saveCharacterToDB,
    isUsernameTaken,
    getAccount,
    gainPoints,
    updateSession
};