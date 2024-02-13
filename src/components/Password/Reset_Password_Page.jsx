import logotipo from "../../assets/images/nuovo.png";
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./Style.css";

import { LanguageContext } from "../../Language/LanguageContext";
import { TranslationResetPassword } from "../../Language/TranslationResetPassword";

const Reset_Password_Page = () => {
  const { language } = useContext(LanguageContext);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [token, setToken] = useState(false);

  useEffect(() => {
    // Validar la existencia del token aquí
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    setToken(token);

    if (!token) {
        Swal.fire({
            icon: "warning",
            title: TranslationResetPassword[language].swalTitle1,
            text: TranslationResetPassword[language].SwalMessage5,
            didClose: () =>{
                window.location = "/login"
            }
        })
    }else{
          // Realizar la validación del token con el backend
      validateToken(token);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch("http://localhost/nuovo/backend/Api/validateToken.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      });

      if (response.ok) {
        setTokenValid(true);
      } else {
        Swal.fire({
            icon: "warning",
            title: TranslationResetPassword[language].swalTitle2,
            didClose: () =>{
                window.location = "/login"
            }
        })
      }
    } catch (error) {
      console.error("Error al validar el token:", error);
      window.location = "/login"
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar las contraseñas
    if (password.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationResetPassword[language].SwalMessage6,
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationResetPassword[language].SwalMessage7,
      });
      return;
    }

    // Validar que el token sea válido
    if (!tokenValid) {
      // Token no válido, redirigir a /login
      window.location = "/login"
      return;
    }

    // Realizar el fetch para actualizar la contraseña
    try {
      const response = await fetch("http://localhost/nuovo/backend/Api/restorePassword.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          confirmPassword,
        }),
        mode: "cors",
        credentials: "include",
      });

      if (response.ok) {
        // Contraseña restablecida con éxito
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: TranslationResetPassword[language].SwalMessage8,
          timer: 3000,
          didClose: () =>{
            window.location = "/login"
        }
        });

      } else {
        // Manejar el caso de error al actualizar la contraseña
        console.error("Error al restablecer la contraseña");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: TranslationResetPassword[language].SwalMessage9,
        });
      }
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      // Manejar el error, mostrar mensaje al usuario, etc.
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al restablecer la contraseña",
      });
    }
  };
  return (
    <div className="resetPassword">
      <form onSubmit={handleSubmit}>
        <div className="content">
          <img src={logotipo} alt="logotipo nuovotech" />
          <h2>{TranslationResetPassword[language].title2}</h2>
        </div>

        <div className="inputs">
          <div className="grupo-input">
            <label htmlFor="password">{TranslationResetPassword[language].label2}</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder={TranslationResetPassword[language].place1}
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="grupo-input">
            <label htmlFor="confirmPassword">{TranslationResetPassword[language].label3}</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder={TranslationResetPassword[language].place2}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
          </div>

          <div className="submit">
            <input type="submit" value={TranslationResetPassword[language].button2} />
          </div>

          <div className="enlace">
            <p>
              <Link to="/login">{TranslationResetPassword[language].link}</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Reset_Password_Page;
