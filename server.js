const express = require('express');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api/v1/products',require('./routes/productRoute'));

app.listen(port,(req,res) => {
    console.log(`Listening to port ${port}`);
})

