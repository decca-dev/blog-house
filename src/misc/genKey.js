const { v4: uuidv4 } = require('uuid');
module.exports = async () => {
  return uuidv4();
};