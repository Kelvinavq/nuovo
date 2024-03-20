import "./Style.css";
import logotipo from "../../assets/images/nuovo.png";
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import Config from "../../Config";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { LanguageContext } from "../../Language/LanguageContext";
import { TranslationRegister } from "../../Language/TranslationRegister";

import imgDni from "../../assets/images/dni.png";
import ImgSelfie from "../../assets/images/selfie.jpg";
import Spinner from "../Spinner/Spinner";

const MySwal = withReactContent(Swal);

const Register_Form = () => {
  const { language } = useContext(LanguageContext);

  // Estados para los campos del formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const [dniFileName, setDniFileName] = useState("");
  const [dniBackFileName, setDniBackFileName] = useState("");
  const [selfieFileName, setSelfieFileName] = useState("");

  // Estado para la validación del número de teléfono
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

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
  
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("address", address);
      formData.append("password", password);
      formData.append("dni", document.getElementById("dni").files[0]);
      formData.append("dniBack", document.getElementById("dniBack").files[0]);
      formData.append("selfie", document.getElementById("selfie").files[0]);
  
      const response = await fetch(`${Config.backendBaseUrl}usuarios.php`, {
        method: "POST",
        body: formData,
        mode: "cors",
        credentials: "include",
      });
  
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
    } else if (dniFileName === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationRegister[language].swal9,
      });
      return false;
    } else if (dniBackFileName === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationRegister[language].swal10,
      });
      return false;
    } else if (selfieFileName === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: TranslationRegister[language].swal11,

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

  const openModal = (modalConfig) => {
    MySwal.fire({
      text: modalConfig.text,
      imageUrl: modalConfig.imageUrl,
      imageWidth: 350,
      imageHeight: 250,
      imageAlt: "Img modal",
    });
  };

  const handleFileChange = (event, setFileName) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  return (
    <div className="register">
         {isLoading ? <Spinner /> : null}
      <form onSubmit={handleSubmit}>
        <div>
          <div className="content">
            <img src={logotipo} alt="logotipo nuovotech" />
            <p>{TranslationRegister[language].title}</p>
          </div>

          <div className="inputs">
            <div className="grupo-input">
              <label htmlFor="name">
                {TranslationRegister[language].label1}
              </label>
              <input
                type="text"
                placeholder={TranslationRegister[language].input1}
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grupo-input">
              <label htmlFor="email">
                {TranslationRegister[language].label2}
              </label>
              <input
                type="email"
                placeholder={TranslationRegister[language].input2}
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grupo-input">
              <label htmlFor="password">
                {TranslationRegister[language].label3}
              </label>
              <input
                type="password"
                placeholder={TranslationRegister[language].input3}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grupo-input ">
              <label htmlFor="phoneNumber">
                {TranslationRegister[language].label4}
              </label>
              <PhoneInput
                id="phoneNumber"
                country={"ar"}
                value={phoneNumber}
                onChange={handlePhoneChange}
              />
            </div>

            <div className="grupo-input">
              <label htmlFor="address">
                {TranslationRegister[language].label5}
              </label>
              <input
                type="text"
                placeholder={TranslationRegister[language].input5}
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/*  */}

            <div className="grupo-input">
              <label htmlFor="">{TranslationRegister[language].label7}</label>

              <div className="btnVerificacion">
                <label
                  htmlFor="dni"
                  onClick={() =>
                    openModal({
                      text: TranslationRegister[language].swal6,
                      imageUrl: imgDni,
                    })
                  }
                >
                  <CloudUploadIcon />
                  {TranslationRegister[language].label8}
                </label>
                <input
                  type="file"
                  name="dni"
                  id="dni"
                  accept=".jpg, .jpeg, .png"
                  onChange={(e) => handleFileChange(e, setDniFileName)}
                />
              </div>
              <p>{dniFileName}</p>
            </div>

            <div className="grupo-input">
              <label htmlFor="">{TranslationRegister[language].label9}</label>
              <div className="btnVerificacion">
                <label
                  htmlFor="dniBack"
                  onClick={() =>
                    openModal({
                      text: TranslationRegister[language].swal7,
                      imageUrl: imgDni,
                    })
                  }
                >
                  <CloudUploadIcon />
                  {TranslationRegister[language].label10}
                </label>
                <input
                  type="file"
                  name="dniBack"
                  id="dniBack"
                  accept=".jpg, .jpeg, .png"
                  onChange={(e) => handleFileChange(e, setDniBackFileName)}
                />
              </div>
              <p>{dniBackFileName}</p>
            </div>

            <div className="grupo-input">
              <label htmlFor="">{TranslationRegister[language].label11}</label>

              <div className="btnVerificacion">
                <label
                  htmlFor="selfie"
                  onClick={() =>
                    openModal({
                      text: TranslationRegister[language].swal8,
                      imageUrl: ImgSelfie,
                    })
                  }
                >
                  <CloudUploadIcon />
                  {TranslationRegister[language].label12}
                </label>
                <input
                  type="file"
                  name="selfie"
                  id="selfie"
                  accept=".jpg, .jpeg, .png"
                  onChange={(e) => handleFileChange(e, setSelfieFileName)}
                />
              </div>
              <p>{selfieFileName}</p>
            </div>

            <div className="submit">
              <input
                type="submit"
                value={TranslationRegister[language].button}
              />
            </div>

            <div className="enlace">
              <p>
                {TranslationRegister[language].label6}{" "}
                <Link to="/login">{TranslationRegister[language].link}</Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register_Form;
