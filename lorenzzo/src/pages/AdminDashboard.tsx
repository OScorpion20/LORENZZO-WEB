import React, { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [indicators, setIndicators] = useState({
    totalUsers: 0,
    activeProducts: 0,
    activeProviders: 0,
  });
  const [userError, setUserError] = useState("");
  const [productError, setProductError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUserError("Token no encontrado. Por favor, inicia sesión.");
          return;
        }

        const response = await API.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);

        const totalUsers = response.data.length;
        const activeProviders = response.data.filter(
          (user: any) => user.role === "proveedor" && user.status === "activo"
        ).length;

        setIndicators((prev) => ({
          ...prev,
          totalUsers,
          activeProviders,
        }));
      } catch (err: any) {
        console.error("Error al cargar usuarios:", err);
        setUserError(err.response?.data?.message || "Error al cargar usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setProductError("Token no encontrado. Por favor, inicia sesión.");
          return;
        }

        const response = await API.get("/products/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data);

        const activeProducts = response.data.filter(
          (product: any) => product.stock > 0
        ).length;

        setIndicators((prev) => ({
          ...prev,
          activeProducts,
        }));
      } catch (err: any) {
        console.error("Error al cargar productos:", err);
        setProductError(err.response?.data?.message || "Error al cargar productos");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchUsers();
    fetchProducts();
  }, []);

  const editUser = async (user: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserError("Token no encontrado. Por favor, inicia sesión.");
        return;
      }

      const response = await API.put(
        `/admin/users/${user._id}`,
        { name: user.name, email: user.email, status: user.status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === user._id ? response.data.user : u))
      );

      setEditingUser(null);
      toast.success("Usuario editado exitosamente.");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error al editar usuario.";
      toast.error(errorMessage);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserError("Token no encontrado. Por favor, inicia sesión.");
        return;
      }

      await API.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      toast.success("Usuario eliminado exitosamente.");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error al eliminar usuario.";
      toast.error(errorMessage);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setProductError("Token no encontrado. Por favor, inicia sesión.");
        return;
      }

      await API.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );

      toast.success("Producto eliminado exitosamente.");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error al eliminar producto.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <h1 className="dashboard-title">Panel Administrativo</h1>

      <div className="indicators-container">
        <div className="indicator-card">
          <h3>Número Total de Usuarios Registrados</h3>
          <p>{indicators.totalUsers}</p>
        </div>
        <div className="indicator-card">
          <h3>Cantidad de Productos Activos</h3>
          <p>{indicators.activeProducts}</p>
        </div>
        <div className="indicator-card">
          <h3>Cantidad de Proveedores Activos</h3>
          <p>{indicators.activeProviders}</p>
        </div>
      </div>

      <h2 className="section-title">Usuarios</h2>
      {loadingUsers ? (
        <p className="loading">Cargando usuarios...</p>
      ) : userError ? (
        <p className="error-message">{userError}</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  {editingUser && editingUser._id === user._id ? (
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, name: e.target.value })
                      }
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingUser && editingUser._id === user._id ? (
                    <input
                      type="text"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, email: e.target.value })
                      }
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>{user.role}</td>
                <td>
                  {editingUser && editingUser._id === user._id ? (
                    <select
                      value={editingUser.status}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, status: e.target.value })
                      }
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  ) : (
                    user.status
                  )}
                </td>
                <td>
                  {editingUser && editingUser._id === user._id ? (
                    <button
                      onClick={() => editUser(editingUser)}
                      className="save-button"
                    >
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingUser(user)}
                      className="edit-button"
                    >
                      Editar
                    </button>
                  )}
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="delete-button"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="section-title">Productos</h2>
      {loadingProducts ? (
        <p className="loading">Cargando productos...</p>
      ) : productError ? (
        <p className="error-message">{productError}</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="delete-button"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
