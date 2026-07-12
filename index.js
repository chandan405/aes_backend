const express = require('express');
var cors = require('cors');
const connection = require('./connection');
const userRoutes = require('./routes/user');
const categoriesRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const billRoutes = require('./routes/bill');
const dashboardRoutes = require('./routes/dashboard');
const orderRoutes = require('./routes/order');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/user', userRoutes);
app.use('/category', categoriesRoutes);
app.use('/product', productRoutes);
app.use('/bill', billRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/orders', orderRoutes);

module.exports = app;
