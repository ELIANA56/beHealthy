const recipesModel = require('../models/recipesModel');

async function listRecipes(req, res, { db }) {
  try {
    const results = await recipesModel.listRecipes(db);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching recipes.' });
  }
}

module.exports = { listRecipes };
