const express = require('express');
const router = express.Router();
const routeUtils = require('./routeUtils');


router.get('/', (req, res) => {
  routeUtils.renderPage(req, res, 'index');
});

module.exports = router;

/**
express.static('public')
This creates middleware that serves static files (like .html, .css, .js, images) from the public folder.
It looks at the URL of the request, tries to find a matching file inside public, and sends it back automatically.

router.use()
Attaches that middleware to your router (or app) so every request that hits this router first checks the static
folder before moving on to other routes.
*/

//router.use(express.static('middlewares/public'));
// router.get('/', (req, res) => {
//   res.render(path.join(__dirname, 'index.html'));
// });
// router.get('/101', (req, res) => {
//     res.send('this is homepage 101 route');// this gets executed when user visit http://localhost:3000/user/101
// });