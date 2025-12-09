const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
 
// Load environment variables from .env file
dotenv.config();
 
const userName = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;


const uri = `mongodb+srv://${userName}:${password}@questdatabase.pqhnow6.mongodb.net/?appName=QuestDatabase`;
 
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
 
async function connect() {
  try {
    console.log("CONNECTING...");
    await client.connect();
    console.log("CONNECTED to MongoDB yay!");
  } catch (err) {
    console.error("Error connecting to MongoDB:",err);
  }
}

// Connect to the database and set up the collection
const db = client.db("board-data");
const accountsCollection = db.collection("accounts");
 
// Export client, db, and collectionName for use in other files
module.exports = { client, db, accountsCollection, connect };
 
