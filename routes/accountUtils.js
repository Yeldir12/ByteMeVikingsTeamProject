const database = require("../database");
const bcrypt = require("bcrypt");

function character_json(gender = "male", charClass = "wizard", armor = "basic-armor", weapon = "sword") {
    return {
        gender,//Male female
        class: charClass,//wizard, knight, ranger
        armor, //basic-armor, elite-armor, legendary-robes
        weapon, //sword, bow, shield
        //Extra stuff
        points: 0,
        level: 1
    };
}

async function setCharacter(username, gender, charClass, armor, weapon) {
    try {
        var newCharacter = character_json(gender, charClass, armor, weapon);
        // console.log("Replacing character: ", newCharacter);
        const result = await database.accountsCollection.updateOne(
            { username },             // filter by username
            { $set: { character: newCharacter } } // replace character
        );

        if (result.modifiedCount === 1) {
            console.log(`Character replaced for user ${username}`);
            // session.character = newCharacter;
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
    isUsernameTaken,
    getAccount
};