const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Campo del proveedor
      size: { type: String, required: true }, // Nueva propiedad para registrar la talla seleccionada
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pendiente", "en proceso", "completado", "cancelado"], 
    default: "pendiente" 
  },
  estimatedDelivery: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
