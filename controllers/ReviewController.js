const Review = require('../models/Review');
const Product = require('../models/Product');
const {StatusCodes} = require('http-status-codes');
const CustomAPIError = require('../errors');
const {checkPermissions} = require('../utils');

module.exports = {
    index: async(req, res) => {
        const reviews = await Review.find({}).populate({path: 'product', select: 'name company price'});
        res.status(StatusCodes.OK).json({reviews, amount: reviews.length});
    },
    create: async(req, res) => {
        const isValidProduct = Product.findOne({_id: req.body.product});

        if(!isValidProduct){
            throw new CustomAPIError.NotFoundError(`No product with id ${req.body.product}`);
        }
        
        const alreadySubmitted = await Review.findOne({product: req.body.product, user: req.user.userId});
        
        if(alreadySubmitted){
            throw new CustomAPIError.BadRequestError(`Already submitted review for this product`);
        }

        req.body.user = req.user.userId;
        const review = await Review.create(req.body);

        res.status(StatusCodes.CREATED).json({review});
    },
    show: async(req, res) => {
        const review = await Review.findOne({_id: req.params.id});

        if(!review){
            throw new CustomAPIError.NotFoundError(`No review with id ${req.params.id}`);
        }
        
        res.status(StatusCodes.OK).json({review});
    },
    update: async(req, res) => {
        const {rating, title, comment} = req.body;

        const review = await Review.findOne({_id: req.params.id});
    
        if(!review){
            throw new CustomAPIError.NotFoundError(`No review with id ${req.params.id}`);
        }

        checkPermissions(req.user, review.user);
        const data = await Review.findOneAndUpdate({_id: req.params.id}, {rating, title, comment}, {new: true, runValidators: true});

        res.status(StatusCodes.OK).json({data});
    },
    delete: async(req, res) => {
        const review = await Review.findOne({_id: req.params.id});
    
        if(!review){
            throw new CustomAPIError.NotFoundError(`No review with id ${req.params.id}`);
        }
        
        checkPermissions(req.user, review.user);
        await review.deleteOne();

        res.status(StatusCodes.OK).json({msg: `Success deleted review`});
    },
    productReview: async(req, res) => {
        const reviews = await Review.find({product: req.params.id});
        console.log(reviews);
        res.status(StatusCodes.OK).json({reviews, amount: reviews.length});
    }
}