// routes/users.js
const express = require('express');
const path = require('path');

const router = express.Router();



/**
 *
 * express.static('public')
    This creates middleware that serves static files (like .html, .css, .js, images) from the public folder.
    It looks at the URL of the request, tries to find a matching file inside public, and sends it back automatically.

    router.use()
    Attaches that middleware to your router (or app) so every request that hits this router first checks the static
    folder before moving on to other routes.
*/
router.use(express.static('middlewares/public')); //Set the base directory to public


router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

router.get('/101', (req, res) => {
    res.send('this is homepage 101 route');// this gets executed when user visit http://localhost:3000/user/101
});

router.get('/102', (req, res) => {
    res.send('this is homepage 102 route');// this gets executed when user visit http://localhost:3000/user/102
});

// export the router module so that server.js file can use it
module.exports = router;