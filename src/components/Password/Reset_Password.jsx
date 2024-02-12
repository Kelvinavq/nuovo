import logotipo from "../../assets/images/nuovo.png";
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./Style.css";

import { LanguageContext } from "../../Language/LanguageContext";
import { TranslationResetPassword } from "../../Language/TranslationResetPassword";

const Reset_Password = () => {
  const { language } = useContext(LanguageContext);
  const [email, setEmail] = useState(null);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar el formato del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationResetPassword[language].SwalMessage1,
      });
      return;
    }

    try {
      // Realizar el fetch al backend para solicitar el restablecimiento de contraseña
      const response = await fetch("http://localhost/nuovo/backend/Api/resetPassword.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: TranslationResetPassword[language].SwalMessage2,
        });
      } else {
        // Mostrar mensaje de error
        const responseData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: TranslationResetPassword[language].SwalMessage3,

        });
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationResetPassword[language].SwalMessage4,
      });
    }

    // Limpiar el campo de correo electrónico después de enviar
    setEmail("");
  };

  return (
    <div className="resetPassword">
      <form onSubmit={handleSubmit}>
        <div className="content">
          <img src={logotipo} alt="logotipo nuovotech" />
          <h2>{TranslationResetPassword[language].title}</h2>
          <p>{TranslationResetPassword[language].text}</p>
        </div>

        <div className="inputs">
          <div className="grupo-input">
            <label htmlFor="email">{TranslationResetPassword[language].label1}</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder={TranslationResetPassword[language].input1}
              value={email}
              onChange={handleEmailChange}
            />
          </div>


          <div className="submit">
            <input type="submit" value={TranslationResetPassword[language].button} />
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

export default Reset_Password;
