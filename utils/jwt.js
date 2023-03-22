const jwt = require('jsonwebtoken');

const createJWT = ({paylod}) => {
    const token = jwt.sign(paylod, process.env.JWT_SECRET);
    return token;
}

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({res, user, refreshToken}) => {
    const accessTokenJWT = createJWT({paylod: {user} });
    const refreshTokenJWT = createJWT({paylod: {user, refreshToken} });
    const oneDay = 1000 * 60 * 60 * 24;
    const longerExp = 1000 * 60 * 60 * 24 * 30;

    res.cookie('accessToken', accessTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now() + oneDay)
    });

    res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now() + longerExp)
    });
}

module.exports = {createJWT, isTokenValid, attachCookiesToResponse};