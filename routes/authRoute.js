const router = require('express').Router();
const Role = require('../config/enums/roles');
const authController = require('../controllers/authController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyUserRoles = require('../middleware/verifyUserRoles');

router.route('/').post(authController.handleLogin);
router.route('/register').post(authController.handleUserRegistration)
router.route('/logout').post(authController.handleUserLogout);
router.route('/me').get(verifyJWT,verifyUserRoles(Role.Admin,Role.User),authController.getUserData);
router.route('/email').post(authController.getUserByEmail);

module.exports = router;
