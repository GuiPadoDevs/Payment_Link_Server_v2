const express = require('express');
const cors = require('cors');
const rateLimiter = require('./middlewares/rateLimiter');

const healthRoutes = require('./routes/health.routes');
const paymentRoutes = require('./routes/payment.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.set('trust proxy', false);

const allowedOrigins = ['http://164.152.51.110'];
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());
app.use(rateLimiter);

app.use('/', healthRoutes);
app.use('/api', paymentRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;
