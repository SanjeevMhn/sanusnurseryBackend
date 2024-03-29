const Role = require('../config/enums/roles.js');
const orderController = require('../controllers/orderController.js');
const verifyJWT = require('../middleware/verifyJWT.js');
const verifyUserRoles = require('../middleware/verifyUserRoles.js'); 
const router = require('express').Router();


router.route('/')
  .get(verifyJWT, verifyUserRoles(Role.Admin), orderController.getAllOrders)
  .post(orderController.addOrder);

router.route('/id/:order_id')
  .get(verifyJWT, verifyUserRoles(Role.Admin), orderController.getOrderById)
  .patch(verifyJWT, verifyUserRoles(Role.Admin, Role.User), orderController.updateOrder)
  .delete(verifyJWT, verifyUserRoles(Role.Admin), orderController.deleteOrder)

router.route('/id/items/:order_id')
  .get(verifyJWT, verifyUserRoles(Role.Admin, Role.User), orderController.getOrderItems);

router.route('/id/payment_detail/:order_id')
  .get(verifyJWT, verifyUserRoles(Role.Admin), orderController.getPaymentDetail);

router.route('/count')
  .get(verifyJWT, verifyUserRoles(Role.Admin), orderController.countOrders)

router.route('/repeatedProducts')
  .get(verifyJWT, verifyUserRoles(Role.Admin), orderController.getMostOrderedProducts);

router.route('/orderDeliveryPaymentStatus')
  .get(verifyJWT, verifyUserRoles(Role.Admin), orderController.getProductDeliveredAndPaymentStatus)

router.route('/search/date/:order_date')
  .get(verifyJWT, verifyUserRoles(Role.Admin), orderController.searchOrderByDate);

router.route('/search/user_name')
  .get(verifyJWT, verifyUserRoles(Role.Admin), orderController.searchOrderByUserName);

router.route('/id/payment_detail/:order_id')
  .patch(verifyJWT, verifyUserRoles(Role.Admin), orderController.updateOrderPaymentDetail)

router.route('/paymentTypes')
  .get(orderController.getPaymentTypes);

router.route('/status/:status')
  .get(verifyJWT, verifyUserRoles(Role.Admin), orderController.getOrdersByOrderStatus)

router.route('/order_detail/:id')
  .patch(verifyJWT, verifyUserRoles(Role.Admin,Role.User), orderController.updateOrderItem)
  .delete(verifyJWT, verifyUserRoles(Role.Admin,Role.User), orderController.deleteOrderItem)


module.exports = router;
