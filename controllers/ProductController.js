const Product = require('../models/Product');
const Review = require('../models/Review');
const {StatusCodes} = require('http-status-codes');
const CustomAPIError = require('../errors'); 
const path = require('path');

module.exports = {
    index: async(req, res) => {
        const products = await Product.find({});
        res.status(StatusCodes.OK).json({products, count: products.length});
    },
    create: async(req, res) => {
        req.body.user = req.user.userId;
        const product = await Product.create(req.body);
        res.status(StatusCodes.CREATED).json({product});
    },
    show: async(req, res) => {
        const product = await Product.findOne({_id: req.params.id}).populate('reviews');

        if(!product){
            throw new CustomAPIError.NotFoundError(`product with id ${req.params.id} not found`);
        }
        
        res.status(StatusCodes.OK).json({product});
    },
    update: async(req, res) => {
        const product = await Product.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, runValidators: true});
        
        if(!product){
            throw new CustomAPIError.NotFoundError(`product with id ${req.params.id} not found`);
        }
        
        res.status(StatusCodes.OK).json({product});
    },
    upload: async(req, res) => {
        if(!req.files){
            throw new CustomAPIError.BadRequestError(`No file uploaded`);
        }
        
        const productImage = req.files.image;
        
        if(!productImage.mimetype.startsWith('image')){
            throw new CustomAPIError.BadRequestError(`Please upload an image`);
        }
        
        const maxSize = 1024 * 1024;
        
        if(productImage.size > maxSize){
            throw new CustomAPIError.BadRequestError(`Please upload an image smaller than 1MB`);
        }

        const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`);

        await productImage.mv(imagePath);
        res.status(StatusCodes.OK).json({image: `http://localhost:3000/uploads/${productImage.name}`});
    },
    delete: async(req, res) => {
        const product = await Product.findOne({_id: req.params.id});
        
        if(!product){
            throw new CustomAPIError.NotFoundError(`product with id ${req.params.id} not found`);
        }

        const reviews = await Review.find({product: req.params.id});

        for(let i = 0; i < reviews.length; i++){
            reviews[i].deleteOne();
        }

        await product.deleteOne();
        res.status(StatusCodes.OK).json({msg: `Product success deleted`});
    }
}