import "./Style.css";
import logotipo from "../../assets/images/nuovo.png";
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import Config from "../../Config";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Swal from "sweetalert2";

import { LanguageContext } from "../../Language/LanguageContext";
import { TranslationRegister } from "../../Language/TranslationRegister";


const Register_Form = () => {
  const { language } = useContext(LanguageContext);

  // Estados para los campos del formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  // Estado para la validación del número de teléfono
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);

  // Manejar el cambio en el número de teléfono
  const handlePhoneChange = (value, data) => {
    setPhoneNumber(value);
    setIsPhoneNumberValid(validatePhoneNumber(value));
  };

  // Validar el formato del número de teléfono
  const validatePhoneNumber = (phoneNumber) => {
    const phoneNumberPattern = /^\+?[1-9]\d{1,14}$/;
    return phoneNumberPattern.test(phoneNumber);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validar campos antes de enviar al servidor
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(
        `${Config.backendBaseUrl}usuarios.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phoneNumber,
            address,
            password,
          }),
          mode: "cors",
          credentials: "include",
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        // Éxito en el registro
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: responseData.message,
          didClose: () => {
            window.location.href = "/login";
          },
        });
        clearForm();
      } else {
        // Error en el registro
        Swal.fire({
          icon: "error",
          title: "Error",
          text: responseData.message,
        });
      }
    
    } catch (error) {
      console.error("Error de red:", error);
      Swal.fire({
        icon: "error",
        title: "Error de Red",
        text: "Hubo un problema de red. Por favor, verifica tu conexión e inténtalo nuevamente.",
      });
    }
  };

  const validateForm = () => {
    // Realizar validaciones y mostrar mensajes de error
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationRegister[language].swal1,
      });
      return false;
    } else if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationRegister[language].swal2,
      });
      return false;
    } else if (password.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationRegister[language].swal3,
      });
      return false;
    } else if (phoneNumber.length < 7 || phoneNumber.length > 14) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationRegister[language].swal4,
      });
      return false;
    } else if (address.length < 12) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationRegister[language].swal5,
      });
      return false;
    }

    return true; // El formulario es válido y puede ser enviado
  };

  // Limpiar el formulario después del registro exitoso
  const clearForm = () => {
    setName("");
    setEmail("");
    setPhoneNumber("");
    setAddress("");
    setPassword("");
  };

  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div>
          <div className="content">
            <img src={logotipo} alt="logotipo nuovotech" />
            <p>{TranslationRegister[language].title}</p>
          </div>

          <div className="inputs">
            <div className="grupo-input">
              <label htmlFor="name">{TranslationRegister[language].label1}</label>
              <input
                type="text"
                placeholder={TranslationRegister[language].input1}
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grupo-input">
              <label htmlFor="email">{TranslationRegister[language].label2}</label>
              <input
                type="email"
                placeholder={TranslationRegister[language].input2}
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grupo-input">
              <label htmlFor="password">{TranslationRegister[language].label3}</label>
              <input
                type="password"
                placeholder={TranslationRegister[language].input3}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grupo-input ">
              <label htmlFor="phoneNumber">{TranslationRegister[language].label4}</label>
              <PhoneInput
                id="phoneNumber"
                country={"ar"}
                value={phoneNumber}
                onChange={handlePhoneChange}
              />
            </div>

            <div className="grupo-input">
              <label htmlFor="address">{TranslationRegister[language].label5}</label>
              <input
                type="text"
                placeholder={TranslationRegister[language].input5}
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="submit">
              <input type="submit" value={TranslationRegister[language].button} />
            </div>

            <div className="enlace">
              <p>
              {TranslationRegister[language].label6} <Link to="/login">{TranslationRegister[language].link}</Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register_Form;
