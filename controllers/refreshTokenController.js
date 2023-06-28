const knex = require('../config/db/knex');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = async(req,res) => {
    const cookies = req.cookies;
    if(!cookies || !cookies.jwt){
        res.status(401).json({message: 'Unauthenticated User'});
        return;
    }

    const refreshToken = cookies.jwt;
    const foundToken = await knex.select('*').from('user_refresh_tokens').where('token',refreshToken);
    if(!foundToken || foundToken.length == 0){
        res.status(404).json({message: 'Token not found'})
        return;
    }

    const currentDate = new Date();
    if(foundToken[0].expires_at < currentDate){
        res.status(401).json({message: 'Refresh token has expired'});
        return;
    }

    const foundUser = await knex.select('user_id','role_id').from('users').where('user_id',foundToken[0].user_id);

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err,decoded) => {
            if(err || foundUser.length == 0){
                res.status(401).json({message: "Unauthenticated User"});
                return;
            }
            const accessToken = jwt.sign(
                {
                    "user_info":{
                        "user_id": foundUser[0].user_id,
                        "role_id": foundUser[0].role_id
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '5m' }
            );
            res.status(200).json({accessToken: accessToken});
        }
    )


}

module.exports = {
    handleRefreshToken
}