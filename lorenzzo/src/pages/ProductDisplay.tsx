import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ProductDisplay.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stockBySize: Record<string, number>; // Tallas disponibles con su stock
  stock: number; // Stock total
  providerId: string; // Agregamos providerId para evitar errores
  quantity?: number;
}

const ProductDisplay: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const categories = [
    "Todos",
    "Sneakers",
    "Jeans",
    "Shirts",
    "Caps",
    "Hoodies",
    "Adds",
  ];
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const { cart, addToCart } = useCart();
  const [role, setRole] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get("/products");
        const productsWithStock = response.data.map((product: any) => ({
          ...product,
          stock: Object.values(product.stockBySize as Record<string, number>).reduce(
            (total, value) => total + value,
            0
          ), // Calcular el stock total basado en stockBySize
        }));

        setProducts(productsWithStock);
        setFilteredProducts(productsWithStock);
      } catch (err: any) {
        console.error("Error al cargar los productos:", err);
        setError("Error al cargar los productos");
        toast.error("No se pudieron cargar los productos.");
      }
    };

    const fetchUserRole = () => {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setRole(decodedToken.role);
      }
    };

    fetchProducts();
    fetchUserRole();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredProducts(
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(value) &&
          (selectedCategory === "Todos" ||
            product.category === selectedCategory)
      )
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "Todos") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) => product.category === category
      );
      setFilteredProducts(filtered);
    }
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prevSizes) => ({
      ...prevSizes,
      [productId]: size,
    }));
  };

  const handleAddToCart = (product: Product) => {
    const size = selectedSizes[product._id];
    if (!size) {
      toast.error("Debes seleccionar una talla.");
      return;
    }

    const currentCartItem = cart.find(
      (item) => item._id === product._id && item.size === size
    );

    const quantityInCart = currentCartItem ? currentCartItem.quantity : 0;
    const stockAvailable = product.stockBySize[size];

    if (quantityInCart + 1 > stockAvailable) {
      toast.error(`No hay suficiente stock para "${product.name}" en talla ${size}.`);
      return;
    }

    addToCart({ ...product, quantity: 1, size });
    toast.success(`Producto "${product.name}" añadido al carrito.`);
  };

  return (
    <div className="product-display">
      <h1>Productos Disponibles</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="filter-container">
        <div className="category-filter">
          <label htmlFor="category-select">Categoría:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">${product.price.toFixed(2)}</p>

              {product.stockBySize && Object.keys(product.stockBySize).length > 0 && (
                <div className="size-selector">
                  <label htmlFor={`size-select-${product._id}`}>Talla:</label>
                  <select
                    id={`size-select-${product._id}`}
                    onChange={(e) =>
                      handleSizeChange(product._id, e.target.value)
                    }
                    value={selectedSizes[product._id] || ""}
                  >
                    <option value="">Selecciona una talla</option>
                    {Object.keys(product.stockBySize).map((size) => (
                      <option key={size} value={size}>
                        {size} - {product.stockBySize[size]} en stock
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Link to={`/products/${product._id}`} className="product-link">
                Ver Detalles
              </Link>

              {role === "cliente" && (
                <button
                  onClick={() => handleAddToCart(product)}
                  className="add-to-cart-btn"
                >
                  Añadir al Carrito
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="no-products">No se encontraron productos</p>
        )}
      </div>
    </div>
  );
};

export default ProductDisplay;
