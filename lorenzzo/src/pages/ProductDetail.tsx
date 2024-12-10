import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ProductDetail.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stockBySize: { [key: string]: number };  // Tallas disponibles con su stock
  stock?: number; // Total de stock
  providerId?: string; // ID del proveedor
  quantity?: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams(); // Obtener el ID del producto desde la URL
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/products/${id}`);
        console.log(response.data);  // Verifica los datos en la consola
        setProduct(response.data);
      } catch (err: any) {
        setError("No se pudo cargar el producto.");
        toast.error("Error al cargar el producto.");
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Debes seleccionar una talla.");
      return;
    }
    if (product && product.stockBySize[selectedSize] > 0) {
      addToCart({
        ...product,
        quantity: 1,
        size: selectedSize,
        providerId: product.providerId || "", // Asegura que `providerId` no sea undefined
        stock: product.stock || 0, // Asegura que `stock` no sea undefined
      });
      toast.success(`Producto "${product.name}" añadido al carrito.`);
    } else {
      toast.error(`No hay stock disponible para la talla ${selectedSize}.`);
    }
  };
  

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!product) {
    return <p className="loading-message">Cargando producto...</p>;
  }

  console.log("Datos del producto:", product); // Depuración

  return (
    <div className="product-detail-container">
      <h1 className="product-name">{product.name}</h1>
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />
      <p className="product-price"><strong>Precio:</strong> ${product.price.toFixed(2)}</p>
      <p className="product-description"><strong>Descripción:</strong> {product.description}</p>
      <p className="product-category"><strong>Categoría:</strong> {product.category}</p>

      {/* Renderizar Tallas Disponibles usando stockBySize */}
      {product && product.stockBySize && Object.keys(product.stockBySize).length > 0 ? (
        <div className="size-selector">
          <label htmlFor="size-select" className="size-label">Talla:</label>
          <select
            id="size-select"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="size-select"
          >
            <option value="">Selecciona una talla</option>
            {Object.keys(product.stockBySize).map((size) => (
              <option key={size} value={size}>
                {size} - {product.stockBySize[size] > 0 ? `${product.stockBySize[size]} en stock` : "Sin stock"}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p>No hay tallas disponibles para este producto.</p>
      )}

      <button
        onClick={handleAddToCart}
        className="add-to-cart-btn"
      >
        Añadir al Carrito
      </button>
    </div>
  );
};

export default ProductDetail;
