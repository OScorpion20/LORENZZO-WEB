import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductList from "./pages/AdminProductList";
import ProductList from "./pages/ProductList";
import AddProduct from "./pages/AddProduct";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditProduct from "./pages/EditProduct";
import ProductDisplay from "./pages/ProductDisplay";
import CartPage from "./pages/CartPage";
import Navbar from "./components/Navbar";
import ProductDetail from "./pages/ProductDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderTracking from "./pages/OrderTracking";
import ProviderOrders from "./pages/ProviderOrders";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext"; // Importar el AuthProvider
import "react-toastify/dist/ReactToastify.css";
import "./styles/Home.css"; // Importar los estilos del Home

function HomePage() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">LORENZZO como estilo de vida</h1>
        <p className="hero-subtitle">
          Las mejores marcas y atención para nuestros clientes en México
        </p>
        <button
          className="shop-button"
          onClick={() => (window.location.href = "/products-display")}
        >
          TODOS LOS PRODUCTOS
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      {/* Envuelve la aplicación con el AuthProvider */}
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar /> {/* Navbar global */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/add-product"
            element={
              <ProtectedRoute allowedRoles={["proveedor", "administrador"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["proveedor", "administrador"]}>
                <ProductList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["administrador"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={["administrador"]}>
                <AdminProductList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["administrador"]}>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-product/:id"
            element={
              <ProtectedRoute allowedRoles={["proveedor", "administrador"]}>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider-orders"
            element={
              <ProtectedRoute allowedRoles={["proveedor", "administrador"]}>
                <ProviderOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-tracking"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route path="/products-display" element={<ProductDisplay />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Página de acceso denegado */}
          <Route path="/not-authorized" element={<h1>Acceso Denegado</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
