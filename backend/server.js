const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Importar rutas
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const adminRoutes = require("./routes/admin");
const orderRoutes = require("./routes/order");

// Configurar variables de entorno
dotenv.config();

// Crear la aplicación de Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log de cada solicitud (para depuración)
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Usar rutas
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/admin", adminRoutes);
app.use("/orders", orderRoutes); 

// Middleware de manejo de errores globales
app.use((err, req, res, next) => {
  console.error("Error detectado:", err.message);
  res.status(err.status || 500).json({
    message: "Ocurrió un error en el servidor",
    error: err.message,
  });
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
