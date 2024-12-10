import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string; // Agregamos el campo de talla
  stock: number; // Agregamos stock
  image?: string;
  providerId: string; 
}

interface CartContextProps {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateCartItem: (id: string, quantity: number, size?: string) => void;
  total: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const storedCart = localStorage.getItem(`cart_${userId}`);
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }
  }, [cart, userId]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingProduct = prev.find(
        (item) => item._id === product._id && item.size === product.size // Comparar también por talla
      );
      if (existingProduct) {
        if (existingProduct.quantity + product.quantity > existingProduct.stock) {
          toast.error(`No hay suficiente stock para "${product.name}"`);
          return prev;
        }
        return prev.map((item) =>
          item._id === product._id && item.size === product.size
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }
      if (product.quantity > product.stock) {
        toast.error(`No hay suficiente stock para "${product.name}"`);
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const clearCart = () => {
    setCart([]); // Limpia el carrito
    toast.success("Carrito vaciado correctamente."); // Opcional: notificación
  };

  const updateCartItem = (id: string, quantity: number, size?: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          if (quantity > item.stock) {
            toast.error(`Stock insuficiente para "${item.name}"`);
            return item; // No actualizamos si excede el stock
          }
          return {
            ...item,
            quantity: quantity !== undefined ? quantity : item.quantity,
            size: size !== undefined ? size : item.size,
          };
        }
        return item;
      })
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateCartItem, total }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
};
