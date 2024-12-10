import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import API from "../api";
import "react-toastify/dist/ReactToastify.css";
import "../styles/CartPage.css";

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartItem, clearCart, total } = useCart(); // Asegúrate de importar clearCart
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const mercadoPagoLink = "https://link.mercadopago.com.mx/lorenzzoweb"; // Link de pago de MercadoPago

  const validateStock = async (productId: string, size: string, quantity: number) => {
    try {
      const response = await API.get(`/products/${productId}`);
      const product = response.data;

      const availableStock = product.stockBySize[size];
      if (quantity > availableStock) {
        toast.error(`Stock insuficiente para "${product.name}" en talla ${size}.`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error al validar el stock:", error);
      toast.error("Error al validar el stock. Intenta de nuevo.");
      return false;
    }
  };

  const handleQuantityChange = async (productId: string, size: string, newQuantity: number) => {
    const isValid = await validateStock(productId, size, newQuantity);
    if (isValid) {
      updateCartItem(productId, newQuantity, size);
    }
  };

  const handlePayment = async () => {
    for (const item of cart) {
      const isValid = await validateStock(item._id, item.size!, item.quantity);
      if (!isValid) {
        return; // Detener el proceso de pago si algún producto tiene stock insuficiente
      }
    }

    setIsProcessingPayment(true);
    toast.info("Redirigiendo a Mercado Pago...");
    setTimeout(() => {
      window.location.href = mercadoPagoLink; // Redirige al link de pago
    }, 1500);
  };

  // Nueva función para simular el pedido
  const simulateOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Debes iniciar sesión para realizar una compra.");
        return;
      }
  
      const products = cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        size: item.size, // Incluir la talla seleccionada
        providerId: item.providerId, // Incluir el providerId del producto
      }));
  
      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
      console.log("Payload enviado:", { products, totalAmount });
  
      await API.post(
        "/orders/simulate-order",
        { products, totalAmount },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      toast.success("Compra simulada registrada exitosamente.");
      clearCart();
    } catch (err: any) {
      console.error("Error en simulateOrder:", err);
      toast.error(err.response?.data?.message || "Error al registrar la compra.");
    }
  };
  

  // Si el carrito está vacío, mostramos un mensaje
  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <p className="empty-cart-message">Tu carrito está vacío.</p>
        <button
          onClick={() => (window.location.href = "/products-display")}
          className="go-to-products-btn"
        >
          Ir a Productos
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Carrito de Compras</h1>

      {/* Listar los productos en el carrito */}
      {cart.map((item) => (
        <div key={item._id} className="cart-item">
          <div className="item-details">
            <img src={item.image} alt={item.name} className="item-image" />
            <div className="item-info">
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
              <p>
                <strong>Talla:</strong> {item.size}
              </p>
            </div>
          </div>

          <div className="item-actions">
            <label htmlFor={`quantity-${item._id}`}>Cantidad:</label>
            <input
              id={`quantity-${item._id}`}
              type="number"
              value={item.quantity}
              min="1"
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value);
                handleQuantityChange(item._id, item.size!, newQuantity);
              }}
              className="quantity-input"
            />
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "¿Estás seguro de que deseas eliminar este producto?"
                  )
                ) {
                  removeFromCart(item._id);
                  toast.success(`"${item.name}" eliminado del carrito.`);
                }
              }}
              className="remove-btn"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}

      {/* Mostrar total y los botones de acción */}
      <h2 className="cart-total">Total: ${total.toFixed(2)}</h2>
      <div className="cart-actions">
        <button
          onClick={handlePayment}
          disabled={isProcessingPayment}
          className="checkout-btn"
        >
          {isProcessingPayment ? "Procesando..." : "Proceder al Pago"}
        </button>
        <button onClick={simulateOrder} className="simulate-order-btn">
          Simular Compra
        </button>
      </div>

      {/* Nota debajo de los botones */}
      <p className="checkout-note">
        Nota: Asegúrate de ingresar la cantidad indicada. De lo contrario, la
        compra no procederá.
      </p>
    </div>
  );
};

export default CartPage;
