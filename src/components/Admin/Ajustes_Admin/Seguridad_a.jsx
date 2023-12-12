import React, { useState } from "react";
import "./Style.css";
import Enlaces_a from "./Enlaces_a";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Seguridad_a = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const openPasswordModal = () => {
    MySwal.fire({
      title: "Actualizar Contraseña",
      html: (
        <div>
          <div className="message">
            <div className="icon">
              <ErrorOutlineIcon />
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
        </div>
      ),
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        // Aquí puedes realizar la lógica para manejar el submit del formulario
        // Puedes enviar los datos al servidor, validar, etc.
        // Devuelve una promesa resuelta o rechazada según el resultado
        return new Promise((resolve, reject) => {
          // Puedes agregar la lógica de validación aquí
          if (newPassword !== confirmPassword) {
            reject(new Error("Las contraseñas no coinciden"));
          } else {
            // Resuelve la promesa con los datos del formulario
            resolve({ currentPassword, newPassword, confirmPassword });
          }
        });
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí puedes realizar acciones después de que el usuario hace clic en "Actualizar"
        // result.value contendrá los datos del formulario
        console.log("Contraseña actualizada:", result.value);
      }
    });
  };

  return (
    <div className="ajustes_seguridad">
      <div className="content">
        <h2>Ajustes</h2>
        <Enlaces_a />

        <div className="text">
          <p>Actualización de contraseña</p>
          <button onClick={openPasswordModal}>Actualizar contraseña</button>
        </div>
      </div>
    </div>
  );
};

export default Seguridad_a;
