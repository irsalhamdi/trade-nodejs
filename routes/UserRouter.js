const UserController = require('../controllers/UserController');
const router = require('express').Router();
const {authenticateUser, authorizePermissions} = require('../middleware/authentication');

router.route('/').get(authenticateUser, authorizePermissions('admin'), UserController.index);
router.route('/show').get(authenticateUser, UserController.showCurrentUser);
router.route('/update-user').patch(authenticateUser, UserController.updateUser);
router.route('/update-user-password').patch(authenticateUser, UserController.updatePassword);
router.route('/:id').get(authenticateUser, UserController.getSingleUser);

module.exports = router;