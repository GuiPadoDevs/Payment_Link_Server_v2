const mongoose = require('mongoose');

const paymentLinkSchema = new mongoose.Schema({
  id: { type: String, required: true },
  redirectUrl: { type: String, required: true },
});

module.exports = mongoose.model('PaymentLink', paymentLinkSchema);
