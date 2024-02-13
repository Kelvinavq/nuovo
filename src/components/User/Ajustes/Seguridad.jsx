import React, { useState, useContext } from "react";
import Swal from "sweetalert2";
import Enlaces from "./Enlaces";
import Saldo from "../Saldo/Saldo";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "./Translation";


const Seguridad = () => {
  const { language } = useContext(LanguageContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPasswordModal = () => {
    setIsModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsModalOpen(false);
    // Limpiar los estados al cerrar el modal si es necesario
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleUpdatePassword = async (e) => {
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
        text: Translation[language].swalMessage6,
      });
      return;
    }

    // Validar que la nueva contraseña y la confirmación coincidan
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: Translation[language].swalMessage7,
      });
      return;
    }

    // Enviar la solicitud al backend
    try {
      const response = await fetch(
        "http://localhost/nuovo/backend/Api/updatePassword.php",
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
        // console.log(data);
        // Procesar la respuesta exitosa
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: Translation[language].swalMessage8,
          timer: 5000,
          didClose: () => {
            window.location.reload();
          },
        });

        // Verificar si la notificación está relacionada con la actualización de contraseña
        if (data.type === "password_update") {
          // Puedes personalizar la notificación según tus necesidades
          Swal.fire({
            icon: "success",
            title: Translation[language].swalMessage9,
            text: Translation[language].swalMessage8,
            timer: 5000,
            didClose: () => {
              window.location.reload();
            },
          });
        }

        closePasswordModal();
      } else {
        // Procesar la respuesta de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: Translation[language].swalMessage10,
        });
      }
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: Translation[language].swalMessage11,
      });
    }
  };

  return (
    <div className="ajustes_seguridad">
      <Saldo />
      <div className="content">
        <h2>{Translation[language].titleSeguridad}</h2>
        <Enlaces />
        <div className="text">
          <p>{Translation[language].text10}</p>
          <button onClick={openPasswordModal}>{Translation[language].button2}</button>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal">
          <div className="overlay" onClick={closePasswordModal}></div>
          <div className="modal-content">
            <div className="message">
              <div className="icon">
                <ErrorOutlineOutlinedIcon />
                <span>{Translation[language].span4}</span>
              </div>

              <div className="text">
                <p>
                {Translation[language].text11}
                </p>
              </div>
            </div>
            <div className="grupo-input">
              <label htmlFor="currentPassword">{Translation[language].label4}</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grupo-input">
              <label htmlFor="newPassword">{Translation[language].label5}</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grupo-input">
              <label htmlFor="confirmPassword">{Translation[language].label6}</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="button-group">
              <button onClick={handleUpdatePassword}>{Translation[language].button3}</button>
              <button onClick={closePasswordModal}>{Translation[language].button4}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seguridad;
