database = require("../database");

async function getUnacceptedQuests(username) {
  try {
    return await database.questsCollection.find({
      username: { $ne: username },     // not the session username
      acceptedUsers: { $size: 0 },     // empty array
      completed: false                 // not completed
    }).toArray();
  } catch (err) {
    console.log("ERROR GETTING QUESTS:", err);
    return [];
  }
}

async function newQuest(username, title, description, color, timeMins) {
  try {
    console.log("Adding request to database...");
    const result = await database.questsCollection.insertOne({
      username: username,
      title: title,
      description: description,
      color: color,
      timeMins: timeMins,
      acceptedUsers: [],
      completed: false
    });
    return true;
  } catch (err) {
    console.log("ERROR ADDING ACCOUNT:", err);
    return false;
  }
}

async function getAcceptedQuests(username) {
  try {
    return await database.questsCollection.find({
      acceptedUsers: username,   // user is inside the array
      completed: false           // quest not completed
    }).toArray();

  } catch (err) {
    console.log("ERROR GETTING ACCEPTED QUESTS:", err);
    return [];
  }
}

module.exports = { getUnacceptedQuests, getAcceptedQuests , newQuest };