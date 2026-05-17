require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const config = require('./config');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const aiService = require('./services/aiService');
let ai = null;

(async () => {
    // initialize AI via aiService (returns real client or mock)
    try {
        ai = await aiService.initAI();
    } catch (e) {
        console.warn('[WARN] aiService.initAI() failed, using internal mock.');
        ai = { getGenerativeModel: () => ({ generateContent: async () => ({ response: { text: () => JSON.stringify({ Protein_Grams: 0, Carbs_Grams: 0, Fats_Grams: 0, Total_Calories: 0 }) } }) }) };
    }

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

    const authRoutes = require('./routes/authRoutes')(db, ai);
    const mealsRoutes = require('./routes/mealsRoutes')(db, ai);
    const workoutsRoutes = require('./routes/workoutsRoutes')(db, ai);
    const recipesRoutes = require('./routes/recipesRoutes')(db, ai);
    const articlesRoutes = require('./routes/articlesRoutes')(db, ai);

    app.use('/api', authRoutes);
    app.use('/api', mealsRoutes);
    app.use('/api', workoutsRoutes);
    app.use('/api', recipesRoutes);
    app.use('/api', articlesRoutes);

    const port = config.port || 3000;
    app.listen(port, () => console.log(`Server listening on port ${port}`));
})();