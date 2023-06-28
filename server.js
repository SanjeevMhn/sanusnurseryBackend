const express = require('express');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cookieParser());

app.use('/api/v1/products',require('./routes/productRoute'));
app.use('/api/v1/auth',require('./routes/authRoute'));
app.use('/api/v1/refresh',require('./routes/refreshRoute'));

app.listen(port,(req,res) => {
    console.log(`Listening to port ${port}`);
})

