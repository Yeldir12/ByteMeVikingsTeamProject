
/**
 * Renders a view with the user object attached to it.
 * If json is provided, it will be returned as a JSON response
 * with the user object included.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {String} view - The view to render.
 * @param {Object} [json] - Optional JSON object to return as a JSON response.
 */
function renderPage(req, res, view, json = {}) {
    res.render(view, {
        user: req.session.user,
        ...json
    });
}

module.exports = {
    renderPage
}