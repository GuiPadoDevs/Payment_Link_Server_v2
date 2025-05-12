const { validate: uuidValidate } = require('uuid');

module.exports = (id) => uuidValidate(id);
