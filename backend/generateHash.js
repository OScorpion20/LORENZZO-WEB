const bcrypt = require("bcrypt");

const password = "201102"; // La contraseña que quieres encriptar
bcrypt.hash(password, 10).then((hash) => {
  console.log("Hash generado:", hash);
});
