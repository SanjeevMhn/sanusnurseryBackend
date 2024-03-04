const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

const environment = process.env.NODE_ENV || 'production';

const result = dotenv.config({
  path: `.env.${environment}`
})

if(result.error){
  console.error(`Error loading .env.${environment} file: ${result.error.message}`);
  process.exit(1);
}

const port = process.env.PORT || 8080;

const allowedOrigins = ["http://localhost:4200", "http://localhost:3000", "https://www.sanusnursery.com.np"];
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not Allowed By CORS'));
    }
  },
  credentials: true,
}

app.use(cors(corsOptions));

const io = new Server(server,{
  cors: corsOptions
})

const getIOInstance = () => {
  return io;
}

const getGoogleAuthClient = () => {
  return client;
}

module.exports = {
  getIOInstance,
  getGoogleAuthClient
}

io.on('connection',(socket) => {
  console.log('Connected');

  socket.on('disconnect', () => {
    console.log('Disconnected')
  })
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use('/api/v1/products', require('./routes/productRoute'));
app.use('/api/v1/orders', require('./routes/orderRoute'));
app.use('/api/v1/categories', require('./routes/categoryRoute'));
app.use('/api/v1/auth', require('./routes/authRoute'));
app.use('/api/v1/refresh', require('./routes/refreshRoute'));
app.use('/api/v1/notifications', require('./routes/notificationRoute'));
app.use('/api/v1/admin',require('./routes/adminRoute'));
app.use('/api/v1/cart',require('./routes/cartRoute'));
app.use('/api/v1/user',require('./routes/userRoute'));

server.listen(port, (req, res) => {
  console.log(`Listening to port ${port}`);
})

