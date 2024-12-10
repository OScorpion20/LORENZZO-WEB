const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Asegúrate de importar el modelo de usuario

// Middleware para verificar el token de autorización
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1]; // Extraer el token sin el prefijo "Bearer"
  if (!token) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no está configurado en el entorno");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // Buscar al usuario en la base de datos

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.status === "inactivo") {
      return res.status(403).json({ message: "Cuenta deshabilitada. Contacta al administrador." });
    }

    req.user = decoded; // Adjuntar los datos del usuario al objeto req
    next(); // Continuar con el siguiente middleware o controlador
  } catch (error) {
    return res.status(401).json({ message: "Token inválido", error: error.message });
  }
};

const verifyAdmin = (req, res, next) => {
  console.log("Usuario autenticado en verifyAdmin:", req.user); // Depuración
  if (!req.user || req.user.role !== "administrador") {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Solo para administradores" });
  }
  next();
};

// Middleware para verificar si el usuario es proveedor o administrador
const verifyProviderOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "proveedor" && req.user.role !== "administrador")) {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Solo para proveedores o administradores" });
  }
  next();
};

// Middleware para verificar si el usuario es cliente
const verifyClient = (req, res, next) => {
  if (!req.user || req.user.role !== "cliente") {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Solo para clientes" });
  }
  next();
};

module.exports = { verifyToken, verifyProviderOrAdmin, verifyClient, verifyAdmin };
