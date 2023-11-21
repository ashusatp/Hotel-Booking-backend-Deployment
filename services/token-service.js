const jwt = require('jsonwebtoken');
const refreshModel = require('../models/refresh-model');
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET
class TokenService{
    createToken(payload){
        const accessToken = jwt.sign(payload,accessTokenSecret,{
            expiresIn: '1h'
        });
        const refreshToken = jwt.sign(payload,refreshTokenSecret,{
            expiresIn: '1y'
        });
        return {accessToken,refreshToken}
    }
    verifyAccessToken(accessToken){
        return jwt.verify(accessToken, accessTokenSecret);
    }
    verifyRefreshToken(refreshToken){
        return jwt.verify(refreshToken, refreshTokenSecret);
    }
    async storeRefreshToken(refreshToken, userId){
        return await refreshModel.create({token: refreshToken, userId});
    }

    async deleteRefreshToken(refreshToken){
        return await refreshModel.deleteOne({token: refreshToken});
    }
    async findRefreshToken(userId, refreshToken){
        const token = await refreshModel.findOne({userId: userId, token: refreshToken });
        return token;
    }
    async updateRefreshToken(userId, refershToken){
        return await refreshModel.updateOne({userId: userId}, {token: refershToken});
    }
    async removeToken(refreshToken){
        return await refreshModel.deleteOne({token: refreshToken});
    }
}
module.exports = new TokenService();