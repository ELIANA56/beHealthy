const express = require('express');
const articlesController = require('../controllers/articlesController');

module.exports = (db, ai) => {
  const router = express.Router();

  router.get('/articles', (req, res) => articlesController.listArticles(req, res, { db }));

  return router;
};
