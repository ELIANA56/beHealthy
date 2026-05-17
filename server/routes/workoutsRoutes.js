const express = require('express');
const workoutsController = require('../controllers/workoutsController');

module.exports = (db, ai) => {
  const router = express.Router();

  router.post('/workouts', (req, res) => workoutsController.createWorkout(req, res, { db }));
  router.get('/workouts/:userId', (req, res) => workoutsController.getWorkouts(req, res, { db }));

  return router;
};
