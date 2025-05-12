const express = require('express');
const cors = require('cors');
const rateLimiter = require('./middlewares/rateLimiter');

const healthRoutes = require('./routes/health.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use('/', healthRoutes);
app.use('/api', paymentRoutes);

module.exports = app;
