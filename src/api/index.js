const mongoose = require('mongoose');
const app = require('../src/app');

let isConnected = false;

module.exports = async (req, res) => {
    if (!isConnected) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                bufferCommands: false,
            });
            isConnected = true;
            console.log('✅ MongoDB conectado na Vercel');
        } catch (err) {
            console.error('❌ Erro ao conectar no MongoDB', err);
            return res.status(500).json({ error: 'Erro ao conectar no MongoDB' });
        }
    }

    return app(req, res);
};
