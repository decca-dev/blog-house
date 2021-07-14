module.exports = () => {

  let id = "";
  const possible = "0123456789";

  for (let i = 0; i < Math.floor(Math.random() * 18) + 14; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return id;
};