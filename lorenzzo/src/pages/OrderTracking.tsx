import React, { useState, useEffect } from "react";
import API from "../api";
import "../styles/OrderTracking.css";

const OrderTracking: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Usuario no autenticado. Por favor, inicia sesión.");
          return;
        }

        const response = await API.get("/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="loading-message">Cargando pedidos...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="order-tracking-container">
      <h1 className="tracking-title">Mis Pedidos</h1>
      {orders.length === 0 ? (
        <p>No tienes pedidos registrados.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <h3>Pedido #{order._id}</h3>
              <p>
                <strong>Estado:</strong> {order.status}
              </p>
              <p>
                <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
              </p>
              <p>
                <strong>Fecha de Creación:</strong>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              {order.estimatedDelivery && (
                <p>
                  <strong>Entrega Estimada:</strong>{" "}
                  {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
              <div className="products-list">
                <h4>Productos:</h4>
                {order.products.map((product: any) => (
                  <div key={product.productId._id} className="product-item">
                    <p>{product.productId.name}</p>
                    <p>Cantidad: {product.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
