const User = require('../models/User');

module.exports = () => {
  let id = "";
  const possible = "0123456789";

  for (let i = 0; i < 14; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  await User.findOne({ apiKey: id })
  .then((user) => {
    if (user) {
      let idAsNum = parseInt(id);
      return idAsNum + Math.floor(Math.random() * 14);
    }else {
      return id;
    }
  })
};