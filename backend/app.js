const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors')
const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');
const servers = require('./routes/server');
const vpnAccounts = require('./routes/vpnAccount');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serves locally-stored product images and avatars (replaces Cloudinary).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);
app.use('/api/v1', servers);
app.use('/api/v1', vpnAccounts);

module.exports = app
