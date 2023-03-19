const ReviewController = require('../controllers/ReviewController');
const {authenticateUser} = require('../middleware/authentication');
const router = require('express').Router();

router.route('/').get(ReviewController.index).post(authenticateUser, ReviewController.create);
router.route('/:id').get(ReviewController.show).patch(authenticateUser, ReviewController.update).delete(authenticateUser, ReviewController.delete);

module.exports = router;