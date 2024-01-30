const Role = require('../config/enums/roles');
const notificationController = require('../controllers/notificationController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyUserRoles = require('../middleware/verifyUserRoles')
const router = require('express').Router();

router.route('/id/:id')
    .get(verifyJWT,notificationController.getNotifications)
    .post(verifyJWT,notificationController.notificationUpdate);


module.exports = router;