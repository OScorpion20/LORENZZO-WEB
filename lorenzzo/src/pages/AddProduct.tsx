import React, { useState, useEffect } from "react";
import API from "../api";
import "../styles/AddProduct.css";

// Definir las tallas disponibles según la categoría
const getAvailableSizes = (category: string) => {
  switch (category) {
    case "Shirts":
    case "Hoodies":
      return ["XS", "S", "M", "L", "XL"];
    case "Jeans":
      return ["28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38"];
    case "Caps":
      return ["Ajustable"];
    case "Sneakers":
      return [
        "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
      ];
    default:
      return [];
  }
};

const AddProduct: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [stockBySize, setStockBySize] = useState<{ [key: string]: number }>({}); // Almacenamos el stock por talla
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      const sizes = getAvailableSizes(category);
      const initialStock: { [key: string]: number } = {};
      sizes.forEach((size) => {
        initialStock[size] = 0; // Inicializar stock de todas las tallas a 0
      });
      setStockBySize(initialStock); // Establecer las tallas disponibles con stock inicial
    }
  }, [category]);

  const handleStockChange = (size: string, value: number) => {
    setStockBySize((prev) => ({ ...prev, [size]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name || !description || !price || !stock || !image || !category || Object.keys(stockBySize).length === 0) {
      setError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    if (Number(price) <= 0 || Number(stock) <= 0) {
      setError("El precio y el stock deben ser mayores a 0");
      setLoading(false);
      return;
    }

    const urlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;
    if (!urlRegex.test(image)) {
      setError("La URL de la imagen no es válida");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token no encontrado. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }

    try {
      const response = await API.post(
        "/products",
        { name, description, price, stock, image, category, stockBySize }, // Enviar las tallas con su stock correspondiente
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(response.data.message);
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImage("");
      setCategory("");
      setStockBySize({});
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al agregar producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h1 className="add-product-title">Agregar Producto</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Nombre del producto</label>
          <input
            id="name"
            type="text"
            placeholder="Nombre del producto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description" className="form-label">Descripción</label>
          <textarea
            id="description"
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
          />
        </div>
        <div className="form-group">
          <label htmlFor="price" className="form-label">Precio</label>
          <input
            id="price"
            type="number"
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="stock" className="form-label">Stock Total</label>
          <input
            id="stock"
            type="number"
            placeholder="Stock Total"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="image" className="form-label">URL de la imagen</label>
          <input
            id="image"
            type="text"
            placeholder="URL de la imagen"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="category" className="form-label">Categoría</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
          >
            <option value="">Selecciona una categoría</option>
            <option value="Shirts">Shirts</option>
            <option value="Hoodies">Hoodies</option>
            <option value="Jeans">Jeans</option>
            <option value="Caps">Caps</option>
            <option value="Sneakers">Sneakers</option>
          </select>
        </div>

        {/* Stock por talla */}
        {Object.keys(stockBySize).length > 0 && (
          <div className="form-group">
            <label className="form-label">Stock por Talla</label>
            {Object.keys(stockBySize).map((size) => (
              <div key={size} className="form-group">
                <label htmlFor={`stock-${size}`}>Talla {size}</label>
                <input
                  id={`stock-${size}`}
                  type="number"
                  value={stockBySize[size]}
                  onChange={(e) => handleStockChange(size, parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Agregando..." : "Agregar Producto"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
