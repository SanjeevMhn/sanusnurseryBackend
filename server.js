const express = require('express');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const port = process.env.PORT;

const allowedOrigins = ["http://localhost:4200","https://www.sanusnursery.com.np"];
const corsOptions = {
    origin: function(origin,callback){
        if(!origin || allowedOrigins.indexOf(origin) !== -1){
            callback(null,true);
        }else{
            callback(new Error('Not Allowed By CORS'));
        }
    },
    credentials: true,
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cookieParser());

app.use('/api/v1/products',require('./routes/productRoute'));
app.use('/api/v1/auth',require('./routes/authRoute'));
app.use('/api/v1/refresh',require('./routes/refreshRoute'));

app.listen(port,(req,res) => {
    console.log(`Listening to port ${port}`);
})

