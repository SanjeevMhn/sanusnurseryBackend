const productController = require('../controllers/productController');
const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyUserRoles');
const Role = require('../config/enums/roles');

router.route('/')
    .get(productController.getAllProducts)
    .post(verifyJWT,verifyRoles(Role.Admin),productController.addProduct);

router.route('/id/:id')
    .get(productController.getProductById)
    .patch(verifyJWT,verifyRoles(Role.Admin),productController.updateProduct)
    .delete(verifyJWT,verifyRoles(Role.Admin),productController.deleteProduct);

router.route('/category/:category').get(productController.getProductsByCategory);
router.route('/categories').get(productController.getProductCategories);

router.route('/name').get(productController.searchProductsByName);

module.exports = router;