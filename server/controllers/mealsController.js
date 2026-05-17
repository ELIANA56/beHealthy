const mealsModel = require('../models/mealsModel');
const aiService = require('../services/aiService');

async function analyze(req, res, { db, ai }) {
  try {
    const { User_ID, Meal_Type, Image_Base64 } = req.body;
    if (!Image_Base64) return res.status(400).json({ error: 'Please provide an image of your meal.' });

    // Use centralized aiService to analyze the meal image (returns parsed JSON)
    const mealAnalysis = await aiService.analyzeMeal(Image_Base64);
    const { Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories } = mealAnalysis || {};

    const mealId = await mealsModel.insertMeal(db, { User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories });
    res.status(201).json({ message: 'Meal analyzed and logged successfully!', mealId, analysis: mealAnalysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze meal image.' });
  }
}

async function getMeals(req, res, { db }) {
  try {
    const userId = req.params.userId;
    const results = await mealsModel.getMealsByUser(db, userId);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching meals.' });
  }
}

module.exports = { analyze, getMeals };
