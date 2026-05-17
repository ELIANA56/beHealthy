const express = require('express');
const router = express.Router();
const { analyze, getMeals } = require('../controllers/analysisController');

router.post('/meals/analyze', analyze);
router.get('/meals/:userId', getMeals);

module.exports = router;
