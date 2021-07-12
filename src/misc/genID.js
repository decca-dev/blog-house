module.exports = async () => {

  let id = "";
  const possible = "0123456789";

  for (let i = 0; i < 14; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return id;
};