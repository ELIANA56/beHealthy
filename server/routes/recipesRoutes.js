const express = require('express');
const recipesController = require('../controllers/recipesController');

module.exports = (db, ai) => {
  const router = express.Router();

  router.get('/recipes', (req, res) => recipesController.listRecipes(req, res, { db }));

  return router;
};
