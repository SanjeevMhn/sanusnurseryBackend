const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = async(req,res,next) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader){
        res.status(401).json({message: 'Unauthenticated User'});
        return;
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err,decoded) => {
            if(err){
                res.status(401).json({message: 'Token has expired'});
                return;
            }
            req.user_id = decoded.user_info.user_id;
            req.role_id = decoded.user_info.role_id;
            next();
        }
    )
}

module.exports = verifyJWT;