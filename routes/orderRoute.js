const Role = require('../config/enums/roles.js');
const orderController = require('../controllers/orderController.js');
const verifyJWT = require('../middleware/verifyJWT.js');
const verifyUserRoles = require('../middleware/verifyUserRoles.js');
const router = require('express').Router();


router.route('/')
    .get(verifyJWT,verifyUserRoles(Role.Admin),orderController.getAllOrders)
    .post(orderController.addOrder);

// router.route('/payment/type/:payment_type_id')
//     .get(verifyJWT,verifyUserRoles(Role.Admin), orderController.getPaymentTypeFromId)

router.route('/id/:order_id').get(verifyJWT,verifyUserRoles(Role.Admin),orderController.getOrderById);
router.route('/id/items/:order_id').get(verifyJWT,verifyUserRoles(Role.Admin),orderController.getOrderItems);
router.route('/id/payment_detail/:order_id').get(verifyJWT,verifyUserRoles(Role.Admin),orderController.getPaymentDetail);

router.route('/count').get(verifyJWT,verifyUserRoles(Role.Admin),orderController.countOrders)

router.route('/repeatedProducts').get(verifyJWT,verifyUserRoles(Role.Admin),orderController.getMostOrderedProducts);

router.route('/orderDeliveryPaymentStatus').get(verifyJWT,verifyUserRoles(Role.Admin),orderController.getProductDeliveredAndPaymentStatus)

module.exports = router;