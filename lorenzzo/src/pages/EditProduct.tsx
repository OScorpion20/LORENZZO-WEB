import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/EditProduct.css";

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
        "21", "21.5", "22", "22.5", "23", "23.5", "24", "24.5", "25",
        "25.5", "26", "26.5", "27", "27.5", "28", "28.5", "29", "29.5", "30",
      ];
    default:
      return [];
  }
};

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [stockBySize, setStockBySize] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/products/${id}`);
        setProduct(response.data);
        setStockBySize(response.data.stockBySize || {});
      } catch (err: any) {
        setError("Error al cargar el producto");
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.category) {
      const availableSizes = getAvailableSizes(product.category);
      const updatedStockBySize = availableSizes.reduce((acc, size) => {
        acc[size] = stockBySize[size] || 0;
        return acc;
      }, {} as Record<string, number>);
      setStockBySize(updatedStockBySize);
    }
  }, [product?.category]);

  const handleStockChange = (size: string, stock: number) => {
    setStockBySize((prev) => ({
      ...prev,
      [size]: stock,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedProduct = {
        ...product,
        stockBySize,
      };

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró un token de autenticación. Por favor, inicia sesión.");
        return;
      }

      const response = await API.put(`/products/${id}`, updatedProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Producto actualizado exitosamente");
      setProduct(response.data);
      navigate(`/products`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar el producto");
    }
  };

  return (
    <div className="edit-product-container">
      <h2 className="edit-product-title">Editar Producto</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      {product && (
        <form onSubmit={handleSubmit} className="edit-product-form">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-input"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Precio</label>
            <input
              type="number"
              className="form-input"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Stock Total</label>
            <input
              type="number"
              className="form-input"
              value={product.stock}
              onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Imagen (URL)</label>
            <input
              type="text"
              className="form-input"
              value={product.image}
              onChange={(e) => setProduct({ ...product, image: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
              value={product.category}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
            >
              <option value="Shirts">Camisetas</option>
              <option value="Hoodies">Sudaderas</option>
              <option value="Jeans">Jeans</option>
              <option value="Caps">Gorras</option>
              <option value="Sneakers">Tenis</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Stock por Talla</label>
            <div className="tallas-container">
              {Object.keys(stockBySize).map((size) => (
                <div key={size} className="talla-row">
                  <span className="talla-label">{size}</span>
                  <input
                    type="number"
                    className="talla-stock-input"
                    value={stockBySize[size]}
                    onChange={(e) => handleStockChange(size, Number(e.target.value))}
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-button">Actualizar Producto</button>
        </form>
      )}
    </div>
  );
};

export default EditProduct;
