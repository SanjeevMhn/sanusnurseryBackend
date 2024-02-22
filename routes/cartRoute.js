const router = require('express').Router();
const cartController = require('../controllers/cartController');


router.route('/:id')
	.get(cartController.getCartData);


module.exports = router;