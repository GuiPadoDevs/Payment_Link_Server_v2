const mongoose = require('mongoose');
const app = require('../src/app');
let isConnected = false;

module.exports = async (req, res) => {
    if (!isConnected) {
        await mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
        });
        isConnected = true;
        console.log('🔌 Conectado ao MongoDB (Vercel)');
    }

    return app(req, res);
};
