const database = require("../database");
const { ObjectId } = require("mongodb");

// Get unaccepted quests
async function getUnacceptedQuests(username) {
  try {
    return await database.questsCollection.find({
      username: { $ne: username },
      acceptedUsers: { $size: 0 },
      rejectedUsers: { $ne: username }, // exclude if user rejected
      completed: false
    }).toArray();
  } catch (err) {
    console.log("ERROR GETTING QUESTS:", err);
    return [];
  }
}

async function getQuest(idString) {
  try {
    return await database.questsCollection.findOne({ _id: new ObjectId(idString) });
  } catch (err) {
    console.log("ERROR GETTING QUEST:", err);
    return null;
  }
}

// Add a new quest
async function newQuest(username, title, description, color, timeMins) {
  try {
    console.log("Adding request to database...");
    await database.questsCollection.insertOne({
      username,
      title,
      description,
      color,
      timeMins,
      acceptedUsers: [],
      rejectedUsers: [],   // initialize rejectedUsers
      completed: false
    });
    return true;
  } catch (err) {
    console.log("ERROR ADDING QUEST:", err);
    return false;
  }
}

// Get quests accepted by user
async function getAcceptedQuests(username, getAll = false) {
  try {
    if (getAll) {
      return await database.questsCollection.find({
        acceptedUsers: username
      }).toArray();
    } else {
      return await database.questsCollection.find({
        acceptedUsers: username,
        completed: false
      }).toArray();
    }
  } catch (err) {
    console.log("ERROR GETTING ACCEPTED QUESTS:", err);
    return [];
  }
}

//Get quests created by user
async function getMyQuests(username, getAll = false) {
  try {
    if (getAll) {
      return await database.questsCollection.find({
        username: username
      }).toArray();
    } else {
      return await database.questsCollection.find({
        username: username,
        completed: false
      }).toArray();
    }
  } catch (err) {
    console.log("ERROR GETTING ACCEPTED QUESTS:", err);
    return [];
  }
}

// Accept a quest
async function acceptQuest(idString, username) {
  try {
    const result = await database.questsCollection.updateOne(
      { _id: new ObjectId(idString) },
      { $addToSet: { acceptedUsers: username } } // avoids duplicates
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.log("ERROR ACCEPTING QUEST:", err);
    return false;
  }
}

// Reject a quest
async function rejectQuest(idString, username) {
  try {
    const result = await database.questsCollection.updateOne(
      { _id: new ObjectId(idString) },
      { $addToSet: { rejectedUsers: username } }
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.log("ERROR REJECTING QUEST:", err);
    return false;
  }
}

// Close a quest
async function closeQuest(idString) {
  try {
    const result = await database.questsCollection.updateOne(
      { _id: new ObjectId(idString) },
      { $set: { completed: true } }
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.log("ERROR CLOSING QUEST:", err);
    return false;
  }
}

async function addMessage(questDbId, username, messageText, attachments = []) {
  try {
    let questEntry = await database.messageCollection.findOne({ questDbId });

    const newMessage = {
      username,
      timestamp: new Date(), // store as Date
      message: messageText,
      attachments
    };

    if (!questEntry) {
      // No entry exists → create a new document
      const newDoc = {
        questDbId,
        messages: [newMessage]
      };
      const result = await database.messageCollection.insertOne(newDoc);
      console.log('Created new quest entry with message:', result.insertedId);
      return true;
    } else {
      // Entry exists → append message
      await database.messageCollection.updateOne(
        { questDbId },
        { $push: { messages: newMessage } }
      );
      console.log('Appended message to existing quest entry');
      return true;
    }
  } catch (err) {
    console.error('Error adding message:', err);
    return false;
  }
}


// Delete the entire quest (all messages)
async function deleteQuestThread(questDbId) {
  try {
    await database.messageCollection.deleteOne({ questDbId });
    console.log(`Quest ${questDbId} deleted`);
  } catch (err) {
    console.error('Error deleting quest:', err);
  }
}

async function getMessages(questDbId) {
  try {
    const results = await database.messageCollection.find({ questDbId }).toArray();

    if (results.length === 0) {
      return [];
    }

    const entry = results[0]; // grab the first object

    if (entry?.messages !== undefined) {
      console.log("Fetched messages:", entry.messages);
      return entry.messages;
    }
    console.log("Fetched invalid messages:", entry);
    return [];

  } catch (err) {
    console.error("Error fetching messages:", err);
    throw err;
  }
}



module.exports = {
  getUnacceptedQuests,
  getAcceptedQuests,
  newQuest,
  acceptQuest,
  rejectQuest,
  closeQuest,
  getQuest,
  addMessage,
  getMessages,
  getMyQuests,
  deleteQuestThread
};
