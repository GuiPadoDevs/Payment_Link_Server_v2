const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Muitas requisições. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true // <- isso resolve o erro ERR_ERL_PERMISSIVE_TRUST_PROXY
});

module.exports = limiter;
