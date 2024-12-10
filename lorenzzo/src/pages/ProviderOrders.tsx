import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles/ProviderOrders.css";
import { toast } from "react-toastify";

const ProviderOrders: React.FC = () => {
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

        const response = await API.get("/orders/related", {
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Usuario no autenticado. Por favor, inicia sesión.");
        return;
      }

      await API.put(
        `/orders/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );

      toast.success("Estado actualizado correctamente");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al actualizar estado");
    }
  };

  if (loading) {
    return <p className="loading-message">Cargando pedidos...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="provider-orders-container">
      <h1 className="orders-title">Pedidos Relacionados</h1>
      {orders.length === 0 ? (
        <p>No tienes pedidos relacionados.</p>
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
              <div className="products-list">
                <h4>Productos:</h4>
                {order.products.map((product: any) => (
                  <div key={product.productId._id} className="product-item">
                    <p>{product.productId.name}</p>
                    <p>Cantidad: {product.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="order-actions">
                <button
                  onClick={() => updateOrderStatus(order._id, "en proceso")}
                  className="process-btn"
                  disabled={order.status === "en proceso" || order.status === "completado"}
                >
                  Marcar como En Proceso
                </button>
                <button
                  onClick={() => updateOrderStatus(order._id, "completado")}
                  className="complete-btn"
                  disabled={order.status === "completado"}
                >
                  Marcar como Completado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderOrders;
