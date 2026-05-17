function createWorkout(req, res, { db }) {
  const { User_ID, Workout_Type, Duration, Calories_Burned } = req.body;
  const sql = `INSERT INTO Workouts (User_ID, Workout_Type, Duration, Calories_Burned) VALUES (?, ?, ?, ?)`;
  db.query(sql, [User_ID, Workout_Type, Duration, Calories_Burned], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error logging workout.' });
    }
    res.status(201).json({ message: 'Workout logged successfully!', workoutId: result.insertId });
  });
}

function getWorkouts(req, res, { db }) {
  const userId = req.params.userId;
  const sql = `SELECT * FROM Workouts WHERE User_ID = ? ORDER BY Workout_ID DESC`;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error fetching workouts.' });
    }
    res.json(results);
  });
}

module.exports = { createWorkout, getWorkouts };
