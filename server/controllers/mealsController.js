async function analyze(req, res, { db, ai }) {
  try {
    const { User_ID, Meal_Type, Image_Base64 } = req.body;
    if (!Image_Base64) return res.status(400).json({ error: 'Please provide an image of your meal.' });

    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Analyze this meal image for a health application. Provide your output ONLY as a strict JSON object with these exact keys, no conversational text, no markdown block: {"Protein_Grams": float, "Carbs_Grams": float, "Fats_Grams": float, "Total_Calories": integer}`;
    const imagePart = { inlineData: { data: Image_Base64, mimeType: 'image/jpeg' } };
    const aiResult = await model.generateContent([prompt, imagePart]);
    const mealAnalysis = JSON.parse(aiResult.response.text().trim());

    const { Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories } = mealAnalysis || {};
    const fakeImagePath = 'uploads/meal_' + Date.now() + '.jpg';

    const sql = `INSERT INTO Meals_Log (User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Timestamp, Total_Calories, Image_Path) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`;
    db.query(sql, [User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories, fakeImagePath], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error saving meal to database.' });
      }
      res.status(201).json({ message: 'Meal analyzed and logged successfully!', mealId: result.insertId, analysis: mealAnalysis });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze meal image.' });
  }
}

function getMeals(req, res, { db }) {
  const userId = req.params.userId;
  const sql = `SELECT * FROM Meals_Log WHERE User_ID = ? ORDER BY Timestamp DESC`;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error fetching meals.' });
    }
    res.json(results);
  });
}

module.exports = { analyze, getMeals };
