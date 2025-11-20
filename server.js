// const http = require('http');
// const server = http.createServer((req, res) => {
//     //Set response headers
//     res.writeHead(200, { 'Content-Type': 'text/html' });

//     res.write('Hello World');
//     res.end();
// });
// const port = 3000;
// server.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}/`);
// });

/**
 * Creating a server using Node.js and Express.js
 * npm init -y
 * npm install express
 */

const express = require("express");
const app = express();
app.use(express.static('middlewares/public'));

//This is our root route (just / )
app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>'); // res.send('Hello World');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Include route files
const indexRoute = require('./routes/homepage');
app.use('/home', indexRoute);

const questBoard = require('./routes/quest-board');
app.use('/quest-board', questBoard);

const questChat = require('./routes/quest-chat');
app.use('/quest-chat', questChat);

const requestHelp = require('./routes/request-help');
app.use('/request-help', requestHelp);

const character = require('./routes/character');
app.use('/character', character);