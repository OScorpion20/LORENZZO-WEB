const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true }, // Stock total
  image: { type: String, required: true },
  category: { type: String, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Tallas disponibles para el producto
  size: { 
    type: [String], 
    required: true, 
    enum: ["XS", "S", "M", "L", "XL", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "Ajustable"] 
  }, // Añadir las tallas específicas dependiendo de la categoría
  
  // Stock por talla: Mapa que relaciona cada talla con su cantidad en stock
  stockBySize: { 
    type: Map, 
    of: Number, // Cada talla tendrá un número de stock asociado
    required: true 
  },
});

module.exports = mongoose.model("Product", productSchema);
