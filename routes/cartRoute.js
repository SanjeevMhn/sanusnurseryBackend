const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const cartController = require('../controllers/cartController');


router.route('/:id')
	.get(cartController.getCartData);

router.route('/')
	.post(verifyJWT,cartController.addCartData)

module.exports = router;