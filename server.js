require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB!');
    const app = require('./src/app');
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar no MongoDB:', err);
    process.exit(1);
  });
