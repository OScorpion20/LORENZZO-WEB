import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaBoxOpen,
  FaPlusCircle,
  FaListAlt,
  FaSignInAlt,
  FaSignOutAlt,
  FaThList,
  FaTools,
  FaClipboardList,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; // Importar el contexto de autenticación

const Navbar: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuth(); // Acceder al usuario, logout y estado de autenticación
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Cerrar sesión usando el contexto
    navigate("/login");
  };

  return (
    <nav
      style={{
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8f8f8",
        borderBottom: "1px solid #ccc",
      }}
    >
      {/* Título o Logo */}
      <div>
        <Link
          to="/"
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textDecoration: "none",
            color: "black",
          }}
        >
          LORENZZO
        </Link>
      </div>

      {/* Navegación */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {user?.role === "cliente" && (
          <>
            <Link
              to="/products-display"
              style={{
                textDecoration: "none",
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaBoxOpen />
            </Link>
            <Link
              to="/cart"
              style={{
                textDecoration: "none",
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaShoppingCart />
            </Link>
            <Link
              to="/order-tracking"
              style={{
                textDecoration: "none",
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaThList />
              Mis Pedidos
            </Link>
          </>
        )}

        {(user?.role === "proveedor" || user?.role === "administrador") && (
          <Link
            to="/provider-orders"
            style={{
              textDecoration: "none",
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaClipboardList />
            Pedidos Relacionados
          </Link>
        )}

        {user?.role === "proveedor" && (
          <>
            <Link
              to="/products"
              style={{
                textDecoration: "none",
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaListAlt />
              Mis Productos
            </Link>
            <Link
              to="/add-product"
              style={{
                textDecoration: "none",
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaPlusCircle />
              Agregar Producto
            </Link>
            <Link
              to="/products-display"
              style={{
                textDecoration: "none",
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaThList />
              Ver Todos los Productos
            </Link>
          </>
        )}

        {user?.role === "administrador" && (
          <>
            <Link
              to="/admin"
              style={{
                textDecoration: "none",
                color: "#000",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaTools />
              Panel Administrativo
            </Link>
            <Link
              to="/products"
              style={{
                textDecoration: "none",
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaListAlt />
              Mis Productos
            </Link>
            <Link
              to="/add-product"
              style={{
                textDecoration: "none",
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaPlusCircle />
              Agregar Producto
            </Link>
            <Link
              to="/products-display"
              style={{
                textDecoration: "none",
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaThList />
              Ver Todos los Productos
            </Link>
          </>
        )}

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 15px",
              backgroundColor: "#FF6347",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaSignOutAlt />
            Cerrar Sesión
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "10px 15px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaSignInAlt />
            Iniciar Sesión
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
