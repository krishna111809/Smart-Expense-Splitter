const { getUserIdFromReq } = require('./auth');

// Middleware to protect routes
module.exports = (req, res, next) => {
  try {
    req.userId = getUserIdFromReq(req);
    return next();
  } catch (err) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
};
