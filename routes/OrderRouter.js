const OrderController = require('../controllers/OrderController');
const {authenticateUser, authorizePermissions} = require('../middleware/authentication');
const router = require('express').Router();

router.route('/').get([authenticateUser, authorizePermissions('admin')], OrderController.index).post(authenticateUser, OrderController.create);
router.route('/show-all-my-orders').get(authenticateUser, OrderController.current);
router.route('/:id').get(authenticateUser, OrderController.show).patch(authenticateUser, OrderController.update);

module.exports = router;