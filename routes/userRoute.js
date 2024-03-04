const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const userController = require('../controllers/userController');

router.route('/:id')
  .patch(verifyJWT,userController.updateUserData);

module.exports = router;
