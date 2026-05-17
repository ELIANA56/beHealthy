const express = require('express');
const mysql = require('mysql2');
const config = require('./config');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let ai = null;

async function initializeGeminiAI() {
    try {
        const genaiPkg = require('@google/generative-ai');
        const GoogleGenAI = genaiPkg.GoogleGenAI || genaiPkg.default || genaiPkg;

        if (typeof GoogleGenAI === 'function') {
            // If user has set an API key in env, prefer that; otherwise we still create a client
            const apiKey = process.env.GENAI_API_KEY || null;
            try {
                ai = new GoogleGenAI({ apiKey });
            } catch (e) {
                console.warn('[WARN] Failed to construct GoogleGenAI client, falling back to mock AI.');
                ai = null;
            }
        } else {
            console.warn('[WARN] @google/generative-ai is present but does not export a constructor. Using mock AI.');
            ai = null;
        }
    } catch (e) {
        console.warn('[WARN] @google/generative-ai not available; using mock AI.');
        ai = null;
    }

    // If ai is not available, set a safe mock that matches the minimal interface used by this server
    if (!ai) {
        ai = {
            getGenerativeModel: () => ({
                generateContent: async () => ({
                    // Keep the same shape the code expects: aiResult.response.text()
                    response: { text: () => JSON.stringify({ Protein_Grams: 0, Carbs_Grams: 0, Fats_Grams: 0, Total_Calories: 0 }) }
                })
            })
        };
        console.warn('[WARN] Gemini AI disabled - running with mock responses.');
        return;
    }

    // Optional quick health check (non-fatal)
    try {
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'ping' }] }], generationConfig: { maxOutputTokens: 1 } });
        console.log('[INFO] Gemini AI initialized and reachable.');
    } catch (err) {
        console.warn('[WARN] Gemini AI health check failed; continuing with mock fallback.');
        ai = {
            getGenerativeModel: () => ({
                generateContent: async () => ({ response: { text: () => JSON.stringify({ Protein_Grams: 0, Carbs_Grams: 0, Fats_Grams: 0, Total_Calories: 0 }) } })
            })
        };
    }
}

(async () => {
    await initializeGeminiAI();

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Create DB connection using config
    const dbConfig = config.db || {};
    const db = mysql.createConnection({
        host: dbConfig.host || 'localhost',
        user: dbConfig.user || 'behealthy',
        password: dbConfig.password || '',
        database: dbConfig.database || 'BeHealthyDB'
    });

    db.connect((err) => {
        if (err) {
            console.error('Error connecting to BeHealthyDB:', err.message || err);
        } else {
            console.log('Connected to BeHealthyDB successfully!');
        }
    });

    app.locals.ai = ai;
    app.locals.db = db;

    const authController = require('./controllers/authController');
    const mealsController = require('./controllers/mealsController');
    const workoutsController = require('./controllers/workoutsController');
    const recipesController = require('./controllers/recipesController');
    const articlesController = require('./controllers/articlesController');

    // --- AUTH & USERS ---
    app.post('/api/register', (req, res) => authController.register(req, res, { db }));
    app.post('/api/login', (req, res) => authController.login(req, res, { db }));

    // --- MEALS ---
    app.post('/api/meals', (req, res) => mealsController.analyze(req, res, { db, ai }));
    app.get('/api/meals/:userId', (req, res) => mealsController.getMeals(req, res, { db }));

    // --- WORKOUTS ---
    app.post('/api/workouts', (req, res) => workoutsController.createWorkout(req, res, { db }));
    app.get('/api/workouts/:userId', (req, res) => workoutsController.getWorkouts(req, res, { db }));

    // --- RECIPES ---
    app.get('/api/recipes', (req, res) => recipesController.listRecipes(req, res, { db }));

    // --- ARTICLES / CONTENT HUB ---
    app.get('/api/articles', (req, res) => articlesController.listArticles(req, res, { db }));

    const port = config.port || 3000;
    app.listen(port, () => console.log(`Server listening on port ${port}`));
})();