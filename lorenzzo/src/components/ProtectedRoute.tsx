import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode; // Componente hijo que se mostrará si el usuario está autorizado
  allowedRoles: string[]; // Roles permitidos para acceder a esta ruta
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Si no hay token, redirige al inicio de sesión
    return <Navigate to="/login" />;
  }

  try {
    // Decodificar el token para obtener el rol del usuario
    const decodedToken: any = JSON.parse(atob(token.split(".")[1])); // Decodificar la sección payload del token
    const userRole = decodedToken.role;

    if (!allowedRoles.includes(userRole)) {
      // Si el rol del usuario no está permitido, redirige a un acceso denegado
      return <Navigate to="/not-authorized" />;
    }

    // Si el rol está permitido, renderiza el componente hijo
    return <>{children}</>;
  } catch (error) {
    console.error("Error decodificando el token:", error);
    // Si hay un error al decodificar el token, redirige al inicio de sesión
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
