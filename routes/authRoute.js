const router = require('express').Router();
const authController = require('../controllers/authController');

router.route('/').post(authController.handleLogin);
router.route('/register').post(authController.handleUserRegistration)
router.route('/logout').post(authController.handleUserLogout);

module.exports = router;