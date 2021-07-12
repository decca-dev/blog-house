module.exports = () => {
  let id = "";

  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 25; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return id;
};
