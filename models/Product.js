const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        maxlength: [100, `Name can't be more than 100 characters`]
    },
    price: {
        type: Number,
        required: [true, 'Please prove product price'],
        default: 0
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
        maxlength: [1000, `Description can't be more than 1000 characters`]
    },
    image: {
        type: String,
        default: '/uploads/example.jpeg'
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: ['kitchen', 'office', 'bedroom']
    },
    company: {
        type: String,
        required: [true, 'Please provide product company'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE}'
        }
    },
    colors: {
        type: [String],
        default: ['#222'],
        required: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    freeShipping: {
        type: Boolean,
        default: false,
    },
    inventory: {
        type: Number,
        required: true,
        default: 15
    },
    averageRating: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true} });

schema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false
});

const Product = mongoose.model('Product', schema);
module.exports = Product;