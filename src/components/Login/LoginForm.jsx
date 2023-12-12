import "./Style.css";
import logotipo from "../../assets/images/nuovo.png";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const LoginForm = () => {
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
        "http://localhost/nuovo/backend/api/login.php",
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
        } else {
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
        title: "Error",
        text: "Ingrese un correo electrónico válido",
      });
      return false;
    } else if (password.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña debe contener al menos 8 carácteres",
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
          <h2>Iniciar Sesión</h2>
        </div>

        <div className="inputs">
          <div className="grupo-input">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grupo-input">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="submit">
            <Link to="/user/forgot-password">¿Olvidaste tu contraseña?</Link>
            <input type="submit" value="Ingresar" />
          </div>

          <div className="enlace">
            <p>
              ¿Aún no tienes una cuenta? <Link to="/registro">Regístrate</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
