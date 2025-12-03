const express = require('express');
const router = express.Router();

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

router.get('/', requireLogin, (req, res) => {
    res.render('quest-board', {
        user: req.session.user   // optional: send user to the page
    });
});

module.exports = router;
