const adminController = require('../controllers/adminController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyUserRoles');
const Role = require('../config/enums/roles');
const router = require('express').Router();

router.route('/count')
    .get(verifyJWT, verifyRoles(Role.Admin),adminController.countAll);

router.route('/users')
    .get(verifyJWT,verifyRoles(Role.Admin),adminController.getAllUsers);

router.route('/user/:id')
    .delete(verifyJWT,verifyRoles(Role.Admin), adminController.deleteUser);

module.exports = router;
