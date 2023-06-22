const express = require('express');
require('dotenv').config();
const app = express();

const port = process.env.PORT;

app.listen(port,(req,res) => {
    console.log(`Listening to port ${port}`);
})

