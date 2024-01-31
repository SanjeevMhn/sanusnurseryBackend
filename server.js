const express = require('express');
const http = require('http');
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Server } = require('socket.io');


const port = process.env.PORT;

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

module.exports = {
  getIOInstance
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

server.listen(port, (req, res) => {
  console.log(`Listening to port ${port}`);
})

