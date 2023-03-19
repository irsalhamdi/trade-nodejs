const ProductController = require('../controllers/ProductController');
const ReviewController = require('../controllers/ReviewController');
const {authenticateUser, authorizePermissions} = require('../middleware/authentication');
const router = require('express').Router();

router.route('/').get(ProductController.index).post([authenticateUser, authorizePermissions('admin')], ProductController.create);
router.route('/:id').get(ProductController.show).patch([authenticateUser, authorizePermissions('admin')], ProductController.update).delete([authenticateUser, authorizePermissions('admin')], ProductController.delete);
router.route('/upload-image').post([authenticateUser, authorizePermissions('admin')] ,ProductController.upload);
router.route('/:id/reviews').get(ReviewController.productReview);

module.exports = router;