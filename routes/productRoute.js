const productController = require('../controllers/productController');
const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyUserRoles');
const Role = require('../config/enums/roles');
const uploader = require('../config/multer/multer');


router.route('/')
    .get(productController.getAllProducts)
    .post(verifyJWT,verifyRoles(Role.Admin),uploader.single('image'),productController.addProduct);

router.route('/id/:id')
    .get(productController.getProductById)
    .patch(verifyJWT,verifyRoles(Role.Admin),uploader.single('image'),productController.updateProduct)
    .delete(verifyJWT,verifyRoles(Role.Admin),productController.deleteProduct);

router.route('/category/:category').get(productController.getProductsByCategory);
router.route('/category/related/:category').get(productController.getRelatedProducts);
router.route('/category/id/:id').get(productController.getProductCategoryById);
router.route('/categories').get(productController.getProductCategories);

router.route('/name').get(productController.searchProductsByName);

router.route('/count').get(verifyJWT,verifyRoles(Role.Admin),productController.countAll);

module.exports = router;