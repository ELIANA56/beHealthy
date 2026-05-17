const workoutsModel = require('../models/workoutsModel');

async function createWorkout(req, res, { db }) {
  try {
    const { User_ID, Workout_Type, Duration, Calories_Burned } = req.body;
    const workoutId = await workoutsModel.createWorkout(db, { User_ID, Workout_Type, Duration, Calories_Burned });
    res.status(201).json({ message: 'Workout logged successfully!', workoutId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging workout.' });
  }
}

async function getWorkouts(req, res, { db }) {
  try {
    const userId = req.params.userId;
    const results = await workoutsModel.getWorkoutsByUser(db, userId);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching workouts.' });
  }
}

module.exports = { createWorkout, getWorkouts };
