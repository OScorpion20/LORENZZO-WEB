const express = require("express");
const Product = require("../models/Product");
const { verifyToken, verifyAdmin, verifyProviderOrAdmin } = require("../middleware/auth");

const router = express.Router();


// Obtener todos los productos (solo para administradores)
router.get("/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const products = await Product.find().populate("providerId", "name email");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error });
  }
});

// Crear un nuevo producto (solo para proveedores o administradores)
router.post("/", verifyToken, verifyProviderOrAdmin, async (req, res) => {
  const { name, description, price, stock, image, category, stockBySize } = req.body;

  if (!name || !description || !price || !stock || !image || !category || !stockBySize) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      image,
      category,
      stockBySize, // Recibir las tallas con el stock
      providerId: req.user.id, // Asociar el producto al proveedor autenticado
    });
    await newProduct.save();
    res.status(201).json({ message: "Producto agregado exitosamente", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar producto", error });
  }
});

// Obtener todos los productos de un proveedor
router.get("/provider", verifyToken, verifyProviderOrAdmin, async (req, res) => {
  try {
    const products = await Product.find({ providerId: req.user.id });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos del proveedor", error });
  }
});

// Obtener todos los productos (accesible para todos)
router.get("/", async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};

  try {
    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos", error });
  }
});

// Obtener un producto por ID (accesible para todos)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el producto", error });
  }
});

// Actualizar un producto
router.put("/:id", verifyToken, verifyProviderOrAdmin, async (req, res) => {
  try {
    const { category, stockBySize, ...otherFields } = req.body; // Asegúrate de manejar 'stockBySize' correctamente
    const product = await Product.findByIdAndUpdate(req.params.id, {
      category,
      stockBySize,
      ...otherFields,
    }, { new: true }); // `new: true` devuelve el documento actualizado

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(product); // Responde con el producto actualizado
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el producto", error });
  }
});


// Eliminar un producto (solo para proveedores o administradores)
router.delete("/:id", verifyToken, verifyProviderOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Verificar permisos usando el middleware verifyAdmin para administradores
    if (req.user.role === "administrador") {
      await Product.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: "Producto eliminado exitosamente (por admin)." });
    }

    // Verificar que el proveedor esté eliminando su propio producto
    if (product.providerId.toString() === req.user.id) {
      await Product.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: "Producto eliminado exitosamente (por proveedor)." });
    }

    // Si no cumple ninguna de las condiciones, denegar el acceso
    return res.status(403).json({ message: "No tienes permisos para eliminar este producto." });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar el producto.", error });
  }
});


module.exports = router;
