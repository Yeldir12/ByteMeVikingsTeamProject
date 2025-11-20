// const http = require('http');
// const server = http.createServer((req, res) => {
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
 * npm install ejs
 */


const express = require("express");
const path = require('path');
const app = express();

app.set('view engine', 'ejs'); // tell Express to use EJS
//Set the views to be in the views folder
app.set('views', path.join(__dirname, 'middlewares/views')); // folder for EJS files
app.use(express.static('middlewares/public'));

//This is our root route (just / )
// app.get('/', (req, res) => {
//     res.send('<h1>Hello World</h1>'); // res.send('Hello World');
// });


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Include route files
const homeRoute = require('./routes/index');
app.use('/', homeRoute);

const questBoard = require('./routes/quest-board');
app.use('/quest-board', questBoard);

const questChat = require('./routes/quest-chat');
app.use('/quest-chat', questChat);

const requestHelp = require('./routes/request-help');
app.use('/request-help', requestHelp);

const character = require('./routes/character');
app.use('/character', character);


//Error Handling (MUST BE LAST)
app.use((req, res, next) => {
    res.status(404).render('404'); // looks for views/404.ejs
});
app.use((req, res, next) => {
    res.status(500).render('500');
});
