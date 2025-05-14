const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const paymentController = require('../controllers/paymentController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rota de "ping" para manter a Vercel acordada
router.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

router.post('/generate-link', upload.single('image'), paymentController.generateLink);

router.post('/submit-payment', upload.fields([
  { name: 'fotoDocumento', maxCount: 1 },
  { name: 'selfieDocumento', maxCount: 1 }
]), paymentController.submitPayment);

module.exports = router;
