const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Endpoint para registrar un pedido simulado
router.post("/simulate-order", verifyToken, async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "El pedido no tiene productos." });
    }

    console.log("Payload recibido en el servidor:", JSON.stringify(req.body, null, 2));

    const formattedProducts = products.map((product) => {
      console.log("Procesando producto:", product);

      if (!product.productId || !product.size || !product.quantity) {
        console.error(`Error en producto con ID ${product.productId}: Talla o cantidad no definidos.`);
        throw new Error(`El producto con ID ${product.productId} no tiene una talla seleccionada.`);
      }

      return {
        productId: product.productId,
        size: product.size, // Talla seleccionada
        quantity: product.quantity,
        providerId: product.providerId,
      };
    });

    const order = new Order({
      userId: req.user.id,
      products: formattedProducts,
      totalAmount,
      status: "pendiente",
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días por defecto
    });

    await order.save();
    res.status(201).json({ message: "Pedido registrado exitosamente", order });
  } catch (error) {
    console.error("Error al registrar pedido:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// Obtener los pedidos del usuario autenticado
router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate("products.productId");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al cargar pedidos", error: error.message });
  }
});

// Obtener pedidos relacionados con los productos de un proveedor
router.get("/related", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "proveedor" && req.user.role !== "administrador") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const orders = await Order.find().populate("products.productId").exec();

    const relatedOrders = orders.filter((order) =>
      order.products.some(
        (product) => product.productId?.providerId?.toString() === req.user.id
      )
    );

    res.status(200).json(relatedOrders);
  } catch (error) {
    res.status(500).json({ message: "Error al cargar pedidos", error: error.message });
  }
});

// Actualizar el estado de un pedido
router.put("/:id", verifyToken, async (req, res) => {
  try {
    console.log("Iniciando actualización del estado del pedido...");

    if (req.user.role !== "proveedor" && req.user.role !== "administrador") {
      console.error("Acceso denegado: Usuario no tiene los permisos necesarios");
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const { status } = req.body;
    console.log("Estado solicitado:", status);

    if (!["pendiente", "en proceso", "completado"].includes(status)) {
      console.error("Estado inválido proporcionado:", status);
      return res.status(400).json({ message: "Estado inválido" });
    }

    const order = await Order.findById(req.params.id).populate("products.productId");
    console.log("Pedido encontrado:", order);

    if (!order) {
      console.error("Pedido no encontrado:", req.params.id);
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    const isRelated = order.products.some(
      (product) => product.productId?.providerId?.toString() === req.user.id
    );
    console.log("Es proveedor relacionado al pedido:", isRelated);

    if (!isRelated && req.user.role !== "administrador") {
      console.error("Acceso denegado: Usuario no relacionado con el pedido");
      return res.status(403).json({ message: "Acceso denegado" });
    }

    if (status === "completado") {
      console.log("Reduciendo stock de los productos...");
      for (const product of order.products) {
        const productData = product.productId;
        const selectedSize = product.size;

        console.log("Procesando producto:", productData.name, "Talla:", selectedSize);

        if (productData && selectedSize) {
          const stockBySize = productData.stockBySize;

          console.log("Stock actual para el producto:", stockBySize);

          const currentStock = stockBySize.get(selectedSize);

          if (currentStock === undefined) {
            console.error(
              `Stock no registrado para el producto ${productData.name} en la talla ${selectedSize}`
            );
            return res.status(400).json({
              message: `El producto ${productData.name} no tiene stock registrado para la talla ${selectedSize}.`,
            });
          }

          if (currentStock < product.quantity) {
            console.error(
              `Stock insuficiente para el producto ${productData.name} en la talla ${selectedSize}`
            );
            return res.status(400).json({
              message: `El producto ${productData.name} no tiene suficiente stock para la talla ${selectedSize}.`,
            });
          }

          stockBySize.set(selectedSize, currentStock - product.quantity);

          console.log(
            `Nuevo stock para la talla ${selectedSize}:`,
            stockBySize.get(selectedSize)
          );

          productData.stockBySize = stockBySize;
          await productData.save();
          console.log("Stock actualizado para el producto:", productData.name);
        } else {
          console.error("Producto o talla no definidos:", productData, selectedSize);
        }
      }
    }

    order.status = status;
    await order.save();
    console.log("Estado del pedido actualizado exitosamente:", order);

    res.status(200).json({ message: "Estado actualizado y stock reducido", order });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error.message);
    res.status(500).json({ message: "Error al actualizar estado", error: error.message });
  }
});

// Obtener cantidad de pedidos completados para un proveedor
router.get("/completed", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "proveedor" && req.user.role !== "administrador") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const orders = await Order.find({ status: "completado" }).populate({
      path: "products.productId",
      select: "providerId name",
    });

    const relatedCompletedOrders = orders.filter((order) =>
      order.products.some((product) =>
        product.productId?.providerId?.toString() === req.user.id
      )
    );

    res.status(200).json({ completedOrders: relatedCompletedOrders.length });
  } catch (error) {
    console.error("Error en /orders/completed:", error.message);
    res.status(500).json({ message: "Error al cargar los pedidos completados", error: error.message });
  }
});

module.exports = router;
