const categoryController = require('../controllers/categoryController');
const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyUserRoles');
const Role = require('../config/enums/roles');


router.route('/')
	.get(verifyJWT,verifyRoles(Role.Admin),categoryController.getAllCategories)
	.post(verifyJWT,verifyRoles(Role.Admin),categoryController.addCategory);


module.exports = router;