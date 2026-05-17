// Validation middleware for /api/register
module.exports = async function validateRegister(req, res, next) {
  const { Full_Name, Age, Weight, Height, Goal_Type, Gender, Email, Password } = req.body;

  const missing = [];
  ['Full_Name', 'Age', 'Weight', 'Height', 'Goal_Type', 'Gender', 'Email', 'Password'].forEach((k) => {
    if (req.body[k] === undefined || req.body[k] === null || String(req.body[k]).trim() === '') missing.push(k);
  });
  if (missing.length) return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(String(Email).toLowerCase())) return res.status(400).json({ error: 'Invalid email format.' });

  if (String(Password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long.' });

  const ageNum = Number(Age);
  const weightNum = Number(Weight);
  const heightNum = Number(Height);
  if (!Number.isFinite(ageNum) || ageNum < 10 || ageNum > 120) return res.status(400).json({ error: 'Age must be a number between 10 and 120.' });
  if (!Number.isFinite(weightNum) || weightNum < 20 || weightNum > 400) return res.status(400).json({ error: 'Weight (kg) must be a number between 20 and 400.' });
  if (!Number.isFinite(heightNum) || heightNum < 50 || heightNum > 272) return res.status(400).json({ error: 'Height (cm) must be a number between 50 and 272.' });

  // Check DB to ensure email is not already registered
  try {
    const db = req.app && req.app.locals && req.app.locals.db;
    if (!db) return res.status(500).json({ error: 'Database connection not available for validation.' });

    const emailExists = await new Promise((resolve, reject) => {
      db.query('SELECT User_ID FROM Users WHERE Email = ? LIMIT 1', [Email], (err, results) => {
        if (err) return reject(err);
        resolve((results && results.length > 0));
      });
    });

    if (emailExists) return res.status(400).json({ error: 'Email already registered.' });
  } catch (err) {
    console.error('validateRegister DB check error:', err);
    return res.status(500).json({ error: 'Validation failed due to server error.' });
  }

  next();
};
