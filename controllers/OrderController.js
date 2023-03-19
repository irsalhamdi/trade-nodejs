const Order = require('../models/Order');
const Product = require('../models/Product');
const {checkPermissions} = require('../utils');
const CustomAPIError = require('../errors');
const {StatusCodes} = require('http-status-codes');

module.exports = {
    index: async(req, res) => {
        const orders = await Order.find({});
        res.status(StatusCodes.CREATED).json({orders, amount: orders.length});
    },
    show: async(req, res) => {
        const order = await Order.findOne({_id: req.params.id});
        
        if(!order){
            throw new CustomAPIError.UnauthenticatedError(`No order with id ${req.params.id}`);
        }

        checkPermissions(req.user, order.user);

        res.status(StatusCodes.OK).json({order});
    },
    create: async(req, res) => {
        const {items: cartItems, tax, shippingFee} = req.body;

        if(!cartItems || cartItems.length < 1){
            throw new CustomAPIError.BadRequestError(`No cart items provided`);
        }

        if(!tax || !shippingFee){
            throw new CustomAPIError.BadRequestError(`Please provide and shipping fee`);
        }

        let orderItems = [];
        let subtotal = 0;

        for (const item of cartItems) {
            const dbProduct = await Product.findOne({_id: item.product});

            if(!dbProduct){
                throw new CustomAPIError.NotFoundError(`No product with id ${item.product}`);
            }

            const {name, price, image, _id} = dbProduct; 
            const singleOrderItem = {
                amount: item.amount,
                name: name,
                price: price,
                image: image,
                product: _id
            }

            orderItems = [...orderItems, singleOrderItem];
            subtotal += item.amount * price;
        }

        const total = tax + shippingFee + subtotal;

        //MIDTRANS SETUP

        const order = Order.create({
            orderItems: orderItems,
            total: total,
            subtotal: subtotal,
            tax: tax,
            shippingFee: shippingFee,
            user: req.user.userId,
            clientSecret: 'HAHAAH'
        });

        res.status(StatusCodes.CREATED).json({order});
    },
    current: async(req, res) => {
        const orders = await Order.find({user: req.user.userId});
        res.status(StatusCodes.OK).json({orders, amount: orders.length});
    },
    update: async(req, res) => {
        const order = await Order.findOne({_id: req.params.id});

        if(!order){
            throw new CustomAPIError.NotFoundError(`No order with id ${req.params.id}`);
        }

        checkPermissions(req.user, order.user);

        order.paymentIntentId = 'HEEH';
        order.status = 'paid';

        await order.save();

        res.status(StatusCodes.OK).json({});
    }
}