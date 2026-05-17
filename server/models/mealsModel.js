function insertMeal(db, { User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories }) {
  const sql = `INSERT INTO Meals_Log (User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories, Timestamp) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
  const params = [User_ID, Meal_Type, Protein_Grams, Carbs_Grams, Fats_Grams, Total_Calories];
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
}

function getMealsByUser(db, userId) {
  const sql = `SELECT * FROM Meals_Log WHERE User_ID = ? ORDER BY Timestamp DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = { insertMeal, getMealsByUser };
