import Saldo from "../Saldo/Saldo";
import Enlaces from "./Enlaces";
import "./Style.css";
import { useState, useEffect } from "react";

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import imgDni from "../../../assets/images/dni.png";
import ImgSelfie from "../../../assets/images/selfie.jpg";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Verificacion = () => {
  const openModal = (modalConfig) => {
    MySwal.fire({
      text: modalConfig.text,
      imageUrl: modalConfig.imageUrl,
      imageWidth: 350,
      imageHeight: 250,
      imageAlt: "Imagen modal",
    });
  };

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [content, setContent] = useState(null);

  function refreshPage() {
    window.location.reload(false);
  }

  const [dniFront, setDniFront] = useState(null);
  const [dniSelfie, setDniSelfie] = useState(null);
  const [dniBack, setDniBack] = useState(null);

  const [isDniFrontUploaded, setIsDniFrontUploaded] = useState(false);

  const handleDniFrontChange = (e) => {
    const file = e.target.files[0];
    setDniFront(file);
    setIsDniFrontUploaded(true);
  };

  const handleDniSelfieChange = (e) => {
    const file = e.target.files[0];
    setDniSelfie(file);
  };

  const handleDniBackChange = (e) => {
    const file = e.target.files[0];
    setDniBack(file);
  };

  const handleUpload = async () => {
    // Validar que ambos archivos estén seleccionados
    if (!dniFront || !dniSelfie || !dniBack) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes seleccionar las tres imágenes",
      });
      return;
    }

    const formData = new FormData();
    formData.append("dniFront", dniFront);
    formData.append("dniBack", dniBack);
    formData.append("dniSelfie", dniSelfie);

    try {
      const response = await fetch(
        "https://digitalvibra.com/nuovo_backend/backend/Api/uploadVerification.php",
        {
          method: "POST",
          body: formData,
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
          didClose: () => {
            refreshPage();
          },
        });
      } else {
        // Procesar la respuesta de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Hubo un error al subir las imágenes",
        });
      }
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error inesperado al subir las imágenes",
      });
    }
  };

  useEffect(() => {
    // Obtener estado de verificación al cargar el componente
    fetch("https://digitalvibra.com/nuovo_backend/backend/Api/getVerificationStatus.php", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error de red: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setVerificationStatus(data.status);
        setContent(data.content); // Almacena el contenido en la variable
      })
      .catch((error) =>
        console.error("Error al obtener el estado de verificación:", error)
      );
  }, []);

  return (
    <div className="ajustes_verificacion">
      <Saldo />

      <div className="content">
        <h2>Verificación de Identidad</h2>

        <Enlaces />

        {verificationStatus === "pending" && (
          <div className={`estatus active ${verificationStatus}`}>
            <div className="danger">
              <DangerousOutlinedIcon />
              <span>Su cuenta está en proceso de verificación</span>
            </div>

            <div className="text">
              <p>
                La solicitud de verificación de su cuenta está en proceso. Le
                notificaremos una vez se complete.
              </p>
            </div>
          </div>
        )}

        {verificationStatus === "approved" && (
          <div className="verificado active ">
            <VerifiedIcon />
            <p>SU CUENTA ESTÁ VERIFICADA.</p>
          </div>
        )}

        {verificationStatus === "denied" && (
          <div className="estatus active">
            <div className="danger">
              <DangerousOutlinedIcon />
              <span>Su solicitud de verificación ha sido denegada</span>
            </div>

            <div className="text">
              <p>
                Lamentablemente, su solicitud de verificación ha sido denegada.
                Si tiene alguna pregunta, no dude en contactarnos.
              </p>
              <p>El motivo por el cual su solicitud ha sido denegada es:</p>
              <p>{content}</p>
              <p>
                Por favor, verifique y suba ambas fotografias nuevamente
                siguiendo las instrucciones correspondientes
              </p>
            </div>
            <div className="fotosVerificacion">
              {/* selfie dni */}
              {!dniFront && !dniBack && !dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="selfie"
                    onClick={() =>
                      openModal({
                        text: "Por favor, asegúrate de que la foto del selfie sea clara y legible. Todos los detalles, incluyendo el rostro y cualquier información adicional requerida, deben ser fácilmente distinguibles. Evita sombras, desenfoques o reflejos que puedan afectar la calidad de la imagen.",
                        imageUrl: ImgSelfie,
                      })
                    }
                  >
                    Subir Foto Selfie
                  </label>
                  <input
                    type="file"
                    name="selfie"
                    id="selfie"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniFrontChange}
                  />
                </div>
              )}

              {/* dni */}
              {dniFront && !dniBack && !dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="dni"
                    onClick={() =>
                      openModal({
                        text: "Por favor, asegúrate de que la foto del DNI sea clara y legible. Todos los detalles, incluyendo el nombre, la fecha de nacimiento y la fotografía, deben ser fácilmente distinguibles. Evita sombras, desenfoques o reflejos que puedan afectar la calidad de la imagen.",
                        imageUrl: imgDni,
                      })
                    }
                  >
                    Subir Foto DNI
                  </label>
                  <input
                    type="file"
                    name="dni"
                    id="dni"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniSelfieChange}
                  />
                </div>
              )}

              {/* dni back */}
              {!dniBack && dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="dniBack"
                    onClick={() =>
                      openModal({
                        text: "Por favor, asegúrate de que la foto del dorso del DNI sea clara y legible. Todos los detalles deben ser fácilmente distinguibles. Evita sombras, desenfoques o reflejos que puedan afectar la calidad de la imagen.",
                        imageUrl: imgDni,
                      })
                    }
                  >
                    Subir Foto Dorso DNI
                  </label>
                  <input
                    type="file"
                    name="dniBack"
                    id="dniBack"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniBackChange}
                  />
                </div>
              )}

              {dniFront && dniBack && dniSelfie && (
                <button className="btnVerificacion" onClick={handleUpload}>
                  Enviar Verificación
                </button>
              )}

              {(dniFront || dniBack || dniSelfie) && (
                <div className="previews">
                  {dniFront && (
                    <div className="preview">
                      <p>Previsualización del Selfie con el DNI:</p>
                      <img
                        src={URL.createObjectURL(dniFront)}
                        alt="DNI Preview"
                      />
                    </div>
                  )}
              
                  {dniSelfie && (
                    <div className="preview">
                      <p>Previsualización del DNI:</p>
                      <img
                        src={URL.createObjectURL(dniSelfie)}
                        alt="Selfie Preview"
                      />
                    </div>
                  )}
                      {dniBack && (
                    <div className="preview">
                      <p>Previsualización del Dorso del DNI:</p>
                      <img
                        src={URL.createObjectURL(dniBack)}
                        alt="DNI Back Preview"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!verificationStatus && (
          <div className="estatus active">
            <div className="danger">
              <DangerousOutlinedIcon />
              <span>Su cuenta no se encuentra verificada</span>
            </div>

            <div className="text">
              <p>
                Para verificar su cuenta debe subir una foto de su documento de
                identidad legible y una foto selfie con el mismo.
                <ErrorOutlineOutlinedIcon />
              </p>
            </div>

            <div className="fotosVerificacion">
              {/* selfie dni */}
              {!dniFront && !dniBack && !dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="selfie"
                    onClick={() =>
                      openModal({
                        text: "Por favor, asegúrate de que la foto del selfie sea clara y legible. Todos los detalles, incluyendo el rostro y cualquier información adicional requerida, deben ser fácilmente distinguibles. Evita sombras, desenfoques o reflejos que puedan afectar la calidad de la imagen.",
                        imageUrl: ImgSelfie,
                      })
                    }
                  >
                    Subir Foto Selfie
                  </label>
                  <input
                    type="file"
                    name="selfie"
                    id="selfie"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniFrontChange}
                  />
                </div>
              )}

              {/* dni */}
              {dniFront && !dniBack && !dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="dni"
                    onClick={() =>
                      openModal({
                        text: "Por favor, asegúrate de que la foto del DNI sea clara y legible. Todos los detalles, incluyendo el nombre, la fecha de nacimiento y la fotografía, deben ser fácilmente distinguibles. Evita sombras, desenfoques o reflejos que puedan afectar la calidad de la imagen.",
                        imageUrl: imgDni,
                      })
                    }
                  >
                    Subir Foto DNI
                  </label>
                  <input
                    type="file"
                    name="dni"
                    id="dni"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniSelfieChange}
                  />
                </div>
              )}

              {/* dni back */}
              {!dniBack && dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="dniBack"
                    onClick={() =>
                      openModal({
                        text: "Por favor, asegúrate de que la foto del dorso del DNI sea clara y legible. Todos los detalles deben ser fácilmente distinguibles. Evita sombras, desenfoques o reflejos que puedan afectar la calidad de la imagen.",
                        imageUrl: imgDni,
                      })
                    }
                  >
                    Subir Foto Dorso DNI
                  </label>
                  <input
                    type="file"
                    name="dniBack"
                    id="dniBack"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniBackChange}
                  />
                </div>
              )}

              {dniFront && dniBack && dniSelfie && (
                <button className="btnVerificacion" onClick={handleUpload}>
                  Enviar Verificación
                </button>
              )}

              {(dniFront || dniBack || dniSelfie) && (
                <div className="previews">
                  {dniFront && (
                    <div className="preview">
                      <p>Previsualización del Selfie con el DNI:</p>
                      <img
                        src={URL.createObjectURL(dniFront)}
                        alt="DNI Preview"
                      />
                    </div>
                  )}
              
                  {dniSelfie && (
                    <div className="preview">
                      <p>Previsualización del DNI:</p>
                      <img
                        src={URL.createObjectURL(dniSelfie)}
                        alt="Selfie Preview"
                      />
                    </div>
                  )}
                      {dniBack && (
                    <div className="preview">
                      <p>Previsualización del Dorso del DNI:</p>
                      <img
                        src={URL.createObjectURL(dniBack)}
                        alt="DNI Back Preview"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verificacion;
