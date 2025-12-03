const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'questseekers';

async function main(){
    const client = new MongoClient(url);
    await client.connect(); //Wait until client connects
    console.log('Connected to MongoDB');

    //Admin is the object that we use to interact with the database
    const admin = client.db(dbName).admin();
    console.log(await admin.serverStatus());
    console.log(await admin.listDatabases());
    // client.close();
}

main();