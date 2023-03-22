const AuthController = require('../controllers/AuthController');
const {authenticateUser} = require('../middleware/authentication');
const router = require('express').Router();

router.post('/register', AuthController.register);
router.post('/verify-email', AuthController.verify);
router.delete('/login', authenticateUser, AuthController.login);
router.get('/logout', AuthController.logout);
router.post('/reset-password', AuthController.reset);
router.post('/forget-password', AuthController.forget);


module.exports = router;