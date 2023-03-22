const User = require('../models/User');
const Token = require('../models/Token');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {attachCookiesToResponse, createTokenUser, sendVerificationEmail, sendResetPasswordEmail, createHash} = require('../utils');
const crypto = require('crypto');

module.exports = {
    register: async(req, res) => {
        const {email, name, password} = req.body;
        const emailAlreadyExis = await User.findOne({email});

        if(emailAlreadyExis){
            throw new  CustomError.BadRequestError(`Email already exist`);
        }
        
        const isFirstAccount = await User.countDocuments({}) === 0;
        const role = isFirstAccount ? 'admin' : 'user';
        const verificationToken = crypto.randomBytes(40).toString('hex');
        const user = await User.create({name, email, password, role, verificationToken});
        const origin = 'http://localhost:3000';
        
        await sendVerificationEmail({name: user.name, email: user.email, verificationToken: user.verificationToken, origin: origin});
        res.status(StatusCodes.CREATED).json({msg: `Please check your email to verification account !`});
    },
    verify: async(req, res) => {
        const {verificationToken, email} = req.body;
        const user = await User.findOne({email: email});
        
        if(!user){
            throw new  CustomError.BadRequestError(`Verification failed`);
        }
        
        if(user.verificationToken !== verificationToken){
            throw new  CustomError.BadRequestError(`Verification failed`);
        }

        await User.findOneAndUpdate({email: email}, {isVeirified: true, verified: Date.now(), newVerificationToken: ''}, {new: true})
        res.status(StatusCodes.OK).json({msg: `Email verified !`});
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

        const isVeirified = user.isVeirified;

        if(isVeirified === false){
            throw new CustomError.UnauthenticatedError('Please verified your email first');
        }
        
        const tokenUser = createTokenUser(user);
        let refreshToken = '';
        const existingToken = await Token.findOne({user: user._id});
        
        if(existingToken){
            const {isValid} = existingToken;
            
            if(!isValid){
                throw new CustomError.UnauthenticatedError('Invalid credentials');
            }

            refreshToken = existingToken.refreshToken;
            attachCookiesToResponse({res, user: tokenUser, refreshToken});
            
            res.status(StatusCodes.OK).json({user: tokenUser});
            return;
        }

        refreshToken = crypto.randomBytes(40).toString('hex');
        
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userToken = {refreshToken, ip, userAgent, user: user._id};
        await Token.create(userToken);
        attachCookiesToResponse({res, user: tokenUser, refreshToken});

        res.status(StatusCodes.OK).json({user: tokenUser});
    },
    logout: async(req, res) => {
        await Token.findOneAndDelete({user: req.user.userId});

        res.cookie('accessToken', 'logout', {
            httpOnly: true,
            expires: new Date(Date.now())
        });

        res.cookie('refreshToken', 'logout', {
            httpOnly: true,
            expires: new Date(Date.now())
        });

        res.status(StatusCodes.OK).json({msg: `user logged out`});
    },
    reset: async(req, res) => {
        const {token, email, password} = req.body;

        if(!token || !email || !password){
            throw new CustomError.BadRequestError(`Email already exist`);
        }

        const user = await User.findOne({email: email});

        if(!user){
            const currentDate = new Date();

            if(user.passwordToken === createHash(token) && user.passwordTokenExpirationDate > currentDate){
                user.password = password;
                user.passwordToken = null;
                user.passwordTokenExpirationDate = null;

                await user.save();
            }
        }
    },
    forget: async(req, res) => {
        const {email} = req.body;

        if(!email){
            throw new CustomError.BadRequestError(`Please provide email`);
        }
        
        const user = await User.findOne({email: email});
        
        if(user){
            const passwordToken = crypto.randomBytes(70).toString('hex');
            const origin = 'http://localhost:3000';

            await sendResetPasswordEmail({name: user.name, email:user.email, token: passwordToken, origin: origin});

            const tenMinutes = 1000 * 60 * 10;
            const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

            user.passwordToken = createHash(passwordToken);
            user.passwordTokenExpirationDate = passwordTokenExpirationDate;
            await user.save();
        }
        
        res.status(StatusCodes.OK).json({mag: `Please check your email for reset password link`});
    }
}