const { analyzeMeal } = require('../services/aiService');
const db = require('../connection');

exports.analyze = async (req, res) => {
  const { User_ID, Meal_Type, Image_Base64 } = req.body;
  if (!Image_Base64 || !User_ID) return res.status(400).json({ error: 'User_ID and Image_Base64 required' });

  try {
    const analysis = await analyzeMeal(Image_Base64);
    const { Protein_Grams = 0, Carbs_Grams = 0, Fats_Grams = 0, Total_Calories = 0 } = analysis || {};
    const fakeImagePath = 'uploads/meal_' + Date.now() + '.jpg';
    const sql = `INSERT INTO Meals_Log (User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Timestamp, Total_Calories, Image_Path) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`;
    db.query(sql, [User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories, fakeImagePath], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error saving meal to database.' });
      }
      res.status(201).json({ message: 'Meal analyzed and logged successfully!', mealId: result.insertId, analysis });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI analysis failed' });
  }
};

exports.getMeals = async (req, res) => {
  const userId = req.params.userId;
  const sql = `SELECT * FROM Meals_Log WHERE User_ID = ? ORDER BY Timestamp DESC`;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error fetching meals.' });
    }
    res.json(results);
  });
};
