const productController = require('../controllers/productController');
const router = require('express').Router();

router.route('/')
    .get(productController.getAllProducts)
    .post(productController.addProduct);

router.route('/id/:id')
    .get(productController.getProductById)
    .patch(productController.updateProduct)
    .delete(productController.deleteProduct);

router.route('/category/:category').get(productController.getProductsByCategory);

module.exports = router;