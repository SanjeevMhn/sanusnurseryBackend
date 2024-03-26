const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const userController = require('../controllers/userController');
const verifyUserRoles = require('../middleware/verifyUserRoles');
const Role = require('../config/enums/roles');

router.route('/:id')
  .patch(verifyJWT,userController.updateUserData)

router.route('/order-history/:id')
  .get(verifyJWT,verifyUserRoles(Role.Admin,Role.User),userController.getUserOrderHistory)

module.exports = router;
