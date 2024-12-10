import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API from "../api";
import "../styles/Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await API.post("/auth/login", { email, password });

      const token = response.data.token;
      localStorage.setItem("token", token);

      const decodedToken: any = jwtDecode(token);
      const userRole = decodedToken.role;

      // Validar si la cuenta está deshabilitada
      if (response.data.message === "Cuenta deshabilitada. Contacta al administrador.") {
        setError("Cuenta deshabilitada. Contacta al administrador.");
        localStorage.removeItem("token");
        return;
      }

      if (userRole === "administrador") {
        navigate("/admin");
      }

      if (userRole === "proveedor") {
        navigate("/add-product");
      }

      if (userRole === "cliente") {
        navigate("/products-display");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register"); // Redirigir a la página de registro
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-title">Inicio de Sesión</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>
          <button type="submit" className="submit-button">
            Iniciar Sesión
          </button>
        </form>
        <button
          onClick={handleRegisterRedirect}
          className="register-button" // Clase CSS para el botón de registro
        >
          Registrarse
        </button>
      </div>
    </div>
  );
};

export default Login;
