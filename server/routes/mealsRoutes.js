const express = require('express');
const mealsController = require('../controllers/mealsController');

module.exports = (db, ai) => {
  const router = express.Router();

  router.post('/meals', (req, res) => mealsController.analyze(req, res, { db, ai }));
  router.get('/meals/:userId', (req, res) => mealsController.getMeals(req, res, { db }));

  return router;
};
