const Role = require('../config/enums/roles.js');
const orderController = require('../controllers/orderController.js');
const verifyJWT = require('../middleware/verifyJWT.js');
const verifyUserRoles = require('../middleware/verifyUserRoles.js');
const router = require('express').Router();


router.route('/')
    .get(verifyJWT,verifyUserRoles(Role.Admin),orderController.getAllOrders)
    .post(orderController.addOrder);


module.exports = router;