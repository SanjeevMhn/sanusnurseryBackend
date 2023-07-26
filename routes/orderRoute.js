const orderController = require('../controllers/orderController.js');
const router = require('express').Router();


router.route('/').post(orderController.addOrder);


module.exports = router;