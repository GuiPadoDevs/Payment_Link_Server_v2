const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  method: String,
  amount: Number,
});

module.exports = mongoose.model('Payment', paymentSchema);
