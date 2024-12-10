import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token no encontrado. Por favor, inicia sesión.");
          setLoading(false);
          return;
        }
    
        console.log("Enviando solicitud GET a /products con token:", token);
    
        const response = await API.get("/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        console.log("Productos obtenidos:", response.data);
        setProducts(response.data);
        setError("");
      } catch (err: any) {
        console.error("Error al obtener productos:", err.response || err);
        setError(err.response?.data?.message || "Error al obtener productos");
      } finally {
        setLoading(false);
      }
    };
    

    fetchProducts();
  }, []);

  const deleteProduct = async (productId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );
      alert("Producto eliminado exitosamente.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar producto");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Productos</h1>
      {loading && <p>Cargando productos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && products.length === 0 && <p>No hay productos disponibles.</p>}

      {!loading && products.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "8px" }}>Nombre</th>
              <th style={{ border: "1px solid black", padding: "8px" }}>Precio</th>
              <th style={{ border: "1px solid black", padding: "8px" }}>Stock</th>
              <th style={{ border: "1px solid black", padding: "8px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td style={{ border: "1px solid black", padding: "8px" }}>{product.name}</td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  ${product.price.toFixed(2)}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>{product.stock}</td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    style={{
                      padding: "8px",
                      backgroundColor: "#F44336",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      marginRight: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                    style={{
                      padding: "8px",
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProductList;
