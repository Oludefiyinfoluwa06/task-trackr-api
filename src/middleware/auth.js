const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me';

module.exports = function auth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
