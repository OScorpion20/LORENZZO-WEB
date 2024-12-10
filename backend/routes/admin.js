const express = require("express");
const User = require("../models/User");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// Ver usuarios
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Excluye contraseñas
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
});

// Aprobar un proveedor
router.put("/approve-provider/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar el estado del usuario a "activo"
    user.status = "activo";
    await user.save();

    res.status(200).json({ message: "Proveedor aprobado con éxito", user });
  } catch (error) {
    res.status(500).json({ message: "Error al aprobar al proveedor", error: error.message });
  }
});

// Eliminar un usuario
router.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
});

// Editar un usuario
router.put("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, status },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json({ message: "Usuario actualizado", user });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario", error });
  }
});


// Obtener usuarios con paginación
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find().select("-password").skip(skip).limit(limit);
    const total = await User.countDocuments();

    res.status(200).json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
});

module.exports = router;
