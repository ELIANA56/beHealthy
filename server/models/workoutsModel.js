function createWorkout(db, { User_ID, Workout_Type, Duration, Calories_Burned }) {
  const sql = `INSERT INTO Workouts (User_ID, Workout_Type, Duration, Calories_Burned) VALUES (?, ?, ?, ?)`;
  return new Promise((resolve, reject) => {
    db.query(sql, [User_ID, Workout_Type, Duration, Calories_Burned], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
}

function getWorkoutsByUser(db, userId) {
  const sql = `SELECT * FROM Workouts WHERE User_ID = ? ORDER BY Workout_ID DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = { createWorkout, getWorkoutsByUser };
