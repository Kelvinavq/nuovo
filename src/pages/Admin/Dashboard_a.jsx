import React, { useState, useEffect } from "react";
import Sidebar_a from "../../components/Admin/Sidebar_Admin/Sidebar_a";
import Balance_a from "../../components/Admin/Balance_Admin/Balance_a";
import Grafico from "../../components/Admin/Grafico_Admin/Grafico";
import Lateral_a from "../../components/Admin/Lateral_Admin/Lateral_a";
import Button_a from "../../components/Admin/Sidebar_Admin/Button_a";
import Notification_a from "../../components/Admin/Notification_Admin/Notification_a";
import Config from "../../Config";
import Loading from "../Loading";

import Swal from "sweetalert2";

const Dashboard_a = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userRole = localStorage.getItem("user_role");
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false); 

  // Hook de historial para la redirección

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrl}check-session.php`,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
          }
        );
        
        const responseData = await response.json();

        if (response.ok) {
          setIsLoggedIn(true);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
          // Verificar el rol del usuario después de la autenticación
          if (userRole !== "admin") {
            setShowAlert(true);
            // Si el rol no es admin, redirigir al usuario al inicio de sesión
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Acceso no permitido para el rol actual.",
              timer: 3000,
              didClose: () => {
                window.history.back()
              },
            });
          }
        } else {
          setShowAlert(true);
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
  }, []);

  if (loading) {
    return <Loading />;
  }

  // Si el usuario no ha iniciado sesión o no tiene el rol adecuado, no renderizar el componente
  if (!isLoggedIn) {
    return null;
  }
  return (
    <div className="dashboard_a">
      <Sidebar_a />
      <Button_a />
      <Notification_a />

      <main>
        <Balance_a />
        <Grafico />
        <Lateral_a />
      </main>
    </div>
  );
};

export default Dashboard_a;
