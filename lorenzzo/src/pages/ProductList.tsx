import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/ProductList.css";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<number>(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró un token de autenticación. Por favor, inicia sesión.");
          return;
        }

        // Obtener los productos del proveedor
        const response = await API.get("/products/provider", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar los productos");
      }
    };

    const fetchCompletedOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró un token de autenticación. Por favor, inicia sesión.");
          return;
        }
    
        // Obtener la cantidad de pedidos completados por el proveedor
        const response = await API.get("/orders/completed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Pedidos Completados:", response.data.completedOrders); // <-- Verifica la respuesta aquí
        setCompletedOrders(response.data.completedOrders || 0);
      } catch (err: any) {
        console.error("Error al cargar los pedidos completados:", err);
        setError("Error al cargar los pedidos completados.");
      }
    };
    
    

    fetchProducts();
    fetchCompletedOrders();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró un token de autenticación. Por favor, inicia sesión.");
          return;
        }

        // Llamada a la API para eliminar el producto
        await API.delete(`/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Eliminar el producto localmente en el estado
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== id)
        );
      } catch (err: any) {
        setError("Error al eliminar el producto");
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/edit-product/${id}`);
  };

  return (
    <div className="product-list-container">
      <h1 className="product-list-title">Mis Productos</h1>

      {/* Indicadores del Proveedor */}
      <div className="indicators-container">
        <div className="indicator-card">
          <h3>Cantidad de Productos Publicados</h3>
          <p>{products.length}</p>
        </div>
        <div className="indicator-card">
          <h3>Cantidad de Pedidos Completados</h3>
          <p>{completedOrders}</p>
        </div>
      </div>

      {/* Mostrar productos */}
      {error && <p className="error-message">{error}</p>}
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price}</p>
              <p className="product-stock">Stock: {product.stock}</p>
              <p className="product-category">Categoría: {product.category}</p>
              <div className="product-actions">
                <button onClick={() => handleEdit(product._id)} className="edit-button">
                  Editar
                </button>
                <button onClick={() => handleDelete(product._id)} className="delete-button">
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No tienes productos para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
