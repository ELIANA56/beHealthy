const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
// Try to load the Google generative AI client. If it doesn't export a constructor
// (or isn't installed), fall back to a harmless mock to avoid crashing the server.
let ai;
try {
    const genaiPkg = require('@google/generative-ai');
    const GoogleGenAI = genaiPkg.GoogleGenAI || genaiPkg.default || genaiPkg;
    if (typeof GoogleGenAI === 'function') {
        ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY || "AIzaSyCdD_N_2FYvceMf83iFrd9MGlA-Ilm9Rsg" });
    } else {
        console.warn('GoogleGenAI is not a constructor; using mock AI implementation.');
        ai = { getGenerativeModel: () => ({ generateContent: async () => ({ response: { text: () => '{}' } }) }) };
    }
} catch (err) {
    console.warn('Could not load @google/generative-ai; using mock AI implementation.', err && err.message);
    ai = { getGenerativeModel: () => ({ generateContent: async () => ({ response: { text: () => '{}' } }) }) };
}
const app = express();

// --- מפענחים ו-Middleware ---
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- התחברות למסד הנתונים ---
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ofakim123?",
    database: "BeHealthyDB"
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to BeHealthyDB:", err);
        return;
    }
    console.log("Connected to BeHealthyDB successfully!");
});

// --- Gemini AI config: using the client or mock created above ---


// ==========================================
// 1. נתיבי התחברות והרשמה (AUTH & USERS)
// ==========================================

// א. הרשמה (Sign Up)
app.post('/api/register', (req, res) => {
    const { Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type, Email, Password } = req.body;

    const sqlUser = `INSERT INTO Users (Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type) VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sqlUser, [Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error creating profile." });
        }

        const newUserId = result.insertId;
        const sqlAuth = `INSERT INTO User_Auth (User_ID, Email, Password_Hash, Last_Login) VALUES (?, ?, ?, NOW())`;

        db.query(sqlAuth, [newUserId, Email, Password], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Error creating credentials." });
            }
            res.status(201).json({ message: "Account created successfully!", userId: newUserId });
        });
    });
});

// ב. התחברות (Login)
app.post('/api/login', (req, res) => {
    const { Email, Password } = req.body;
    const sql = `SELECT User_ID, Email, Password_Hash FROM User_Auth WHERE Email = ?`;

    db.query(sql, [Email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error." });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: "User not found." });
        }

        const user = results[0];
        if (user.Password_Hash === Password) {
            db.query("UPDATE User_Auth SET Last_Login = NOW() WHERE User_ID = ?", [user.User_ID]);
            res.json({ message: "Login successful", userId: user.User_ID });
        } else {
            res.status(401).json({ error: "Incorrect password." });
        }
    });
});


// ==========================================
// 2. יומן ארוחות חכם (MEALS LOG)
// ==========================================

// א. POST - קבלת תמונה, ניתוח ב-Gemini ושמירה ב-DB
app.post('/api/meals', async (req, res) => {
    try {
        const { User_ID, Meal_Type, Image_Base64 } = req.body;

        if (!Image_Base64) {
            return res.status(400).json({ error: "Please provide an image of your meal." });
        }

        // פנייה ל-Gemini לניתוח הרכיבים התזונתיים של הצלחת
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Analyze this meal image for a health application. Provide your output ONLY as a strict JSON object with these exact keys, no conversational text, no markdown block: {"Protein_Grams": float, "Carbs_Grams": float, "Fats_Grams": float, "Total_Calories": integer}`;

        const imagePart = { inlineData: { data: Image_Base64, mimeType: "image/jpeg" } };
        const aiResult = await model.generateContent([prompt, imagePart]);
        const mealAnalysis = JSON.parse(aiResult.response.text().trim());

        const { Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories } = mealAnalysis;
        const fakeImagePath = "uploads/meal_" + Date.now() + ".jpg";

        // שמירה בדאטה-בייס
        const sql = `INSERT INTO Meals_Log (User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Timestamp, Total_Calories, Image_Path) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`;

        db.query(sql, [User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories, fakeImagePath], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Error saving meal to database." });
            }
            res.status(201).json({ message: "Meal analyzed and logged successfully!", mealId: result.insertId, analysis: mealAnalysis });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to analyze meal image." });
    }
});

// ב. GET - שליפת היסטוריית הארוחות של המשתמש
app.get('/api/meals/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT * FROM Meals_Log WHERE User_ID = ? ORDER BY Timestamp DESC`;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error fetching meals." });
        }
        res.json(results);
    });
});


// ==========================================
// 3. אימונים (WORKOUTS)
// ==========================================

// א. POST - שמירת אימון חדש
app.post('/api/workouts', (req, res) => {
    const { User_ID, Workout_Type, Duration, Calories_Burned } = req.body;
    const sql = `INSERT INTO Workouts (User_ID, Workout_Type, Duration, Calories_Burned) VALUES (?, ?, ?, ?)`;

    db.query(sql, [User_ID, Workout_Type, Duration, Calories_Burned], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error logging workout." });
        }
        res.status(201).json({ message: "Workout logged successfully!", workoutId: result.insertId });
    });
});

// ב. GET - שליפת היסטוריית האימונים של משתמש ספציפי
app.get('/api/workouts/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT * FROM Workouts WHERE User_ID = ? ORDER BY Workout_ID DESC`;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error fetching workouts." });
        }
        res.json(results);
    });
});


// ==========================================
// 4. מאגר מתכונים (RECIPES)
// ==========================================

// א. GET - שליפת כל המתכונים שיש במערכת
app.get('/api/recipes', (req, res) => {
    const sql = `SELECT * FROM Recipes ORDER BY Recipe_ID DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error fetching recipes." });
        }
        res.json(results);
    });
});


// ==========================================
// 5. תוכן ומאמרים (CONTENT HUB)
// ==========================================

// א. GET - שליפת כל המאמרים של "אליענה & אליענה" לבלוג
app.get('/api/articles', (req, res) => {
    const sql = `SELECT * FROM Content_Hub ORDER BY Article_ID DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error fetching articles." });
        }
        res.json(results);
    });
});


// --- הפעלת השרת על פורט 3000 ---
app.listen(3000, () => console.log("Authentication & Feature server listening on port 3000"));