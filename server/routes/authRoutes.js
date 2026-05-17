const authController = require('../controllers/authController');
const validateRegister = require('../middleware/validateRegister');
const validateLogin = require('../middleware/validateLogin');

module.exports = (db, ai) => {
  const router = require('express').Router();

  router.post('/register', validateRegister, (req, res) => authController.register(req, res, { db, ai }));
  router.post('/login', validateLogin, (req, res) => authController.login(req, res, { db, ai }));

  return router;
};
