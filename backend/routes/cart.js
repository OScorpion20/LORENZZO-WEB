const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Obtener el carrito de un usuario
router.get("/", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("products.productId");
    if (!cart) {
      return res.status(404).json({ message: "No se encontró el carrito" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el carrito", error });
  }
});

// Agregar un producto al carrito
router.post("/", verifyToken, async (req, res) => {
    const { productId, quantity } = req.body;
  
    try {
      let cart = await Cart.findOne({ userId: req.user.id });
  
      if (!cart) {
        // Si el carrito no existe, creamos uno nuevo
        cart = new Cart({ userId: req.user.id, products: [] });
      }
  
      const productIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );
  
      if (productIndex >= 0) {
        // Si el producto ya está en el carrito, actualizamos la cantidad
        cart.products[productIndex].quantity += quantity;
      } else {
        // Si el producto no está en el carrito, lo agregamos
        cart.products.push({ productId, quantity });
      }
  
      await cart.save();
      res.status(200).json({ message: "Producto agregado al carrito", cart });
    } catch (error) {
      res.status(500).json({ message: "Error al agregar al carrito", error });
    }
  });
  

// Eliminar un producto del carrito
router.delete("/:productId", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    await cart.save();
    res.status(200).json({ message: "Producto eliminado del carrito", cart });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el producto", error });
  }
});

// Actualizar la cantidad de un producto en el carrito
router.put("/:productId", verifyToken, async (req, res) => {
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === req.params.productId
    );

    if (productIndex >= 0) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
      res.status(200).json({ message: "Cantidad actualizada", cart });
    } else {
      res.status(404).json({ message: "Producto no encontrado en el carrito" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la cantidad", error });
  }
});

module.exports = router;
