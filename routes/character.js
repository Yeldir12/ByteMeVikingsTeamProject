// routes/users.js
const express = require('express');
const router = express.Router();


//Each of these routers are sub routes of this route

// Define a route
router.get('/', (req, res) => {
    res.send('<h1>Character</h1>');// this gets executed when user visit http://localhost:3000/user
});

router.get('/101', (req, res) => {
    res.send('this is homepage 101 route');// this gets executed when user visit http://localhost:3000/user/101
});

router.get('/102', (req, res) => {
    res.send('this is homepage 102 route');// this gets executed when user visit http://localhost:3000/user/102
});

// export the router module so that server.js file can use it
module.exports = router;