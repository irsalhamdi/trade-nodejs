const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {attachCookiesToResponse, createTokenUser} = require('../utils');

module.exports = {
    register: async(req, res) => {
        const {email, name, password} = req.body;
        const emailAlreadyExis = await User.findOne({email});

        if(emailAlreadyExis){
            throw new  CustomError.BadRequestError(`Email already exist`);
        }

        const isFirstAccount = await User.countDocuments({}) === 0;
        const role = isFirstAccount ? 'admin' : 'user';

        const user = await User.create({name, email, password, role});
        const tokenUser = createTokenUser(user);
        attachCookiesToResponse({res, user: tokenUser});
        res.status(StatusCodes.CREATED).json({user: tokenUser});
    },
    login: async(req, res) => {
        const {email, password} = req.body;

        if(!email || !password){
            throw new CustomError.BadRequestError('Please provide email and password');
        }

        const user = await User.findOne({email});

        if(!user){
            throw new CustomError.UnauthenticatedError('Invalid credentials');
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if(!isPasswordCorrect){
            throw new CustomError.UnauthenticatedError('Invalid credentials');
        }

        const tokenUser = createTokenUser(user);
        attachCookiesToResponse({res, user: tokenUser});
        res.status(StatusCodes.OK).json({user: tokenUser});

    },
    logout: async(req, res) => {
        res.cookie('token', 'logout', {
            httpOnly: true,
            expires: new Date(Date.now() + 5 * 1000)
        });
        res.status(StatusCodes.OK).json({msg: `user logged out`});
    }
}