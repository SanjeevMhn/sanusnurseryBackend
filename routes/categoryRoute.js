const categoryController = require('../controllers/categoryController');
const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyUserRoles');
const Role = require('../config/enums/roles');


router.route('/')
	.get(verifyJWT,verifyRoles(Role.Admin),categoryController.getAllCategories)
	.post(verifyJWT,verifyRoles(Role.Admin),categoryController.addCategory);

router.route('/id/:id')
	.delete(verifyJWT,verifyRoles(Role.Admin),categoryController.deleteCategory)
	.patch(verifyJWT,verifyRoles(Role.Admin),categoryController.updateCategory)
	.get(verifyJWT, verifyRoles(Role.Admin),categoryController.getCategoryById)
module.exports = router;