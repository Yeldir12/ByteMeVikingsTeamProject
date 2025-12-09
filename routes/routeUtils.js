
function renderPage(req, res, view) {
    res.render(view, {
        user: req.session.user
    });
}

module.exports = {
    renderPage
}