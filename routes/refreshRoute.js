const refreshTokenController = require('../controllers/refreshTokenController');
const router = require('express').Router();

router.route('/').post(refreshTokenController.handleRefreshToken);

module.exports = router;