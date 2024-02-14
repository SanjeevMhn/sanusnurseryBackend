const knex = require('../config/db/knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const handleLogin = async (req, res) => {
    try {
        const { user_email, user_password } = req.body;

        if (!user_email || !user_password) {
            res.status(401).json({ message: "Invalid user email or password" });
            return;
        }

        const foundUser = await knex.select('*').from('users').where('user_email', user_email);
        if (!foundUser || foundUser.length == 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const decrptedPassword = await (bcrypt.compare(user_password, foundUser[0].user_password));
        if (!decrptedPassword) {
            res.status(403).json({ message: "Invalid Password" });
            return;
        }

        const accessToken = jwt.sign(
            {
                "user_info": {
                    "user_id": foundUser[0].user_id,
                    "role_id": foundUser[0].role_id
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '5m' }
        );

        const refreshToken = jwt.sign(
            {
                "user_info": {
                    "user_id": foundUser[0].user_id,
                    "role_id": foundUser[0].role
                }
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        )

        const currentDate = new Date();
        const tokenExpire = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        await knex('user_refresh_tokens').insert([{
            user_id: foundUser[0].user_id,
            token: refreshToken,
            expires_at: tokenExpire
        }]);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: 'User logged in successfully',
            accessToken: accessToken
        })


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while logging in user' });
    }
}

const handleUserRegistration = async (req, res) => {
    try {
        const { user_name, user_email, user_password } = req.body;

        if (!user_name || !user_email || !user_password) {
            res.status(400).json({ message: "Please enter all the required fields" });
            return;
        }

        const checkIfUserExists = await knex.select('*').from('users').where('user_email', user_email);
        if (checkIfUserExists.length) {
            res.status(409).json({ message: "User email already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(user_password, 10);
        await knex('users').insert([{
            user_name: user_name,
            user_email: user_email,
            user_password: hashedPassword
        }]);

        res.status(201).json({ message: 'User registered successfully' });


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occured while registering new user" });
    }
}

const handleUserLogout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies || !cookies.jwt) {
            res.status(401).json({ message: "Invalid User" });
            return;
        }

        const refreshToken = cookies.jwt;
        const foundToken = await knex.select('*').from('user_refresh_tokens').where('token', refreshToken);

        if (foundToken.length == 0) {
            res.clearCookie('jwt', {
                httpOnly: true,
            });
            res.status(403).json({ message: 'Invalid User' });
            return;
        }

        await knex('user_refresh_tokens').where('user_id', foundToken[0].user_id).del();
        res.clearCookie('jwt', {
            httpOnly: true,
        });
        res.status(200).json({ message: 'User has been logged out' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occured while trying to logout user" });
    }
}

const getUserData = async (req, res) => {
    try {
        const userData = await knex.raw('select users.user_id,users.user_name,users.user_email,roles.role_name as user_role from users join roles on users.role_id = roles.role_id where users.user_id = ?', [req.user_id]);
        res.status(200).json({ user: userData.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while getting user data' })
    }
}

const getUserByEmail = async(req,res) => {
    try{
        const userEmail = req.body.user_email;
        if(!userEmail || userEmail == null || userEmail == ''){
            return res.status(400).json({ message: 'No email found, Please provide an email' });
        }
        //const emailExists = await knex.select('user_id','user_name','user_email','role_id').from('users').where('user_email',userEmail);
        const emailExists = await knex.raw(`select
                                                usr.user_id,
                                                usr.user_name,
                                                usr.user_email,
                                                rl.role_name
                                            from users usr
                                            inner join roles rl 
                                            on usr.role_id = rl.role_id`);
        if(!emailExists || emailExists.rows.length == 0){
            return res.status(400).json({ message: 'User email doesnot exist!' });
        }
        console.log(emailExists.rows[0]);
        res.status(200).json({user: emailExists.rows[0]});
    }catch(err){
        console.error(err);
    }
}
 
module.exports = {
    handleLogin,
    handleUserRegistration,
    handleUserLogout,
    getUserData,
    getUserByEmail
}
