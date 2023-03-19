const {StatusCodes} = require('http-status-codes');
const User = require('../models/User');
const CustomAPIError = require('../errors');
const {createTokenUser, attachCookiesToResponse, checkPermissions} = require('../utils');

module.exports = {
    index: async(req, res) => {
        const users = await User.find({role: 'user'}).select('-password');
        res.status(StatusCodes.OK).json({users});
    },
    getSingleUser: async(req, res) => {
        const user = await User.findOne({_id: req.params.id}).select('-password');

        if(!user){
            throw new CustomAPIError.NotFoundError(`No user with id ${req.params.id}`);
        }

        checkPermissions(req.user, user._id);

        res.status(StatusCodes.OK).json({user});
    },
    showCurrentUser: async(req, res) => {
        res.status(StatusCodes.OK).json({user: req.user});
    },
    updateUser: async(req, res) => {
        const {email, name} = req.body;

        if(!email || !name){
            throw new CustomAPIError.BadRequestError(`Please provide email and password`);
        }

        const user = await User.findOneAndUpdate({_id: req.user.userId}, {email, name}, {new: true, runValidators: true});
        const tokenUser = createTokenUser(user);

        attachCookiesToResponse({res, user:tokenUser});
        res.status(StatusCodes.OK).json({user: tokenUser});
    },
    updatePassword: async(req, res) => {
        const {oldPassword, newPassword} = req.body;

        if(!oldPassword || !newPassword){
            throw new CustomAPIError.BadRequestError(`Please provide both value`);
        }

        const user = await User.findOne({_id: req.user.userId});
        const isPasswordCorrenct = await user.comparePassword(oldPassword);

        if(!isPasswordCorrenct){
            throw new CustomAPIError.UnauthenticatedError(`Invalid credentials`);
        }

        user.password = newPassword;
        await user.save();

        res.status(StatusCodes.OK).json({msg: `Success, Password updated !`});
    }
}