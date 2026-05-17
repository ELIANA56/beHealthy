const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userModel = require('../models/userModel');

async function register(req, res, { db }) {
  try {
    const { Full_Name, Age, Weight, Height, Goal_Type, Gender, Email, Password } = req.body;

    const ageNum = Number(Age);
    const weightKg = Number(Weight) || 0;
    const heightCm = Number(Height) || 0;
    const activityFactor = Number(req.body.Activity_Factor || req.body.ActivityLevel) || 1.2;
    let bmr;
    if (Gender && /f|female/i.test(Gender)) {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
    }
    const Daily_Calorie_Budget = Math.round(bmr * activityFactor);
//השמירה בטבלת המשתמשים. הקונטרולר קורא לפונקציה createUser מתוך המודל,
//  ומעביר לה את החיבור ל-db ואת נתוני המשתמש. הוא משתמש ב-await כדי לחכות ש-MySQL יסיים להכניס את השורה,
//  ומקבל בחזרה את ה-ID החדש שנוצר (למשל 55) ושומר אותו ב-newUserId.
    // create user row (Email now stored on Users table)
    const newUserId = await userModel.createUser(db, { Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type, Gender, Email });
    const passwordHash = bcrypt.hashSync(Password, 10);
    // store auth record linked by User_ID (no Email in User_Auth anymore)
    await userModel.createAuth(db, { User_ID: newUserId, Password_Hash: passwordHash });

    const token = jwt.sign({ userId: newUserId, email: Email }, config.jwtSecret, { expiresIn: '7d' });
    res.status(201).json({ message: 'Account created successfully!', userId: newUserId, token, Daily_Calorie_Budget });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed.' });
  }
}

async function login(req, res, { db }) {
  try {
    const { Email, Password } = req.body;

    // Step 1: find user by email in Users table
    const user = await userModel.findUserByEmail(db, Email);
    if (!user) return res.status(401).json({ error: 'User not found.' });

    // Step 2: fetch password hash from User_Auth using User_ID
    const auth = await userModel.getPasswordHashByUserId(db, user.User_ID);
    if (!auth || !auth.Password_Hash) return res.status(401).json({ error: 'Authentication record not found.' });

    // Step 3: compare
    const match = bcrypt.compareSync(Password, auth.Password_Hash);
    if (!match) return res.status(401).json({ error: 'Incorrect password.' });

    await userModel.updateLastLogin(db, user.User_ID);
    const token = jwt.sign({ userId: user.User_ID, email: user.Email }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ message: 'Login successful', userId: user.User_ID, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed.' });
  }
}

module.exports = { register, login };
