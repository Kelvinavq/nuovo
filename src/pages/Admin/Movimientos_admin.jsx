import React, { useState, useEffect, useContext } from "react";

import ListaMovimientos_a from "../../components/Admin/Movimientos_Admin/ListaMovimientos_a";
import Button_a from "../../components/admin/Sidebar_Admin/Button_a";
// import Sidebar_a from "../../components/Admin/Sidebar_Admin/Sidebar_a";

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Movimientos_admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userRole = localStorage.getItem("user_role");

  // Hook de historial para la redirección

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost/nuovo/backend/Api/check-session.php",
          {
            method: "POST",
            mode: "cors",
            credentials: "include",
          }
        );

        const responseData = await response.json();

        if (response.ok) {
          setIsLoggedIn(true);

          // Verificar el rol del usuario después de la autenticación
          if (userRole !== "admin") {
            // Si el rol no es admin, redirigir al usuario al inicio de sesión
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Acceso no permitido para el rol actual.",
              timer: 3000,
              didClose: () => {},
            });
          }
        } else {
          // Si la sesión no es válida, redirige al usuario al inicio de sesión
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Debes iniciar sesión para acceder a esta página.",
            timer: 3000,
            didClose: () => {},
          });
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
      }
    };

    // Llamar a la función para verificar la sesión
    checkAuthStatus();
  }, [history, userRole]);

  // Si el usuario no ha iniciado sesión o no tiene el rol adecuado, no renderizar el componente
  if (!isLoggedIn) {
    return null;
  }
  return (
    <div className="movimientos_a">
      {/* <Sidebar_a /> */}
      <Button_a />

      <main>
        <ListaMovimientos_a />
      </main>
    </div>
  );
};

export default Movimientos_admin;
