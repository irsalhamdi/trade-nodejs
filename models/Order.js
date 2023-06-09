const mongoose = require('mongoose');

const singleOrderItem = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true,
    }
});

const schema = new mongoose.Schema({
    tax: {
        type: Number,
        required: true,
    },
    shippingFee: {
        type: Number,
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    orderItems: [singleOrderItem],
    status: {
        type: String,
        enum: ['pending', 'failed', 'paid', 'delivered', 'cancelled'],
        default: 'pending'
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    } ,
    clientSecret: {
        type: String,
        required: true,
    },
    paymentIntentId: {
        type: String,
    }
}, {timestamps: true});

const Order = mongoose.model('Order', schema);
module.exports = Order;