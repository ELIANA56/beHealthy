const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

async function register(req, res, { db }) {
  try {
    const { Full_Name, Age, Weight, Height, Goal_Type, Gender, Email, Password } = req.body;

    const weightKg = Number(Weight) || 0;
    const heightCm = Number(Height) || 0;
    const ageNum = Number(Age) || 0;
    const activityFactor = Number(req.body.Activity_Factor || req.body.ActivityLevel) || 1.2;
    let bmr;
    if (Gender && /f|female/i.test(Gender)) {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
    }
    const Daily_Calorie_Budget = Math.round(bmr * activityFactor);

    const sqlUser = `INSERT INTO Users (Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type, Gender) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sqlUser, [Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type, Gender], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error creating profile.' });
      }

      const newUserId = result.insertId;
      const passwordHash = bcrypt.hashSync(Password || '', 10);
      const sqlAuth = `INSERT INTO User_Auth (User_ID, Email, Password_Hash, Last_Login) VALUES (?, ?, ?, NOW())`;

      db.query(sqlAuth, [newUserId, Email, passwordHash], (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ error: 'Error creating credentials.' });
        }
        const token = jwt.sign({ userId: newUserId, email: Email }, config.jwtSecret, { expiresIn: '7d' });
        res.status(201).json({ message: 'Account created successfully!', userId: newUserId, token, Daily_Calorie_Budget });
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed.' });
  }
}

function login(req, res, { db }) {
  const { Email, Password } = req.body;
  const sql = `SELECT User_ID, Email, Password_Hash FROM User_Auth WHERE Email = ?`;

  db.query(sql, [Email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error.' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const user = results[0];
    const match = bcrypt.compareSync(Password || '', user.Password_Hash);
    if (match) {
      db.query('UPDATE User_Auth SET Last_Login = NOW() WHERE User_ID = ?', [user.USER_ID || user.User_ID]);
      const token = jwt.sign({ userId: user.User_ID, email: user.Email }, config.jwtSecret, { expiresIn: '7d' });
      res.json({ message: 'Login successful', userId: user.User_ID, token });
    } else {
      res.status(401).json({ error: 'Incorrect password.' });
    }
  });
}

module.exports = { register, login };
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.register = (req, res) => {
  const db = require('../connection');
  const { Full_Name, Age, Weight, Height, Goal_Type, Gender, Email, Password } = req.body;
  if (!Email || !Password) return res.status(400).json({ error: 'Email and Password required' });

  // Calculate Daily Calorie Budget using Mifflin-St Jeor
  const weightKg = Number(Weight) || 0;
  const heightCm = Number(Height) || 0;
  const ageNum = Number(Age) || 0;
  const activityFactor = Number(req.body.Activity_Factor || req.body.ActivityLevel) || 1.2; // default sedentary
  let bmr;
  if (Gender && /f|female/i.test(Gender)) {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
  }
  const Daily_Calorie_Budget = Math.round(bmr * activityFactor);

  const sqlUser = `INSERT INTO Users (Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type, Gender) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sqlUser, [Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type, Gender], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error creating profile.' });
    }
    const newUserId = result.insertId;
    const passwordHash = bcrypt.hashSync(Password, 10);
    const sqlAuth = `INSERT INTO User_Auth (User_ID, Email, Password_Hash, Last_Login) VALUES (?, ?, ?, NOW())`;
    db.query(sqlAuth, [newUserId, Email, passwordHash], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Error creating credentials.' });
      }
      const token = jwt.sign({ userId: newUserId, email: Email }, config.jwtSecret, { expiresIn: '7d' });
      res.status(201).json({ message: 'Account created successfully!', userId: newUserId, token });
    });
  });
};

exports.login = (req, res) => {
  const db = req.app.locals.db;
  const { Email, Password } = req.body;
  if (!Email || !Password) return res.status(400).json({ error: 'Email and Password required' });

  const sql = `SELECT User_ID, Email, Password_Hash FROM User_Auth WHERE Email = ?`;
  db.query(sql, [Email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error.' });
    }
    if (results.length === 0) return res.status(401).json({ error: 'User not found.' });

    const user = results[0];
    const match = bcrypt.compareSync(Password, user.Password_Hash);
    if (!match) return res.status(401).json({ error: 'Incorrect password.' });

    db.query('UPDATE User_Auth SET Last_Login = NOW() WHERE User_ID = ?', [user.User_ID]);
    const token = jwt.sign({ userId: user.User_ID, email: user.Email }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ message: 'Login successful', userId: user.User_ID, token });
  });
};
