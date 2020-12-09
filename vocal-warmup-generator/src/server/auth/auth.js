function requireLogin(req, res, next) {
  if (req.session && req.session.userId) {
    next();
    return;
  }
  return res.status(401).send({ error: 'Unathenticated' });
}

module.exports = { requireLogin };