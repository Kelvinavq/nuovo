import React, { useState, useEffect, useContext } from "react";

import Depositar from "../../components/User/Depositos/Depositar";
import Sidebar from "../../components/User/sidebar/Sidebar";
import Button from "../../components/User/sidebar/Button";
import Lateral from "../../components/User/Lateral/Lateral";
import Notification from "../../components/User/Notification/Notification";
import Config from "../../Config";
import Loading from "../Loading";

import Swal from "sweetalert2";

const Depositos = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userRole = localStorage.getItem("user_role");
  const [showAlert, setShowAlert] = useState(false); 
  const [loading, setLoading] = useState(true);


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
          if (userRole !== "user") {
            setShowAlert(true);
            // Si el rol no es user, redirigir al usuario al inicio de sesión
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
  if (!isLoggedIn || showAlert) {
    return null;
  }

  
  return (
    <div className="depositos">
      <Sidebar />
      <Button />
      <Notification />

      <main>
        <Depositar  />
        <Lateral />
      </main>
    </div>
  );
};

export default Depositos;
