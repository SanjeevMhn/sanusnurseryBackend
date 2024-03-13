const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const userController = require('../controllers/userController');

router.route('/:id')
  .patch(verifyJWT,userController.updateUserData)

router.route('/order-history/:id')
  .get(verifyJWT,userController.getUserOrderHistory)

module.exports = router;
