// Validation middleware for /api/login
module.exports = function validateLogin(req, res, next) {
  const { Email, Password } = req.body;
  if (!Email || !Password) return res.status(400).json({ error: 'Email and Password required' });

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(String(Email).toLowerCase())) return res.status(400).json({ error: 'Invalid email format.' });

  if (String(Password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long.' });

  next();
};
