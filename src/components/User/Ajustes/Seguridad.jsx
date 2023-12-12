import React, { useState } from "react";
import Swal from "sweetalert2";
import Enlaces from "./Enlaces";
import Saldo from "../Saldo/Saldo";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";


const Seguridad = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPasswordModal = () => {
    setIsModalOpen(true);
  };

  const closePasswordModal = ()  => {
    setIsModalOpen(false);
    // Limpiar los estados al cerrar el modal si es necesario
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleUpdatePassword = async (e)  => {
    e.preventDefault();
  
    // Validar la longitud mínima de las contraseñas
    if (
      currentPassword.length < 8 ||
      newPassword.length < 8 ||
      confirmPassword.length < 8
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas deben tener al menos 8 caracteres",
      });
      return;
    }
  
    // Validar que la nueva contraseña y la confirmación coincidan
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas nuevas no coinciden",
      });
      return;
    }
  
    // Enviar la solicitud al backend
    try {
      const response = await fetch(
        "http://localhost/nuovo/backend/api/updatePassword.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
          credentials: "include",
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        // Procesar la respuesta exitosa
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: data.message,
        });
        closePasswordModal();
      } else {
        // Procesar la respuesta de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Hubo un error al actualizar la contraseña",
        });
      }
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error inesperado al actualizar la contraseña",
      });
    }
  };

  return (
    <div className="ajustes_seguridad">
 
      <Saldo />
      <div className="content">
        <h2>Ajustes</h2>
        <Enlaces />
        <div className="text">
          <p>Actualización de contraseña</p>
          <button onClick={openPasswordModal}>Actualizar contraseña</button>
        </div>
      </div>
           {isModalOpen && (
        <div className="modal" >
          <div className="overlay" onClick={closePasswordModal}></div>
          <div className="modal-content">
            <div className="message">
              <div className="icon">
                <ErrorOutlineOutlinedIcon />
                <span>Proteja su cuenta</span>
              </div>

              <div className="text">
                <p>
                  Nunca utilice una contraseña utilizada anteriormente o una
                  contraseña que utiliza en otro servicio
                </p>
              </div>
            </div>
            <div className="grupo-input">
              <label htmlFor="currentPassword">Contraseña Actual:</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grupo-input">
              <label htmlFor="newPassword">Nueva Contraseña:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grupo-input">
              <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="button-group">
              <button onClick={handleUpdatePassword}>Actualizar</button>
              <button onClick={closePasswordModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seguridad;
