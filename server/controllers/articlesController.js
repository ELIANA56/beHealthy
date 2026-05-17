const articlesModel = require('../models/articlesModel');

async function listArticles(req, res, { db }) {
  try {
    const results = await articlesModel.listArticles(db);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching articles.' });
  }
}

module.exports = { listArticles };
