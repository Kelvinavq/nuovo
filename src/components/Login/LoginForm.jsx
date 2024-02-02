import "./Style.css";
import logotipo from "../../assets/images/nuovo.png";
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

import { LanguageContext } from "../../Language/LanguageContext";
import { TranslationLogin } from "../../Language/TranslationLogin";

const LoginForm = () => {
  const { language } = useContext(LanguageContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validar campos antes de enviar al servidor
    if (!validateForm()) {
      return;
    }

    // Enviar datos al servidor
    try {
      const response = await fetch(
        "http://localhost/nuovo/backend/Api/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
          mode: "cors",
          credentials: "include",
        }
      );

      const responseData = await response.json();
      if (response.ok) {
        localStorage.setItem("user_role", responseData.user_role);
        localStorage.setItem("user_id", responseData.user_id);

        if (responseData.user_role === "admin") {
          window.location.href = "/admin/dashboard";
          console.log(responseData);
        } else {
          console.log(responseData);

          window.location.href = "/user/dashboard";
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: responseData.message || "Correo o contraseña inválidos",
        });
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error inesperado al iniciar sesión",
      });
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { email, password } = formData;

    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: TranslationLogin[language].swalError,
        text: TranslationLogin[language].SwalMessage1,
      });
      return false;
    } else if (password.length < 8) {
      Swal.fire({
        icon: "error",
        title: TranslationLogin[language].swalError,
        text: TranslationLogin[language].SwalMessage2,
      });
      return false;
    }
    return true;
  };

  return (
    <div className="login">
      <form onSubmit={handleLogin}>
        <div className="content">
          <img src={logotipo} alt="logotipo nuovotech" />
          <h2>{TranslationLogin[language].title}</h2>
        </div>

        <div className="inputs">
          <div className="grupo-input">
            <label htmlFor="email">{TranslationLogin[language].label1}</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder={TranslationLogin[language].input1}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grupo-input">
            <label htmlFor="password">
              {TranslationLogin[language].label2}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder={TranslationLogin[language].input2}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="submit">
            <Link to="/user/forgot-password">
              {TranslationLogin[language].link}
            </Link>
            <input type="submit" value={TranslationLogin[language].button} />
          </div>

          <div className="enlace">
            <p>
              {TranslationLogin[language].label3}{" "}
              <Link to="/registro">{TranslationLogin[language].link2}</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
