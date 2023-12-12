import React, { useState, useEffect, useContext } from "react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import Sidebar from "../../components/User/sidebar/Sidebar";
import Balance from "../../components/User/Balance/Balance";
import Lateral from "../../components/User/Lateral/Lateral";
import Recents from "../../components/User/Recents/Recents";
import Button from "../../components/User/sidebar/Button";

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost/nuovo/backend/api/check-session.php",
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
          }
        );

        const responseData = await response.json();

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          // Si la sesión no es válida, redirige al usuario al inicio de sesión
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Debes iniciar sesión para acceder a esta página.",
            timer: 3000,
            didClose: () => {
              window.location.href = "/login";
            },
          });
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
      }
    };

    // Llamar a la función para verificar la sesión
    checkAuthStatus();
  }, [history]);

  // Si el usuario no ha iniciado sesión, no renderizar el componente
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <Button />

      <main>
        <Balance />
        <Recents />
        <Lateral />
      </main>
    </div>
  );
};

export default Dashboard;
