const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const cartController = require('../controllers/cartController');


router.route('/:id')
	.get(verifyJWT,cartController.getCartData);

router.route('/')
	.post(verifyJWT,cartController.addCartData)
	.patch(verifyJWT,cartController.updateCartDataQuantity)

router.route('/delete')
	.post(verifyJWT,cartController.removeCartData)

router.route('/clear/:id')
	.post(verifyJWT,cartController.clearCart)

module.exports = router;
