const AuthController = require('../controllers/AuthController');
const router = require('express').Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);

module.exports = router;